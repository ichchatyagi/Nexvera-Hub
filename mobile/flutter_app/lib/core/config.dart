import 'dart:io';

String _getDefaultApiUrl() {
  if (Platform.isAndroid) {
    return 'http://10.0.2.2:5000/api/v1';
  }
  return 'http://localhost:5000/api/v1';
}

final apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: _getDefaultApiUrl(),
);
