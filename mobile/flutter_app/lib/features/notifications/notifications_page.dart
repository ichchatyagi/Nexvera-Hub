import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/navigation/deep_link_handler.dart';
import 'package:nexvera_mobile/features/notifications/notifications_providers.dart';
import 'package:timeago/timeago.dart' as timeago;

class NotificationsPage extends ConsumerWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsListProvider);
    final unreadOnly = ref.watch(notificationsFilterProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () => ref.read(notificationsListProvider.notifier).markAllRead(),
            child: const Text('Mark all read'),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: SizedBox(
              width: double.infinity,
              child: SegmentedButton<bool>(
                segments: const [
                  ButtonSegment(
                    value: false,
                    label: Text('All'),
                    icon: Icon(Icons.notifications_none),
                  ),
                  ButtonSegment(
                    value: true,
                    label: Text('Unread'),
                    icon: Icon(Icons.mark_email_unread_outlined),
                  ),
                ],
                selected: {unreadOnly},
                onSelectionChanged: (val) {
                  ref.read(notificationsFilterProvider.notifier).state = val.first;
                },
              ),
            ),
          ),
          Expanded(
            child: notificationsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Error: $err')),
              data: (items) {
                if (items.isEmpty) {
                  return const Center(child: Text('No notifications found.'));
                }
                return RefreshIndicator(
                  onRefresh: () => ref.refresh(notificationsListProvider.future),
                  child: ListView.builder(
                    itemCount: items.length + (ref.read(notificationsListProvider.notifier).hasMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == items.length) {
                        return Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Center(
                            child: ElevatedButton(
                              onPressed: () => ref.read(notificationsListProvider.notifier).loadMore(),
                              child: const Text('Load More'),
                            ),
                          ),
                        );
                      }

                      final item = items[index];
                      return ListTile(
                        key: ValueKey(item.id),
                        leading: CircleAvatar(
                          backgroundColor: item.isRead 
                            ? Theme.of(context).disabledColor.withValues(alpha: 0.1)
                            : Theme.of(context).colorScheme.primaryContainer,
                          child: Icon(
                            _getIconForType(item.type),
                            color: item.isRead 
                              ? Theme.of(context).disabledColor 
                              : Theme.of(context).colorScheme.primary,
                          ),
                        ),
                        title: Text(
                          item.title,
                          style: TextStyle(
                            fontWeight: item.isRead ? FontWeight.normal : FontWeight.bold,
                          ),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.body),
                            const SizedBox(height: 4),
                            Text(
                              timeago.format(item.createdAt),
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                        onTap: () {
                          if (!item.isRead) {
                            ref.read(notificationsListProvider.notifier).markRead(item.id);
                          }
                          DeepLinkHandler.handle(item.data);
                        },
                        tileColor: item.isRead 
                          ? null 
                          : Theme.of(context).colorScheme.primary.withValues(alpha: 0.05),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'course_enrollment': return Icons.school;
      case 'payment': return Icons.payment;
      case 'live_class_recording_available': return Icons.videocam;
      case 'live_class_starting': return Icons.record_voice_over;
      default: return Icons.notifications;
    }
  }
}
