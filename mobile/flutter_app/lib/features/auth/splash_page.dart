import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/features/health/health_providers.dart';

class SplashPage extends ConsumerWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final backendUp = ref.watch(backendUpProvider);

    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Nexvera Hub',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            backendUp.when(
              data: (isUp) {
                if (isUp) {
                  return const CircularProgressIndicator();
                } else {
                  return Column(
                    children: [
                      const Text(
                        'Backend not reachable',
                        style: TextStyle(color: Colors.red),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => ref.invalidate(backendUpProvider),
                        child: const Text('Retry'),
                      ),
                    ],
                  );
                }
              },
              loading: () => const CircularProgressIndicator(),
              error: (e, st) => Column(
                children: [
                   const Text(
                    'Backend connection error',
                    style: TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => ref.invalidate(backendUpProvider),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
