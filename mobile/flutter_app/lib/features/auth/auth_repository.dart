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

  Future<void> register(String email, String password, String name) async {
    final response = await _dio.post('/auth/register', data: {
      'email': email,
      'password': password,
      'name': name,
      'role': 'student',
    });

    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Registration failed');
    }
  }

  Future<void> verifyRegistrationOtp(String email, String code) async {
    final response = await _dio.post('/auth/verify-registration-otp', data: {
      'email': email,
      'otp': code,
    });

    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Verification failed');
    }
  }

  Future<void> resendVerificationOtp(String email) async {
    final response = await _dio.post('/auth/resend-verification-otp', data: {
      'email': email,
    });

    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to resend OTP');
    }
  }

  Future<void> forgotPassword(String email) async {
    final response = await _dio.post('/auth/forgot-password', data: {
      'email': email,
    });

    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Request failed');
    }
  }

  Future<void> verifyResetOtp(String email, String code) async {
    final response = await _dio.post('/auth/verify-otp', data: {
      'email': email,
      'otp': code,
    });

    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Verification failed');
    }
  }

  Future<void> resetPassword(String email, String code, String newPassword) async {
    final response = await _dio.post('/auth/reset-password', data: {
      'email': email,
      'otp': code,
      'newPassword': newPassword,
    });

    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Reset failed');
    }
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
