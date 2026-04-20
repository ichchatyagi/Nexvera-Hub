import 'package:dio/dio.dart';

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
}
