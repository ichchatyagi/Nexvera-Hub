import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:nexvera_mobile/core/config.dart';

final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

final dioProvider = Provider((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: apiBaseUrl,
    contentType: 'application/json',
  ));

  final storage = ref.watch(secureStorageProvider);

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final accessToken = await storage.read(key: 'access_token');
      if (accessToken != null) {
        options.headers['Authorization'] = 'Bearer $accessToken';
      }
      return handler.next(options);
    },
    onError: (DioException e, handler) async {
      if (e.response?.statusCode == 401) {
        final refreshToken = await storage.read(key: 'refresh_token');
        if (refreshToken != null) {
          try {
            // Attempt refresh
            final response = await Dio(BaseOptions(baseUrl: apiBaseUrl)).post(
              '/auth/refresh',
              data: {'refreshToken': refreshToken},
            );

            final data = response.data['data'];
            final newAccessToken = data['accessToken'];
            final newRefreshToken = data['refreshToken'];

            if (newAccessToken != null) {
              await storage.write(key: 'access_token', value: newAccessToken);
              if (newRefreshToken != null) {
                await storage.write(key: 'refresh_token', value: newRefreshToken);
              }

              // Retry original request
              e.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
              final retryResponse = await dio.fetch(e.requestOptions);
              return handler.resolve(retryResponse);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and let the error propagate
            await storage.delete(key: 'access_token');
            await storage.delete(key: 'refresh_token');
          }
        }
      }
      return handler.next(e);
    },
  ));

  return dio;
});
