import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import {
  LiveClass,
  LiveClassDocument,
  LiveClassStatus,
} from './schemas/live-class.schema';
import { CreateLiveClassDto, UpdateLiveClassDto } from './dto/live-class.dto';
import { AppConfigService } from '../app-config/app-config.service';

// ─── Agora token shape ────────────────────────────────────────────────────────

/** Caller roles accepted by the Agora RTC token builder. */
export enum AgoraRole {
  /** Teacher/host – can publish audio & video streams. Agora RtcRole.PUBLISHER = 1 */
  PUBLISHER = 1,
  /** Student attendee – receives streams only. Agora RtcRole.SUBSCRIBER = 2 */
  SUBSCRIBER = 2,
}

/** Response returned by the join endpoint. */
export interface JoinClassResponse {
  channel_name: string;
  /** Short-lived Agora RTC token valid for `token_expiry_seconds`. */
  rtc_token: string;
  /** Seconds until the token expires (currently 3600). */
  token_expiry_seconds: number;
  /** Agora App ID – the client needs this to initialise the SDK. */
  agora_app_id: string;
  title: string;
  scheduled_start: Date;
  status: LiveClassStatus;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class LiveClassesService {
  private readonly logger = new Logger(LiveClassesService.name);

  constructor(
    @InjectModel(LiveClass.name)
    private readonly liveClassModel: Model<LiveClassDocument>,
    private readonly appConfig: AppConfigService,
  ) {}

  // ─── Agora token generation ──────────────────────────────────────────────

  /**
   * Generates a short-lived Agora RTC token for the given channel + user.
   *
   * TODO (IMPLEMENTATION_PLAN_PART3.md §8 – Server-side Token Generation):
   *   Replace the STUB token below with a real Agora Access-Token call:
   *   ```ts
   *   import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
   *
   *   const privilegeExpiredTs =
   *     Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
   *
   *   return RtcTokenBuilder.buildTokenWithUid(
   *     appId,
   *     certificate,
   *     channelName,
   *     uid,          // numeric UID (0 = assign automatically)
   *     agoraRole,    // RtcRole.PUBLISHER or RtcRole.SUBSCRIBER
   *     privilegeExpiredTs,
   *   );
   *   ```
   *   Install:  npm install agora-access-token
   *
   * Throws InternalServerErrorException if AGORA_APP_ID / AGORA_APP_CERTIFICATE
   * are missing so misconfigurations fail fast at startup / call time.
   */
  private generateAgoraToken(
    channelName: string,
    userId: string,
    role: AgoraRole,
  ): string {
    const appId = this.appConfig.agoraAppId;
    const certificate = this.appConfig.agoraAppCertificate;

    if (!appId || !certificate) {
      throw new InternalServerErrorException(
        'Agora credentials not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE.',
      );
    }

    // ── STUB ──────────────────────────────────────────────────────────────────
    // Remove this block and replace with the real RtcTokenBuilder call above
    // once the `agora-access-token` package has been installed.
    this.logger.warn(
      `[STUB] Generating stub Agora token for channel "${channelName}", user "${userId}", role ${role}. ` +
        `Replace with RtcTokenBuilder.buildTokenWithUid() in production.`,
    );
    return `STUB_TOKEN_${channelName}_${userId}_ROLE${role}`;
    // ── END STUB ──────────────────────────────────────────────────────────────
  }

  // ─── Teacher / Admin ──────────────────────────────────────────────────────

  /**
   * Creates a new live class document.
   * Auto-generates the Agora channel name as "nexvera-<uuid>".
   */
  async create(
    teacherId: string,
    dto: CreateLiveClassDto,
  ): Promise<LiveClassDocument> {
    const start = new Date(dto.scheduled_start);
    const end = new Date(dto.scheduled_end);

    if (end <= start) {
      throw new BadRequestException('scheduled_end must be after scheduled_start');
    }

    const channelName = `nexvera-${randomUUID()}`;

    const liveClass = await this.liveClassModel.create({
      course_id: new Types.ObjectId(dto.course_id),
      lesson_id: dto.lesson_id ? new Types.ObjectId(dto.lesson_id) : null,
      teacher_id: teacherId,
      title: dto.title,
      description: dto.description ?? null,
      scheduled_start: start,
      scheduled_end: end,
      timezone: dto.timezone,
      agora: { channel_name: channelName, recording_uid: null },
      status: LiveClassStatus.SCHEDULED,
      max_participants: dto.max_participants ?? 100,
      features: {
        chat_enabled: dto.features?.chat_enabled ?? false,
        qa_enabled: dto.features?.qa_enabled ?? false,
        screen_share_enabled: dto.features?.screen_share_enabled ?? false,
        whiteboard_enabled: dto.features?.whiteboard_enabled ?? false,
      },
      recording: {
        enabled: dto.recording?.enabled ?? false,
        video_id: null,
        status: 'pending',
      },
    });

    this.logger.log(
      `Live class "${liveClass._id}" created by teacher "${teacherId}". Channel: ${channelName}`,
    );

    return liveClass;
  }

  /**
   * Lists all live classes owned by the given teacher, sorted newest first.
   */
  async findByTeacher(teacherId: string) {
    const data = await this.liveClassModel
      .find({ teacher_id: teacherId })
      .sort({ scheduled_start: -1 })
      .exec();
    return { success: true, data };
  }

  /**
   * Fetches a single live class by ID.
   * Throws NotFoundException if not found.
   */
  async findById(id: string): Promise<LiveClassDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid live class ID');
    }
    const lc = await this.liveClassModel.findById(id).exec();
    if (!lc) throw new NotFoundException('Live class not found');
    return lc;
  }

  /**
   * Updates a live class.
   * Only the owning teacher (or admin) may update, and only while status = 'scheduled'.
   */
  async update(
    id: string,
    requesterId: string,
    isAdmin: boolean,
    dto: UpdateLiveClassDto,
  ): Promise<LiveClassDocument> {
    const lc = await this.findById(id);
    this.assertOwner(lc, requesterId, isAdmin);

    if (lc.status !== LiveClassStatus.SCHEDULED) {
      throw new UnprocessableEntityException(
        `Cannot update a live class once it is "${lc.status}".`,
      );
    }

    if (dto.scheduled_start || dto.scheduled_end) {
      const start = dto.scheduled_start
        ? new Date(dto.scheduled_start)
        : lc.scheduled_start;
      const end = dto.scheduled_end
        ? new Date(dto.scheduled_end)
        : lc.scheduled_end;
      if (end <= start) {
        throw new BadRequestException('scheduled_end must be after scheduled_start');
      }
      lc.scheduled_start = start;
      lc.scheduled_end = end;
    }

    if (dto.title !== undefined) lc.title = dto.title;
    if (dto.description !== undefined) lc.description = dto.description;
    if (dto.timezone !== undefined) lc.timezone = dto.timezone;
    if (dto.max_participants !== undefined) lc.max_participants = dto.max_participants;

    // Merge feature flags
    if (dto.features) {
      lc.features = { ...lc.features, ...dto.features } as any;
    }

    // Merge recording config
    if (dto.recording) {
      lc.recording = { ...lc.recording, ...dto.recording } as any;
    }

    await lc.save();
    this.logger.log(`Live class "${id}" updated by requester "${requesterId}".`);
    return lc;
  }

  /**
   * Cancels a live class (status: scheduled → cancelled).
   * Only teacher/admin, and only while status is 'scheduled'.
   */
  async cancel(
    id: string,
    requesterId: string,
    isAdmin: boolean,
  ): Promise<LiveClassDocument> {
    const lc = await this.findById(id);
    this.assertOwner(lc, requesterId, isAdmin);

    if (lc.status !== LiveClassStatus.SCHEDULED) {
      throw new UnprocessableEntityException(
        `Cannot cancel a live class that is already "${lc.status}".`,
      );
    }

    lc.status = LiveClassStatus.CANCELLED;
    await lc.save();
    this.logger.log(`Live class "${id}" cancelled by "${requesterId}".`);
    return lc;
  }

  // ─── Lifecycle: start / end ───────────────────────────────────────────────

  /**
   * Marks the live class as 'live' and records actual_start.
   * Transition: scheduled → live
   *
   * TODO (IMPLEMENTATION_PLAN_PART3.md §8 – Cloud Recording Setup):
   *   If live_class.recording.enabled, call Agora Cloud Recording REST API here:
   *     POST /v1/apps/{appId}/cloud_recording/acquire   (get resourceId)
   *     POST /v1/apps/{appId}/cloud_recording/{resourceId}/mode/mix/start
   *   Store the returned resourceId & sid on the document for later stop call.
   *
   * TODO (IMPLEMENTATION_PLAN_PART3.md – Real-time Architecture):
   *   Emit a WebSocket event here so connected students know the class has started:
   *   this.liveClassesGateway.emit('class:started', { classId: id });
   *   (Wire in when LiveClassesGateway is implemented.)
   */
  async start(
    id: string,
    requesterId: string,
    isAdmin: boolean,
  ): Promise<LiveClassDocument> {
    const lc = await this.findById(id);
    this.assertOwner(lc, requesterId, isAdmin);

    if (lc.status === LiveClassStatus.CANCELLED) {
      throw new UnprocessableEntityException('Cannot start a cancelled live class.');
    }
    if (lc.status === LiveClassStatus.ENDED) {
      throw new UnprocessableEntityException('Cannot restart an ended live class.');
    }
    if (lc.status === LiveClassStatus.LIVE) {
      throw new UnprocessableEntityException('Live class is already live.');
    }

    lc.status = LiveClassStatus.LIVE;
    lc.actual_start = new Date();
    await lc.save();

    this.logger.log(`Live class "${id}" started by "${requesterId}".`);
    return lc;
  }

  /**
   * Marks the live class as 'ended' and records actual_end.
   * Transition: live → ended  (also accepts 'scheduled' for abrupt endings).
   *
   * TODO (IMPLEMENTATION_PLAN_PART3.md §8 – Cloud Recording Setup):
   *   If recording was started, stop it here:
   *     POST /v1/apps/{appId}/cloud_recording/{resourceId}/mode/mix/stop
   *   Then kick off the video processing pipeline with the recording file.
   *
   * TODO (IMPLEMENTATION_PLAN_PART3.md – Real-time Architecture):
   *   Emit 'class:ended' WebSocket event → clients gracefully disconnect.
   */
  async end(
    id: string,
    requesterId: string,
    isAdmin: boolean,
  ): Promise<LiveClassDocument> {
    const lc = await this.findById(id);
    this.assertOwner(lc, requesterId, isAdmin);

    if (
      lc.status === LiveClassStatus.CANCELLED ||
      lc.status === LiveClassStatus.ENDED
    ) {
      throw new UnprocessableEntityException(
        `Cannot end a live class that is already "${lc.status}".`,
      );
    }

    // If the teacher ends without ever starting, fill in actual_start = now
    if (!lc.actual_start) {
      lc.actual_start = new Date();
    }
    lc.status = LiveClassStatus.ENDED;
    lc.actual_end = new Date();
    await lc.save();

    this.logger.log(`Live class "${id}" ended by "${requesterId}".`);
    return lc;
  }

  // ─── Student ──────────────────────────────────────────────────────────────

  /**
   * Lists upcoming live classes for a given course (for the student course page).
   * Returns classes in chronological order, filtering out 'cancelled' ones.
   */
  async findByCourse(courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundException('Invalid course ID');
    }
    const data = await this.liveClassModel
      .find({
        course_id: new Types.ObjectId(courseId),
        status: { $ne: LiveClassStatus.CANCELLED },
      })
      .sort({ scheduled_start: 1 })
      .select('-agora.recording_uid -registered_students -attended_students')
      .exec();
    return { success: true, data };
  }

  /**
   * Registers a student for a live class.
   * Enforces max_participants and prevents duplicate registrations.
   *
   * TODO: Optionally verify the student is enrolled in the course before
   *   allowing registration. See EnrollmentsModule.findEnrollment().
   *   Left as TODO to avoid cross-module circular dependencies at this stage.
   */
  async register(
    id: string,
    studentId: string,
  ): Promise<{ success: boolean; data: { registered: boolean; count: number } }> {
    const lc = await this.findById(id);

    // Cannot register for cancelled or ended classes
    if (
      lc.status === LiveClassStatus.CANCELLED ||
      lc.status === LiveClassStatus.ENDED
    ) {
      throw new UnprocessableEntityException(
        `Cannot register for a live class with status "${lc.status}".`,
      );
    }

    // Already registered?
    if (lc.registered_students.includes(studentId)) {
      return {
        success: true,
        data: { registered: true, count: lc.registered_students.length },
      };
    }

    // Max participants enforcement
    if (lc.registered_students.length >= lc.max_participants) {
      throw new UnprocessableEntityException(
        `This live class is full (max ${lc.max_participants} participants).`,
      );
    }

    lc.registered_students.push(studentId);
    await lc.save();

    this.logger.log(
      `Student "${studentId}" registered for live class "${id}". ` +
        `(${lc.registered_students.length}/${lc.max_participants})`,
    );

    return {
      success: true,
      data: { registered: true, count: lc.registered_students.length },
    };
  }

  /**
   * Issues an Agora RTC token allowing the user to join the live class.
   * Records the student in attended_students on first join.
   *
   * Access: class must be 'scheduled' or 'live'.
   *
   * TODO: Verify course enrollment for students before issuing a token.
   *   See EnrollmentsModule – EnrollmentsService.findEnrollment(courseId, userId).
   *   Leave enrolled teachers and admins unrestricted.
   */
  async join(id: string, userId: string): Promise<JoinClassResponse> {
    const lc = await this.findById(id);

    if (
      lc.status !== LiveClassStatus.SCHEDULED &&
      lc.status !== LiveClassStatus.LIVE
    ) {
      throw new UnprocessableEntityException(
        `Cannot join a live class with status "${lc.status}".`,
      );
    }

    // Record attendance (idempotent – only add once)
    if (!lc.attended_students.includes(userId)) {
      lc.attended_students.push(userId);
      await lc.save();
    }

    const TOKEN_TTL_SECONDS = 3600;

    // Determine Agora role: teacher is publisher, everyone else is subscriber
    const role =
      lc.teacher_id === userId ? AgoraRole.PUBLISHER : AgoraRole.SUBSCRIBER;

    const rtcToken = this.generateAgoraToken(
      lc.agora.channel_name,
      userId,
      role,
    );

    this.logger.log(
      `User "${userId}" joined live class "${id}" as ${role === AgoraRole.PUBLISHER ? 'publisher' : 'subscriber'}.`,
    );

    return {
      channel_name: lc.agora.channel_name,
      rtc_token: rtcToken,
      token_expiry_seconds: TOKEN_TTL_SECONDS,
      agora_app_id: this.appConfig.agoraAppId,
      title: lc.title,
      scheduled_start: lc.scheduled_start,
      status: lc.status,
    };
  }


  // ─── Admin Monitoring ─────────────────────────────────────────────────────

  /**
   * Lists all live classes with optional filters for administrative monitoring.
   */
  async adminFindAll(filters: {
    status?: LiveClassStatus | string;
    courseId?: string;
    teacherId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.courseId && Types.ObjectId.isValid(filters.courseId)) {
      query.course_id = new Types.ObjectId(filters.courseId);
    }
    if (filters.teacherId) {
      query.teacher_id = filters.teacherId;
    }
    if (filters.fromDate || filters.toDate) {
      query.scheduled_start = {};
      if (filters.fromDate) {
        query.scheduled_start.$gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        const end = new Date(filters.toDate);
        end.setHours(23, 59, 59, 999);
        query.scheduled_start.$lte = end;
      }
    }

    return this.liveClassModel
      .find(query)
      .sort({ scheduled_start: -1 })
      .exec();
  }

  /**
   * Fetches a single live class by ID for admin view.
   */
  async adminFindOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid live class ID');
    }
    const lc = await this.liveClassModel.findById(id).exec();
    if (!lc) throw new NotFoundException('Live class not found');
    return lc;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Asserts that the requester is the owning teacher or an admin.
   * Throws ForbiddenException otherwise.
   */
  private assertOwner(
    lc: LiveClassDocument,
    requesterId: string,
    isAdmin: boolean,
  ): void {
    if (lc.teacher_id !== requesterId && !isAdmin) {
      throw new ForbiddenException('You do not own this live class.');
    }
  }
}
