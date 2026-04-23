import 'package:dio/dio.dart';

class HealthRepository {
  final Dio _dio;

  HealthRepository(this._dio);

  Future<bool> isBackendUp() async {
    try {
      final response = await _dio.get('/health');
      final data = response.data;
      return data['success'] == true || data['data']?['status'] == 'ok';
    } catch (e) {
      return false;
    }
  }
}
