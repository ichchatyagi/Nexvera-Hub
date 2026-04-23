import 'package:dio/dio.dart';
import 'package:nexvera_mobile/features/me/me_model.dart';

class MeRepository {
  final Dio _dio;

  MeRepository(this._dio);

  Future<Me> getMe() async {
    final response = await _dio.get('/users/me');
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to load user info');
    }
    return Me.fromJson(response.data['data']);
  }
}
