import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/features/live_classes/live_classes_providers.dart';
import 'package:intl/intl.dart';

class LiveClassDetailPage extends ConsumerStatefulWidget {
  final String id;
  const LiveClassDetailPage({super.key, required this.id});

  @override
  ConsumerState<LiveClassDetailPage> createState() => _LiveClassDetailPageState();
}

class _LiveClassDetailPageState extends ConsumerState<LiveClassDetailPage> {
  bool _isRegistering = false;
  bool _isJoining = false;

  Future<void> _onRegister() async {
    setState(() => _isRegistering = true);
    try {
      await ref.read(liveClassesRepositoryProvider).register(widget.id);
      // Refresh list to update registration status
      ref.invalidate(liveClassesListProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Successfully registered for the live class!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Registration failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isRegistering = false);
    }
  }

  Future<void> _onJoin() async {
    setState(() => _isJoining = true);
    try {
      final payload = await ref.read(liveClassesRepositoryProvider).join(widget.id);
      if (mounted) {
        context.push('/live-classes/${widget.id}/call', extra: payload);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Join failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isJoining = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final listAsync = ref.watch(liveClassesListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Session Details')),
      body: listAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (classes) {
          final liveClass = classes.firstWhere(
            (c) => c.id == widget.id, 
            orElse: () => throw Exception('Session not found'),
          );

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  liveClass.title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  liveClass.description ?? 'No extra description provided for this session.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey.shade700),
                ),
                const SizedBox(height: 32),
                _InfoCard(
                  children: [
                    _InfoRow(
                      icon: Icons.calendar_month,
                      label: 'Date',
                      value: DateFormat('EEEE, MMMM dd, yyyy').format(liveClass.scheduledStart),
                    ),
                    const Divider(height: 24),
                    _InfoRow(
                      icon: Icons.schedule,
                      label: 'Time',
                      value: '${DateFormat('hh:mm a').format(liveClass.scheduledStart)} - ${DateFormat('hh:mm a').format(liveClass.scheduledEnd)}',
                    ),
                    const Divider(height: 24),
                    _InfoRow(
                      icon: Icons.person_outline,
                      label: 'Instructor',
                      value: liveClass.teacherName ?? 'Assigned Instructor',
                    ),
                  ],
                ),
                const SizedBox(height: 48),
                if (!liveClass.isRegistered)
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: FilledButton(
                      onPressed: _isRegistering ? null : _onRegister,
                      child: _isRegistering 
                        ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                        : const Text('Register for Session'),
                    ),
                  )
                else ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_circle, color: Colors.green, size: 20),
                        SizedBox(width: 8),
                        Text('You are registered', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: FilledButton.tonal(
                      onPressed: _isJoining ? null : _onJoin,
                      style: FilledButton.styleFrom(
                        backgroundColor: liveClass.isLive ? Theme.of(context).colorScheme.primaryContainer : null,
                      ),
                      child: _isJoining 
                        ? const CircularProgressIndicator(strokeWidth: 2)
                        : Text(liveClass.isLive ? 'Join Live Now' : 'Join Session'),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final List<Widget> children;
  const _InfoCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor.withValues(alpha: 0.1)),
      ),
      child: Column(children: children),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey.shade600)),
              Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            ],
          ),
        ),
      ],
    );
  }
}
