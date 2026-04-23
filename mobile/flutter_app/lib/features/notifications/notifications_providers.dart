import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/http/dio_provider.dart';
import 'package:nexvera_mobile/features/notifications/notification_models.dart';
import 'package:nexvera_mobile/features/notifications/notifications_repository.dart';

final notificationsRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return NotificationsRepository(dio);
});

final unreadCountProvider = FutureProvider<int>((ref) async {
  return ref.watch(notificationsRepositoryProvider).getUnreadCount();
});

final notificationsFilterProvider = StateProvider<bool>((ref) => false);

final notificationsListProvider = AsyncNotifierProvider<NotificationsListNotifier, List<NotificationItem>>(NotificationsListNotifier.new);

class NotificationsListNotifier extends AsyncNotifier<List<NotificationItem>> {
  int _currentPage = 1;
  bool _hasMore = true;

  bool get hasMore => _hasMore;

  @override
  FutureOr<List<NotificationItem>> build() async {
    final unreadOnly = ref.watch(notificationsFilterProvider);
    _currentPage = 1;
    _hasMore = true;
    return _fetch(unread: unreadOnly, page: 1);
  }

  Future<List<NotificationItem>> _fetch({required bool unread, required int page}) async {
    final list = await ref.read(notificationsRepositoryProvider).list(unread: unread, page: page);
    if (list.length < 20) {
      _hasMore = false;
    }
    return list;
  }

  Future<void> loadMore() async {
    if (!_hasMore || state.isLoading) return;

    final unreadOnly = ref.read(notificationsFilterProvider);
    final nextPage = _currentPage + 1;
    
    // We don't want to show a full screen loader, so we keep the previous data
    state = const AsyncLoading<List<NotificationItem>>().copyWithPrevious(state);
    
    final result = await AsyncValue.guard(() async {
      final newList = await _fetch(unread: unreadOnly, page: nextPage);
      _currentPage = nextPage;
      return <NotificationItem>[...state.value ?? [], ...newList];
    });
    
    state = result;
  }

  Future<void> markRead(String id) async {
    final previousState = state;
    final currentList = state.value;
    
    if (currentList != null) {
      // Optimistic update
      state = AsyncData(currentList.map((item) {
        if (item.id == id) {
          return item.copyWith(readAt: DateTime.now());
        }
        return item;
      }).toList());
    }

    try {
      await ref.read(notificationsRepositoryProvider).markRead(id);
      ref.invalidate(unreadCountProvider);
    } catch (e) {
      // Revert on error
      state = previousState;
    }
  }

  Future<void> markAllRead() async {
    state = const AsyncLoading<List<NotificationItem>>().copyWithPrevious(state);
    try {
      await ref.read(notificationsRepositoryProvider).markAllRead();
      ref.invalidate(unreadCountProvider);
      ref.invalidateSelf();
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }
}
