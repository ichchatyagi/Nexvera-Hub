import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:nexvera_mobile/core/http/dio_provider.dart';
import 'package:nexvera_mobile/features/auth/auth_state.dart';

final authRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthRepository(dio, storage, ref);
});

class AuthRepository {
  final Dio _dio;
  final FlutterSecureStorage _storage;
  final Ref _ref;

  AuthRepository(this._dio, this._storage, this._ref);

  Future<void> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });

    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Login failed');
    }

    final data = response.data['data'];
    final accessToken = data['accessToken'];
    final refreshToken = data['refreshToken'];

    if (accessToken != null) {
      await _storage.write(key: 'access_token', value: accessToken);
    }
    if (refreshToken != null) {
      await _storage.write(key: 'refresh_token', value: refreshToken);
    }

    _ref.read(authStatusProvider.notifier).setAuthenticated();
  }

  Future<void> logout() async {
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
    _ref.read(authStatusProvider.notifier).setUnauthenticated();
  }

  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: 'access_token');
    return token != null;
  }
}
