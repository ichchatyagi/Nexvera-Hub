import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/features/auth/auth_state.dart';
import 'package:nexvera_mobile/features/auth/login_page.dart';
import 'package:nexvera_mobile/features/auth/splash_page.dart';
import 'package:nexvera_mobile/features/dashboard/dashboard_page.dart';

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

final routerProvider = Provider((ref) {
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: _AuthRefreshListenable(ref),
    redirect: (context, state) {
      final status = ref.read(authStatusProvider);
      
      final isSplash = state.matchedLocation == '/splash';
      final isLoggingIn = state.matchedLocation == '/login';

      if (status == AuthStatus.unknown) {
        return isSplash ? null : '/splash';
      }

      if (status == AuthStatus.unauthenticated) {
        return isLoggingIn ? null : '/login';
      }

      if (status == AuthStatus.authenticated) {
        if (isSplash || isLoggingIn) {
          return '/';
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => const DashboardPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
    ],
  );
});

class _AuthRefreshListenable extends ChangeNotifier {
  _AuthRefreshListenable(Ref ref) {
    ref.listen(authStatusProvider, (prev, next) {
      notifyListeners();
    });
  }
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Nexvera Mobile',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}
