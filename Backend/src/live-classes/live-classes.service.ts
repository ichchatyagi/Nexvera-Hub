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
import axios from 'axios';
import {
  LiveClass,
  LiveClassDocument,
  LiveClassStatus,
} from './schemas/live-class.schema';
import { UserRole } from '../users/entities/user.entity';
import { CreateLiveClassDto, UpdateLiveClassDto } from './dto/live-class.dto';
import { AppConfigService } from '../app-config/app-config.service';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { VideosService } from '../videos/videos.service';

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
  /** Server-assigned live-class role for the current user. */
  role: AgoraRole;
  title: string;
  scheduled_start: Date;
  status: LiveClassStatus;
  features: {
    chat_enabled: boolean;
    qa_enabled: boolean;
    screen_share_enabled: boolean;
    whiteboard_enabled: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class LiveClassesService {
  private readonly logger = new Logger(LiveClassesService.name);

  constructor(
    @InjectModel(LiveClass.name)
    private readonly liveClassModel: Model<LiveClassDocument>,
    private readonly appConfig: AppConfigService,
    private readonly videosService: VideosService,
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

    const ttlSeconds = this.appConfig.agoraTokenTtlSeconds;
    const now = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = now + ttlSeconds;

    // Agora token builder expects a numeric UID; derive a stable one from userId
    // For simplicity, use uid = 0 to let Agora auto-assign, but encode userId in room logic.
    const uid = 0;

    const rtcRole =
      role === AgoraRole.PUBLISHER ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    try {
      return RtcTokenBuilder.buildTokenWithUid(
        appId,
        certificate,
        channelName,
        uid,
        rtcRole,
        privilegeExpiredTs,
      );
    } catch (err) {
      this.logger.error(
        `Failed to generate Agora token for channel "${channelName}", user "${userId}": ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new InternalServerErrorException('Failed to generate Agora token');
    }
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

    if (!dto.course_id || !Types.ObjectId.isValid(dto.course_id)) {
      throw new BadRequestException('A valid course_id is required');
    }

    const channelName = `nexvera-${randomUUID()}`;

    const liveClass = await this.liveClassModel.create({
      course_id: new Types.ObjectId(dto.course_id),
      subject_id: dto.subject_id && Types.ObjectId.isValid(dto.subject_id) ? new Types.ObjectId(dto.subject_id) : null,
      lesson_id: dto.lesson_id && Types.ObjectId.isValid(dto.lesson_id) ? new Types.ObjectId(dto.lesson_id) : null,
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
   * Lists all live classes owned by the given teacher, sorted newest first. Admin sees everything.
   */
  async findByTeacher(teacherId: string, role?: string) {
    const query = role === UserRole.ADMIN ? {} : { teacher_id: teacherId };

    const data = await this.liveClassModel
      .find(query)
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

    // ── Agora Cloud Recording ───────────────────────────────────────────────
    if (lc.recording?.enabled) {
      try {
        const recordingUid = '999'; // Reserved UID for recording bot
        const resourceId = await this.acquireRecording(
          lc.agora.channel_name,
          recordingUid,
        );

        // Generate a token for the recording bot
        const recordingToken = this.generateAgoraToken(
          lc.agora.channel_name,
          recordingUid,
          AgoraRole.PUBLISHER, // Needs publisher to subscribe to all streams in mixed mode? 
          // Actually Agora docs say it needs to join with a token if token is enabled.
        );

        const sid = await this.startRecording(
          resourceId,
          lc.agora.channel_name,
          recordingToken,
          recordingUid,
        );

        lc.recording.resource_id = resourceId;
        lc.recording.sid = sid;
        lc.recording.status = 'processing'; // It's recording, but status 'processing' implies lifecycle
        // Wait, 'processing' enum was for the VOD pipeline later. 
        // For now, let's keep it as is or maybe add 'recording' state if needed.
        // The plan says: "available  → Video is ready for playback".
        // Let's stick to the schema enum for now.
      } catch (err) {
        this.logger.error(`Failed to start Agora recording for class ${id}: ${err.message}`);
        // Per plan: "If recording call fails, keep class live but set lc.recording.enabled = false"
        lc.recording.enabled = false;
      }
    }

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

    // ── Agora Cloud Recording Stop ──────────────────────────────────────────
    if (lc.recording?.enabled && lc.recording.resource_id && lc.recording.sid) {
      try {
        const stopResponse = await this.stopRecording(
          lc.recording.resource_id,
          lc.recording.sid,
          lc.agora.channel_name,
        );

        // Extract S3 key if available from Agora response
        // Agora response shape: { resourceId, sid, serverResponse: { fileList: "..." } }
        // For simple mixed recording, we can construct or extract it.
        const fileList = stopResponse.serverResponse?.fileList;
        if (fileList) {
          lc.recording.file_key = fileList;

          // ── Create Video Document ──────────────────────────────────────────
          try {
            const video = await this.videosService.createVideoFromRecording(
              lc.course_id.toString(),
              lc._id.toString(),
              lc.teacher_id,
              fileList, // Agora returns the S3 path in fileList
              lc.title,
            );
            lc.recording.video_id = video._id as any;
            lc.recording.status = 'processing';
          } catch (vErr) {
            this.logger.error(
              `Failed to create VOD for live class ${id}: ${vErr.message}`,
            );
          }
        }
      } catch (err) {
        this.logger.warn(`Failed to stop Agora recording for class ${id}: ${err.message}`);
        // Class still ends, but recording might have issues
      }
    }

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

    const ttlSeconds = this.appConfig.agoraTokenTtlSeconds;

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
      token_expiry_seconds: ttlSeconds,
      agora_app_id: this.appConfig.agoraAppId,
      role,
      title: lc.title,
      scheduled_start: lc.scheduled_start,
      status: lc.status,
      features: {
        chat_enabled: lc.features?.chat_enabled ?? false,
        qa_enabled: lc.features?.qa_enabled ?? false,
        screen_share_enabled: lc.features?.screen_share_enabled ?? false,
        whiteboard_enabled: lc.features?.whiteboard_enabled ?? false,
      },
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
   * Lists upcoming live classes for a general user (student or teacher).
   * For students, this helps populate "All Upcoming Sessions" views.
   */
  async findAllForUser(userId: string, role: string) {
    // Basic implementation: return upcoming non-cancelled classes
    // Future: Filter by enrollments if role === STUDENT
    const data = await this.liveClassModel
      .find({
        status: { $in: [LiveClassStatus.SCHEDULED, LiveClassStatus.LIVE] },
        scheduled_end: { $gte: new Date() }
      })
      .sort({ scheduled_start: 1 })
      .select('-agora.recording_uid -registered_students -attended_students')
      .exec();
    
    return { success: true, data };
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

  // ─── Agora Cloud Recording API Helpers ────────────────────────────────────

  private async acquireRecording(channelName: string, uid: string): Promise<string> {
    const url = `https://api.agora.io/v1/apps/${this.appConfig.agoraAppId}/cloud_recording/acquire`;
    const response = await axios.post(
      url,
      {
        cname: channelName,
        uid: uid,
        clientRequest: {
          resourceExpiredHour: 24,
        },
      },
      { headers: this.getAgoraAuthHeader() },
    );
    return response.data.resourceId;
  }

  private async startRecording(
    resourceId: string,
    channelName: string,
    token: string,
    uid: string,
  ): Promise<string> {
    const url = `https://api.agora.io/v1/apps/${this.appConfig.agoraAppId}/cloud_recording/resourceid/${resourceId}/mode/mix/start`;
    const response = await axios.post(
      url,
      {
        cname: channelName,
        uid: uid,
        clientRequest: {
          token: token,
          recordingConfig: {
            maxIdleTime: 30, // seconds
            streamTypes: 2, // both audio and video
            channelType: 0, // communication
            subscribeVideoUids: ['#allstream#'],
            subscribeAudioUids: ['#allstream#'],
            subscribeUidGroup: 0,
          },
          storageConfig: {
            vendor: 1, // AWS S3
            region: this.getAgoraS3RegionNumber(this.appConfig.awsRegion),
            bucket: this.appConfig.awsS3VideoBucket,
            accessKey: this.appConfig.awsAccessKey,
            secretKey: this.appConfig.awsSecretKey,
            fileNamePrefix: ['recordings', 'live-classes'],
          },
        },
      },
      { headers: this.getAgoraAuthHeader() },
    );
    return response.data.sid;
  }

  private async stopRecording(
    resourceId: string,
    sid: string,
    channelName: string,
  ): Promise<any> {
    const url = `https://api.agora.io/v1/apps/${this.appConfig.agoraAppId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`;
    const response = await axios.post(
      url,
      {
        cname: channelName,
        uid: '999',
        clientRequest: {},
      },
      { headers: this.getAgoraAuthHeader() },
    );
    return response.data;
  }

  private getAgoraAuthHeader() {
    const auth = Buffer.from(
      `${this.appConfig.agoraCustomerId}:${this.appConfig.agoraCustomerCertificate}`,
    ).toString('base64');
    return {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Agora Cloud Recording region mapping for S3.
   * Maps AWS regions to Agora's numeric region codes.
   */
  private getAgoraS3RegionNumber(region: string): number {
    const mapping: Record<string, number> = {
      'us-east-1': 0,
      'us-east-2': 1,
      'us-west-1': 2,
      'us-west-2': 3,
      'eu-west-1': 4,
      'eu-west-2': 5,
      'eu-west-3': 6,
      'eu-central-1': 7,
      'ap-southeast-1': 8,
      'ap-southeast-2': 9,
      'ap-northeast-1': 10,
      'ap-northeast-2': 11,
      'sa-east-1': 12,
      'ca-central-1': 13,
      'ap-south-1': 14,
      'cn-north-1': 15,
      'cn-northwest-1': 16,
      'us-gov-west-1': 17,
    };
    return mapping[region] ?? 0; // default to us-east-1
  }
}
