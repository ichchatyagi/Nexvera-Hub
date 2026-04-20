import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/http/dio_provider.dart';
import 'package:nexvera_mobile/core/push/push_service.dart';

final pushServiceProvider = Provider<PushService>((ref) {
  final dio = ref.watch(dioProvider);
  return PushService(dio);
});

// Initialization provider that can be called on app start or after login
final pushInitializerProvider = FutureProvider<void>((ref) async {
  final pushService = ref.watch(pushServiceProvider);
  await pushService.initialize();
});
