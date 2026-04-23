import 'package:dio/dio.dart';
import 'package:nexvera_mobile/features/notifications/notification_models.dart';

class NotificationsRepository {
  final Dio _dio;

  NotificationsRepository(this._dio);

  Future<int> getUnreadCount() async {
    final response = await _dio.get('/notifications/unread-count');
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to load notifications count');
    }
    return response.data['data']['unread_count'] as int;
  }

  Future<List<NotificationItem>> list({
    bool unread = false,
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _dio.get('/notifications', queryParameters: {
      'unread': unread,
      'page': page,
      'limit': limit,
    });

    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to load notifications');
    }

    final List data = response.data['data'] ?? [];
    return data.map((json) => NotificationItem.fromJson(json)).toList();
  }

  Future<void> markRead(String id) async {
    final response = await _dio.post('/notifications/$id/read');
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to mark notification as read');
    }
  }

  Future<void> markAllRead() async {
    final response = await _dio.post('/notifications/read-all');
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to mark all as read');
    }
  }
}
