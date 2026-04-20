class NotificationItem {
  final String id;
  final String title;
  final String body;
  final String type;
  final DateTime createdAt;
  final DateTime? readAt;
  final Map<String, dynamic>? data;

  NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.createdAt,
    this.readAt,
    this.data,
  });

  bool get isRead => readAt != null;

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      type: json['type'] ?? 'info',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      readAt: json['readAt'] != null ? DateTime.parse(json['readAt']) : null,
      data: json['data'] is Map ? Map<String, dynamic>.from(json['data']) : null,
    );
  }

  NotificationItem copyWith({
    DateTime? readAt,
  }) {
    return NotificationItem(
      id: id,
      title: title,
      body: body,
      type: type,
      createdAt: createdAt,
      readAt: readAt ?? this.readAt,
      data: data,
    );
  }
}
