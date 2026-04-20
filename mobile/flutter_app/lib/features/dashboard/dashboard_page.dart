import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/core/http/dio_error_utils.dart';
import 'package:nexvera_mobile/features/auth/auth_repository.dart';
import 'package:nexvera_mobile/features/me/me_providers.dart';
import 'package:nexvera_mobile/features/notifications/notifications_providers.dart';

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
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              meAsyncValue.when(
                data: (me) => Column(
                  children: [
                    Text(
                      'Hello, ${me.name ?? me.email}',
                      style: Theme.of(context).textTheme.headlineMedium,
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
              const Text('Welcome to Nexvera Hub Mobile'),
            ],
          ),
        ),
      ),
    );
  }
}
