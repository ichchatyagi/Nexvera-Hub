import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/http/dio_provider.dart';
import 'package:nexvera_mobile/features/video/video_models.dart';

final videoRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return VideoRepository(dio);
});

class VideoRepository {
  final Dio _dio;

  VideoRepository(this._dio);

  Future<PlayerPayload> getPlayerPayload(String id) async {
    // We try to fetch playback metadata directly. 
    // The backend endpoint checks for permissions.
    final response = await _dio.get('/videos/$id/playback');
    if (response.data['success'] != true) {
      throw Exception(response.data['error']?['message'] ?? 'Failed to load video');
    }
    return PlayerPayload.fromJson(response.data['data']);
  }

  Future<String?> getVideoIdForLesson(String lessonId) async {
    final response = await _dio.get('/lessons/$lessonId');
    if (response.data['success'] != true) return null;
    return response.data['data']?['content']?['video_id']?.toString();
  }
}
