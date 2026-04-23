import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/http/dio_provider.dart';
import 'package:nexvera_mobile/features/notifications/notifications_repository.dart';

final notificationsRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return NotificationsRepository(dio);
});

final unreadCountProvider = FutureProvider<int>((ref) async {
  return ref.watch(notificationsRepositoryProvider).getUnreadCount();
});
