import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/navigation/app_links_service.dart';

final appLinksServiceProvider = Provider<AppLinksService>((ref) {
  final service = AppLinksService();
  ref.onDispose(() => service.dispose());
  return service;
});

final appLinksInitializerProvider = FutureProvider<void>((ref) async {
  final service = ref.watch(appLinksServiceProvider);
  await service.initialize();
});
