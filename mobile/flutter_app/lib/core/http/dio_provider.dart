import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:nexvera_mobile/core/config.dart';
import 'package:nexvera_mobile/core/http/api_client.dart';

final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

final apiClientProvider = Provider((ref) {
  final storage = ref.watch(secureStorageProvider);
  return ApiClient(apiBaseUrl, storage);
});

final dioProvider = Provider((ref) => ref.watch(apiClientProvider).dio);
