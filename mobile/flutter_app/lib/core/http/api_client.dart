import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:nexvera_mobile/core/http/api_exception.dart';

class ApiClient {
  final String baseUrl;
  final FlutterSecureStorage storage;
  late final Dio _dio;
  Future<String?>? _refreshInFlight;

  ApiClient(this.baseUrl, this.storage) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      contentType: 'application/json',
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final accessToken = await storage.read(key: 'access_token');
        if (accessToken != null) {
          options.headers['Authorization'] = 'Bearer $accessToken';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        final statusCode = e.response?.statusCode;
        final path = e.requestOptions.path;

        // If statusCode != 401 → pass through
        if (statusCode != 401) {
          return handler.next(e.copyWith(error: _mapToApiException(e)));
        }

        // If request is to /auth/login or /auth/refresh → pass through
        if (path.contains('/auth/login') || path.contains('/auth/refresh')) {
          return handler.next(e.copyWith(error: _mapToApiException(e)));
        }

        // If requestOptions.extra contains retried=true → pass through
        if (e.requestOptions.extra['retried'] == true) {
          return handler.next(e.copyWith(error: _mapToApiException(e)));
        }

        // Else try refresh
        final refreshToken = await storage.read(key: 'refresh_token');
        if (refreshToken == null) {
          await _clearTokens();
          return handler.next(e.copyWith(error: AuthExpiredException()));
        }

        try {
          final newAccessToken = await _refreshSingleFlight(refreshToken);
          if (newAccessToken != null) {
            // Retry original request ONCE
            final options = e.requestOptions;
            options.extra['retried'] = true;
            options.headers['Authorization'] = 'Bearer $newAccessToken';
            
            try {
              final response = await _dio.fetch(options);
              return handler.resolve(response);
            } on DioException catch (retryError) {
              return handler.next(retryError.copyWith(error: _mapToApiException(retryError)));
            }
          } else {
            // Refresh failed (returned null), clear tokens and pass through
            await _clearTokens();
            return handler.next(e.copyWith(error: AuthExpiredException()));
          }
        } catch (refreshError) {
          // Unexpected refresh error
          await _clearTokens();
          return handler.next(e.copyWith(error: AuthExpiredException()));
        }
      },
    ));
  }

  Dio get dio => _dio;

  ApiException _mapToApiException(DioException e) {
    final statusCode = e.response?.statusCode;
    final data = e.response?.data;
    
    String message = 'An unexpected error occurred';
    String? code;

    if (data is Map) {
      // message: prefer top-level data['message'], else data['error']?['message'], else fallback
      message = data['message'] ?? 
                (data['error'] is Map ? data['error']['message'] : null) ?? 
                message;

      // code: prefer data['error']?['code'], else data['code']
      code = (data['error'] is Map ? data['error']['code'] : null) ?? 
             data['code'];
    }

    if (statusCode == 401) {
      return AuthExpiredException(
        statusCode: statusCode,
        message: message,
        code: code,
      );
    }

    return ApiException(
      statusCode: statusCode,
      message: message,
      code: code,
    );
  }

  Future<void> _clearTokens() async {
    await storage.delete(key: 'access_token');
    await storage.delete(key: 'refresh_token');
  }

  Future<String?>? _refreshSingleFlight(String refreshToken) {
    if (_refreshInFlight != null) {
      return _refreshInFlight;
    }

    _refreshInFlight = _performRefresh(refreshToken);
    return _refreshInFlight;
  }

  Future<String?> _performRefresh(String refreshToken) async {
    try {
      final refreshDio = Dio(BaseOptions(
        baseUrl: baseUrl,
        contentType: 'application/json',
      ));

      final response = await refreshDio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final responseData = response.data;
      if (responseData['success'] == true && responseData['data'] != null) {
        final data = responseData['data'];
        final newAccessToken = data['accessToken'] as String?;
        final newRefreshToken = data['refreshToken'] as String?;

        if (newAccessToken != null) {
          await storage.write(key: 'access_token', value: newAccessToken);
          if (newRefreshToken != null) {
            await storage.write(key: 'refresh_token', value: newRefreshToken);
          }
          return newAccessToken;
        }
      }
      return null;
    } catch (e) {
      return null;
    } finally {
      _refreshInFlight = null;
    }
  }
}
