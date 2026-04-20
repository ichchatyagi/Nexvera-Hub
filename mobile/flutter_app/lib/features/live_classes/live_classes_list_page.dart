import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/features/live_classes/live_classes_providers.dart';
import 'package:intl/intl.dart';

class LiveClassesListPage extends ConsumerWidget {
  const LiveClassesListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listAsync = ref.watch(liveClassesListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Live Sessions')),
      body: listAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $err'),
              TextButton(
                onPressed: () => ref.refresh(liveClassesListProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (classes) {
          if (classes.isEmpty) {
            return const Center(child: Text('No upcoming live classes.'));
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(liveClassesListProvider.future),
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: classes.length,
              itemBuilder: (context, index) {
                final lc = classes[index];
                return Card(
                  clipBehavior: Clip.antiAlias,
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    title: Row(
                      children: [
                        Expanded(
                          child: Text(
                            lc.title,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                        ),
                        if (lc.isLive)
                          _StatusBadge(
                            label: 'LIVE',
                            color: Colors.red.shade600,
                          )
                        else if (lc.isUpcoming)
                          _StatusBadge(
                            label: 'UPCOMING',
                            color: Colors.blue.shade600,
                          ),
                      ],
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text(DateFormat('EEE, MMM dd').format(lc.scheduledStart)),
                            const SizedBox(width: 12),
                            const Icon(Icons.access_time, size: 14, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text(DateFormat('hh:mm a').format(lc.scheduledStart)),
                          ],
                        ),
                        if (lc.teacherName != null) ...[
                          const SizedBox(height: 4),
                          Text('With ${lc.teacherName}', style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ],
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/live-classes/${lc.id}'),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  const _StatusBadge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
