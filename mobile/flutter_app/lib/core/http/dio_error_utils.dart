import 'package:dio/dio.dart';

int? statusCodeFromError(Object error) {
  if (error is DioException) {
    return error.response?.statusCode;
  }
  return null;
}
