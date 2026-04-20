import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/core/http/dio_error_utils.dart';
import 'package:nexvera_mobile/features/auth/auth_repository.dart';
import 'package:nexvera_mobile/features/me/me_providers.dart';
import 'package:nexvera_mobile/features/notifications/notifications_providers.dart';
import 'package:nexvera_mobile/core/push/push_providers.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Listen for auth errors in providers
    ref.listen(meProvider, (previous, next) {
      if (next.hasError) {
        final statusCode = statusCodeFromError(next.error!);
        if (statusCode == 401) {
          ref.read(authRepositoryProvider).logout().then((_) {
            if (context.mounted) {
              context.go('/login');
            }
          });
        }
      }
    });

    ref.listen(unreadCountProvider, (previous, next) {
      if (next.hasError) {
        final statusCode = statusCodeFromError(next.error!);
        if (statusCode == 401) {
          ref.read(authRepositoryProvider).logout().then((_) {
            if (context.mounted) {
              context.go('/login');
            }
          });
        }
      }
    });

    final meAsyncValue = ref.watch(meProvider);
    final unreadCountAsyncValue = ref.watch(unreadCountProvider);

    // Initialize push notifications
    ref.watch(pushInitializerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authRepositoryProvider).logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircleAvatar(
                  radius: 50,
                  child: Icon(Icons.person, size: 50),
                ),
                const SizedBox(height: 16),
                meAsyncValue.when(
                  data: (me) => Column(
                    children: [
                      Text(
                        'Hello, ${me.name ?? me.email}',
                        style: Theme.of(context).textTheme.headlineMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text('Role: ${me.role}'),
                    ],
                  ),
                  loading: () => const CircularProgressIndicator(),
                  error: (e, st) => Text('Error loading user: $e'),
                ),
                const SizedBox(height: 24),
                unreadCountAsyncValue.when(
                  data: (count) => Text(
                    'Unread notifications: $count',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  loading: () => const Text('Loading notifications...'),
                  error: (e, st) => Text('Error loading notifications: $e'),
                ),
                const SizedBox(height: 32),
                const Text(
                  'Welcome to Nexvera Hub',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 24),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  padding: EdgeInsets.zero,
                  children: [
                    _FeatureCard(
                      icon: Icons.search,
                      title: 'Browse',
                      subtitle: 'All Courses',
                      onTap: () => context.push('/courses'),
                    ),
                    _FeatureCard(
                      icon: Icons.book,
                      title: 'Learning',
                      subtitle: 'My Courses',
                      onTap: () => context.push('/my-learning'),
                    ),
                    _FeatureCard(
                      icon: Icons.live_tv,
                      title: 'Live',
                      subtitle: 'Live Classes',
                      onTap: () => context.push('/live-classes'),
                    ),
                    _FeatureCard(
                      icon: Icons.notifications,
                      title: 'Alerts',
                      subtitle: 'Notifications',
                      badge: unreadCountAsyncValue.maybeWhen(
                        data: (count) => count > 0 ? count.toString() : null,
                        orElse: () => null,
                      ),
                      onTap: () => context.push('/notifications'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final String? badge;

  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Icon(icon, size: 32, color: Theme.of(context).colorScheme.primary),
                  const SizedBox(height: 8),
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            if (badge != null)
              Positioned(
                right: 8,
                top: 8,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.error,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                  child: Text(
                    badge!,
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
