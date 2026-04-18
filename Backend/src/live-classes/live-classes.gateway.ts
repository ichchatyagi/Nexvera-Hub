import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { LiveClass } from './schemas/live-class.schema';
import {
  LiveClassMessage,
  LiveClassMessageDocument,
} from './schemas/live-class-message.schema';
import { LiveClassesService } from './live-classes.service';
import { AppConfigService } from '../app-config/app-config.service';
import { SendChatMessageDto } from './dto/live-class-chat.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { UserRole } from '../users/entities/user.entity';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

interface LiveClassClientData {
  userId: string;
  userRole: string;
  userName: string;
  liveClassId: string;
}

interface WhiteboardDrawEvent {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

type LayoutMode = 'WHITEBOARD_FOCUS' | 'VIDEO_FOCUS' | 'SPLIT' | 'CUSTOM';

interface NormalizedRect {
  x: number; // 0..1
  y: number; // 0..1
  w: number; // 0..1
  h: number; // 0..1
}

interface LayoutState {
  liveClassId: string;
  version: number; // increments on each accepted update
  mode: LayoutMode;
  video: NormalizedRect; // instructor video overlay rect
  updated_at: string; // ISO string
}

@WebSocketGateway({
  namespace: '/ws/live-classes',
  cors: { origin: true, credentials: true },
})
export class LiveClassesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(LiveClass.name)
    private readonly liveClassModel: Model<LiveClass>,
    @InjectModel(LiveClassMessage.name)
    private readonly messageModel: Model<LiveClassMessageDocument>,
    private readonly liveClassesService: LiveClassesService,
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfigService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  // Temporary in-memory state for whiteboard history (per session)
  // In production, this should use Redis or a persistent store
  private whiteboardHistory: Map<string, any[]> = new Map();
  private layoutState: Map<string, LayoutState> = new Map();

  // PROMPT 3: Tuition speaking state
  private pendingAudioRequests = new Map<
    string,
    Map<string, { userName: string; requestedAt: string }>
  >();
  private approvedSpeakers = new Map<string, Set<string>>();
  private readonly MAX_ACTIVE_SPEAKERS = 4;

