class ApiException implements Exception {
  final int? statusCode;
  final String message;
  final String? code;

  ApiException({
    this.statusCode,
    required this.message,
    this.code,
  });

  @override
  String toString() => 'ApiException(statusCode: $statusCode, message: $message, code: $code)';
}

class AuthExpiredException extends ApiException {
  AuthExpiredException({
    super.statusCode = 401,
    super.message = 'Session expired. Please login again.',
    super.code = 'AUTH_EXPIRED',
  });
}
