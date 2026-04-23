import 'package:dio/dio.dart';
import 'package:nexvera_mobile/features/live_classes/live_class_models.dart';

class LiveClassesRepository {
  final Dio _dio;

  LiveClassesRepository(this._dio);

  Future<List<LiveClassSummary>> listAll() async {
    final response = await _dio.get('/live-classes');
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to load live classes');
    }
    final List data = response.data['data'] ?? [];
    return data.map((json) => LiveClassSummary.fromJson(json)).toList();
  }

  Future<List<LiveClassSummary>> listByCourse(String courseId) async {
    final response = await _dio.get('/live-classes/course/$courseId');
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to load course live classes');
    }
    final List data = response.data['data'] ?? [];
    return data.map((json) => LiveClassSummary.fromJson(json)).toList();
  }

  Future<void> register(String id) async {
    final response = await _dio.post('/live-classes/$id/register');
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to register');
    }
  }

  Future<JoinPayload> join(String id) async {
    final response = await _dio.post('/live-classes/$id/join');
    if (response.data['success'] != true) {
      // Handle the case where the backend envelope might differ slightly for errors
      final message = response.data['message'] ?? response.data['error']?['message'] ?? 'Failed to join live class';
      throw Exception(message);
    }
    return JoinPayload.fromJson(response.data['data']);
  }
}
