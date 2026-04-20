class LiveClassSummary {
  final String id;
  final String title;
  final String? description;
  final DateTime scheduledStart;
  final DateTime scheduledEnd;
  final String status;
  final String? teacherId;
  final String? teacherName;
  final String courseId;
  final String productType;
  final bool isRegistered;

  LiveClassSummary({
    required this.id,
    required this.title,
    this.description,
    required this.scheduledStart,
    required this.scheduledEnd,
    required this.status,
    this.teacherId,
    this.teacherName,
    required this.courseId,
    required this.productType,
    this.isRegistered = false,
  });

  bool get isLive => status == 'live';
  bool get isUpcoming => status == 'scheduled';

  factory LiveClassSummary.fromJson(Map<String, dynamic> json) {
    final startRaw = json['scheduled_start'] ?? json['scheduledStart'];
    final endRaw = json['scheduled_end'] ?? json['scheduledEnd'];

    final scheduledStart = _parseDate(startRaw);
    final scheduledEnd = endRaw != null 
        ? _parseDate(endRaw) 
        : scheduledStart.add(const Duration(hours: 1));

    return LiveClassSummary(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? 'Untitled Session',
      description: json['description'],
      scheduledStart: scheduledStart,
      scheduledEnd: scheduledEnd,
      status: json['status'] ?? 'scheduled',
      teacherId: json['teacher_id'] ?? json['teacherId'] ?? json['instructor_id'],
      teacherName: json['teacher_name'] ?? json['teacherName'] ?? json['instructor_name'] ?? json['teacher']?['name'],
      courseId: json['course_id']?.toString() ?? json['courseId']?.toString() ?? '',
      productType: json['product_type'] ?? json['productType'] ?? 'course',
      isRegistered: json['is_registered'] ?? json['isRegistered'] ?? false,
    );
  }

  static DateTime _parseDate(dynamic v) {
    if (v == null) return DateTime.now();
    if (v is DateTime) return v;
    try {
      if (v is String) return DateTime.parse(v);
      if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
    } catch (_) {}
    return DateTime.now();
  }
}

class JoinPayload {
  final String channelName;
  final String rtcToken;
  final String appId;
  final int uid;
  final int role;
  final String title;
  final Map<String, bool> features;

  JoinPayload({
    required this.channelName,
    required this.rtcToken,
    required this.appId,
    required this.uid,
    required this.role,
    required this.title,
    required this.features,
  });

  factory JoinPayload.fromJson(Map<String, dynamic> json) {
    return JoinPayload(
      channelName: json['channel_name'] ?? '',
      rtcToken: json['rtc_token'] ?? '',
      appId: json['agora_app_id'] ?? '',
      uid: json['agora_uid'] ?? 0,
      role: json['role'] ?? 2, // 1 = Broadcaster, 2 = Audience in Agora SDK
      title: json['title'] ?? '',
      features: Map<String, bool>.from(json['features'] ?? {}),
    );
  }
}
