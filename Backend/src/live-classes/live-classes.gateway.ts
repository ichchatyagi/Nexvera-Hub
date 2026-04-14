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

@WebSocketGateway({
  namespace: '/ws/live-classes',
  cors: { origin: true, credentials: true },
})
export class LiveClassesGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
  ) {}

  // Temporary in-memory state for whiteboard history (per session)
  // In production, this should use Redis or a persistent store
  private whiteboardHistory: Map<string, any[]> = new Map();

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

      // Only allow socket connection when at least one interactive feature is enabled
      const features = lc.features || {};
      if (!features.chat_enabled && !features.whiteboard_enabled) {
        client.disconnect(true);
        return;
      }
      if (lc.status === 'cancelled' || lc.status === 'ended') {
        client.disconnect(true);
        return;
      }

      const data: LiveClassClientData = {
        userId: payload.sub,
        userRole: payload.role,
        userName: payload.name || payload.email.split('@')[0],
        liveClassId: String(liveClassId),
      };

      (client.data as any) = data;

      // Join room for this live class
      client.join(data.liveClassId);

      // Optionally emit recent history on connect
      const recent = await this.messageModel
        .find({ live_class_id: new Types.ObjectId(data.liveClassId) })
        .sort({ created_at: -1 })
        .limit(50)
        .lean()
        .exec();

      client.emit('chat:history', recent.reverse());

      // Whiteboard history
      const drawHistory = this.whiteboardHistory.get(data.liveClassId) || [];
      client.emit('whiteboard:history', drawHistory);
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
    if (!lc.features?.chat_enabled) return;

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
}