  async handleConnection(client: Socket) {
    try {
      const { token, liveClassId } = client.handshake.query as {
        token?: string;
        liveClassId?: string;
      };

      if (!token || !liveClassId) {
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(String(token), {
        secret: this.appConfig.jwtSecret,
      });

      const lc = await this.liveClassesService.findById(String(liveClassId));

      const features = lc.features || {};
      if (lc.status === 'cancelled' || lc.status === 'ended') {
        client.emit('error', 'CLASS_NOT_ACTIVE');
        client.disconnect(true);
        return;
      }

      const data: LiveClassClientData = {
        userId: payload.sub,
        userRole: payload.role,
        userName: payload.name || payload.email.split('@')[0],
        liveClassId: String(liveClassId),
      };

      // Security check: Student must be enrolled
      if (data.userRole === UserRole.STUDENT) {
        const isEnrolled =
          await this.enrollmentsService.isActiveCourseEnrollment(
            lc.course_id.toString(),
            data.userId,
          );
        if (!isEnrolled) {
          client.emit('error', 'NOT_ENROLLED');
          client.disconnect(true);
          return;
        }
      }

      client.data = data;

      // Join room for this live class
      client.join(data.liveClassId);

      // Layout state (ALWAYS emit)
      let state = this.layoutState.get(data.liveClassId);
      if (!state) {
        state = {
          liveClassId: data.liveClassId,
          version: 1,
          mode: 'WHITEBOARD_FOCUS',
          video: { x: 0.7, y: 0.68, w: 0.28, h: (0.28 * 9) / 16 },
          updated_at: new Date().toISOString(),
        };
        this.layoutState.set(data.liveClassId, state);
      }
      client.emit('layout:state', state);

      // Optionally emit recent history on connect
      if (features.chat_enabled) {
        const recent = await this.messageModel
          .find({ live_class_id: new Types.ObjectId(data.liveClassId) })
          .sort({ created_at: -1 })
          .limit(50)
          .lean()
          .exec();

        client.emit('chat:history', recent.reverse());
      }

      // Whiteboard history
      if (features.whiteboard_enabled) {
        const drawHistory = this.whiteboardHistory.get(data.liveClassId) || [];
        client.emit('whiteboard:history', drawHistory);
      }
    } catch (err) {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    // No special cleanup for now; room membership is handled by socket.io
  }

  @SubscribeMessage('chat:message')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendChatMessageDto,
  ) {
    const data = client.data as LiveClassClientData | undefined;
    if (!data || !dto.message?.trim()) return;

    const lc = await this.liveClassesService.findById(data.liveClassId);
    if (
      !lc.features?.chat_enabled ||
      lc.status === 'cancelled' ||
      lc.status === 'ended'
    ) {
      return;
    }

    // Secondary security check
    if (data.userRole === UserRole.STUDENT) {
      const isEnrolled = await this.enrollmentsService.isActiveCourseEnrollment(
        lc.course_id.toString(),
        data.userId,
      );
      if (!isEnrolled) {
        client.emit('error', 'NOT_ENROLLED');
        client.disconnect(true);
        return;
      }
    }

    const doc = await this.messageModel.create({
      live_class_id: new Types.ObjectId(data.liveClassId),
      user_id: data.userId,
      user_role: data.userRole,
      user_name: data.userName,
      text: dto.message.trim(),
    });

    const payload = {
      id: doc._id,
      live_class_id: data.liveClassId,
      user_id: doc.user_id,
      user_role: doc.user_role,
      user_name: doc.user_name,
      text: doc.text,
      created_at: doc.created_at,
    };

    this.server.to(data.liveClassId).emit('chat:message', payload);
  }

  @SubscribeMessage('chat:history')
  async handleChatHistory(@ConnectedSocket() client: Socket) {
    const data = client.data as LiveClassClientData | undefined;
    if (!data) return;

    const lc = await this.liveClassesService.findById(data.liveClassId);
    if (
      !lc.features?.chat_enabled ||
      lc.status === 'cancelled' ||
      lc.status === 'ended'
    ) {
      return;
    }

    const recent = await this.messageModel
      .find({ live_class_id: new Types.ObjectId(data.liveClassId) })
      .sort({ created_at: -1 })
      .limit(50)
      .lean()
      .exec();

    client.emit('chat:history', recent.reverse());
  }

  // ─── Whiteboard ──────────────────────────────────────────────────────────

  @SubscribeMessage('whiteboard:draw')
  handleDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: WhiteboardDrawEvent,
  ) {
    const data = client.data as LiveClassClientData | undefined;
    if (!data) return;

    // SECURE: Only allow authorized roles to broadcast drawing events
    if (!['teacher', 'admin', 'moderator'].includes(data.userRole)) return;

    // Save to history
    const history = this.whiteboardHistory.get(data.liveClassId) || [];
    history.push(payload);
    this.whiteboardHistory.set(data.liveClassId, history);

    // Broadcast to others
    client.to(data.liveClassId).emit('whiteboard:draw', payload);
  }

  @SubscribeMessage('whiteboard:clear')
  handleClear(@ConnectedSocket() client: Socket) {
    const data = client.data as LiveClassClientData | undefined;
    if (!data) return;

    // SECURE: Only allow authorized roles to clear the whiteboard
    if (!['teacher', 'admin', 'moderator'].includes(data.userRole)) return;

    this.whiteboardHistory.set(data.liveClassId, []);
    this.server.to(data.liveClassId).emit('whiteboard:clear');
  }

  @SubscribeMessage('whiteboard:history')
  handleWhiteboardHistory(@ConnectedSocket() client: Socket) {
    const data = client.data as LiveClassClientData | undefined;
    if (!data) return;
    const history = this.whiteboardHistory.get(data.liveClassId) || [];
    client.emit('whiteboard:history', history);
  }

  @SubscribeMessage('layout:update')
  handleLayoutUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: Partial<{ mode: LayoutMode; video: Partial<NormalizedRect> }>,
  ) {
    const data = client.data as LiveClassClientData | undefined;
    if (!data) return;

    // Security: only allow roles teacher, admin, moderator
    if (!['teacher', 'admin', 'moderator'].includes(data.userRole)) return;

    const liveClassId = data.liveClassId;
    let state = this.layoutState.get(liveClassId);

    if (!state) {
      state = {
        liveClassId,
        version: 1,
        mode: 'WHITEBOARD_FOCUS',
        video: { x: 0.7, y: 0.68, w: 0.28, h: (0.28 * 9) / 16 },
        updated_at: new Date().toISOString(),
      };
    }

    const nextState = { ...state };
    let changed = false;

    if (
      payload.mode &&
      ['WHITEBOARD_FOCUS', 'VIDEO_FOCUS', 'SPLIT', 'CUSTOM'].includes(
        payload.mode,
      ) &&
      payload.mode !== state.mode
    ) {
      nextState.mode = payload.mode;
      changed = true;
    }

    if (payload.video) {
      const v = payload.video;
      const currentV = state.video;

      // Check if at least one field is a finite number
      const hasFiniteInput =
        (typeof v.x === 'number' && Number.isFinite(v.x)) ||
        (typeof v.y === 'number' && Number.isFinite(v.y)) ||
        (typeof v.w === 'number' && Number.isFinite(v.w)) ||
        (typeof v.h === 'number' && Number.isFinite(v.h));

      if (hasFiniteInput) {
        const clamp = (
          val: any,
          min: number,
          max: number,
          fallbackValue: number,
        ) => {
          if (typeof val !== 'number' || !Number.isFinite(val))
            return fallbackValue;
          return Math.max(min, Math.min(max, val));
        };

        const w = clamp(v.w, 0.12, 1, currentV.w);
        const h = clamp(v.h, 0.12, 1, currentV.h);
        const x = clamp(v.x, 0, 1 - w, currentV.x);
        const y = clamp(v.y, 0, 1 - h, currentV.y);

        // Check if computed rect differs
        if (
          x !== currentV.x ||
          y !== currentV.y ||
          w !== currentV.w ||
          h !== currentV.h
        ) {
          nextState.video = { x, y, w, h };
          changed = true;
        }
      }
    }

    if (changed) {
      nextState.version++;
      nextState.updated_at = new Date().toISOString();
      this.layoutState.set(liveClassId, nextState);
      this.server.to(liveClassId).emit('layout:update', nextState);
    }
  }

  // ─── Tuition Speaking (Prompt 3) ──────────────────────────────────────────

  private getPendingMap(liveClassId: string) {
    if (!this.pendingAudioRequests.has(liveClassId)) {
      this.pendingAudioRequests.set(liveClassId, new Map());
    }
    return this.pendingAudioRequests.get(liveClassId)!;
  }

  private getApprovedSet(liveClassId: string) {
    if (!this.approvedSpeakers.has(liveClassId)) {
      this.approvedSpeakers.set(liveClassId, new Set());
    }
    return this.approvedSpeakers.get(liveClassId)!;
  }

  private assertTuitionLive(lc: any) {
    if (lc.product_type !== 'tuition') {
      throw new Error('NOT_TUITION');
    }
    if (lc.status !== 'live') {
      throw new Error('CLASS_NOT_LIVE');
    }
  }

  private isHost(data: LiveClassClientData, lc: any) {
    return (
      data.userRole === UserRole.ADMIN ||
      (data.userRole === UserRole.TEACHER && lc.teacher_id === data.userId)
    );
  }

  @SubscribeMessage('audio:request')
  async handleAudioRequest(@ConnectedSocket() client: Socket) {
    const data = client.data as LiveClassClientData | undefined;
    if (!data) return;

    try {
      const lc = await this.liveClassesService.findById(data.liveClassId);
      this.assertTuitionLive(lc);

      if (data.userRole !== UserRole.STUDENT) {
        client.emit('error', 'ONLY_STUDENTS_CAN_REQUEST_AUDIO');
        return;
      }

      const isEnrolled = await this.enrollmentsService.isActiveCourseEnrollment(
        lc.course_id.toString(),
        data.userId,
      );
      if (!isEnrolled) {
        client.emit('error', 'NOT_ENROLLED');
        client.disconnect(true);
        return;
      }

      const requestedAt = new Date().toISOString();
      this.getPendingMap(data.liveClassId).set(data.userId, {
        userName: data.userName,
        requestedAt,
      });

      // Notify host (and everyone, frontend filters)
      this.server.to(data.liveClassId).emit('audio:request', {
        userId: data.userId,
        userName: data.userName,
        requestedAt,
      });

      client.emit('audio:request:ack', { success: true });
    } catch (err) {
      client.emit('error', err.message);
    }
  }

  @SubscribeMessage('audio:approve')
  async handleAudioApprove(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ) {
    const data = client.data as LiveClassClientData | undefined;
    if (!data || !payload.userId) return;

    try {
      const lc = await this.liveClassesService.findById(data.liveClassId);
      if (!this.isHost(data, lc)) {
        client.emit('error', 'NOT_HOST');
        return;
      }
      this.assertTuitionLive(lc);

      const pending = this.getPendingMap(data.liveClassId);
      if (!pending.has(payload.userId)) {
        client.emit('error', 'NO_PENDING_REQUEST');
        return;
      }

      const speakers = this.getApprovedSet(data.liveClassId);
      if (speakers.size >= this.MAX_ACTIVE_SPEAKERS) {
        client.emit('error', 'MAX_ACTIVE_SPEAKERS_REACHED');
        return;
      }

      // Move to approved
      pending.delete(payload.userId);
      speakers.add(payload.userId);

      // Issue publisher token
      const tokenData = await this.liveClassesService.issueRtcTokenForLiveClass(
        data.liveClassId,
        payload.userId,
        'publisher',
      );

      // Notify the specific student (and room for UI state)
      this.server.to(data.liveClassId).emit('audio:approved', {
        userId: payload.userId,
        ...tokenData,
      });

      // Broadcast current speaker list
      this.server.to(data.liveClassId).emit('audio:speakers', {
        speakers: Array.from(speakers),
      });
    } catch (err) {
      client.emit('error', err.message);
    }
  }

  @SubscribeMessage('audio:revoke')
  async handleAudioRevoke(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ) {
    const data = client.data as LiveClassClientData | undefined;
    if (!data || !payload.userId) return;

    try {
      const lc = await this.liveClassesService.findById(data.liveClassId);
      if (!this.isHost(data, lc)) {
        client.emit('error', 'NOT_HOST');
        return;
      }
      this.assertTuitionLive(lc);

      const speakers = this.getApprovedSet(data.liveClassId);
      if (speakers.has(payload.userId)) {
        speakers.delete(payload.userId);

        // Issue subscriber token
        const tokenData =
          await this.liveClassesService.issueRtcTokenForLiveClass(
            data.liveClassId,
            payload.userId,
            'subscriber',
          );

        this.server.to(data.liveClassId).emit('audio:revoked', {
          userId: payload.userId,
          ...tokenData,
        });

        this.server.to(data.liveClassId).emit('audio:speakers', {
          speakers: Array.from(speakers),
        });
      }
    } catch (err) {
      client.emit('error', err.message);
    }
  }

  @SubscribeMessage('audio:mute_all')
  async handleAudioMuteAll(@ConnectedSocket() client: Socket) {
    const data = client.data as LiveClassClientData | undefined;
    if (!data) return;

    try {
      const lc = await this.liveClassesService.findById(data.liveClassId);
      if (!this.isHost(data, lc)) {
        client.emit('error', 'NOT_HOST');
        return;
      }
      this.assertTuitionLive(lc);

      const speakers = this.getApprovedSet(data.liveClassId);
      const speakerList = Array.from(speakers);

      for (const userId of speakerList) {
        const tokenData =
          await this.liveClassesService.issueRtcTokenForLiveClass(
            data.liveClassId,
            userId,
            'subscriber',
          );
        this.server.to(data.liveClassId).emit('audio:revoked', {
          userId,
          ...tokenData,
        });
      }

      speakers.clear();
      this.server.to(data.liveClassId).emit('audio:speakers', { speakers: [] });
    } catch (err) {
      client.emit('error', err.message);
    }
  }
}
