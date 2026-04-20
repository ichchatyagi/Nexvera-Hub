import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/features/auth/auth_state.dart';
import 'package:nexvera_mobile/features/auth/login_page.dart';
import 'package:nexvera_mobile/features/auth/register_page.dart';
import 'package:nexvera_mobile/features/auth/verify_otp_page.dart';
import 'package:nexvera_mobile/features/courses/course_detail_page.dart';
import 'package:nexvera_mobile/features/courses/courses_list_page.dart';
import 'package:nexvera_mobile/features/courses/my_learning_page.dart';
import 'package:nexvera_mobile/features/dashboard/dashboard_page.dart';
import 'package:nexvera_mobile/features/live_classes/agora_call_page.dart';
import 'package:nexvera_mobile/features/live_classes/live_class_detail_page.dart';
import 'package:nexvera_mobile/features/live_classes/live_class_models.dart';
import 'package:nexvera_mobile/features/live_classes/live_classes_list_page.dart';
import 'package:nexvera_mobile/features/notifications/notifications_page.dart';
import 'package:nexvera_mobile/features/video/video_player_page.dart';

final navigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authStatus = ref.watch(authStatusProvider);

  return GoRouter(
    navigatorKey: navigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final loggedIn = authStatus == AuthStatus.authenticated;
      final isAuthPage = state.uri.path == '/login' || state.uri.path == '/register' || state.uri.path == '/verify-otp';

      if (authStatus == AuthStatus.unknown) return null; // Wait for initialization

      if (!loggedIn && !isAuthPage) return '/login';
      if (loggedIn && isAuthPage) return '/';
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const DashboardPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: '/verify-otp',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return VerifyOtpPage(
            email: extra?['email'] ?? '',
          );
        },
      ),
      GoRoute(
        path: '/courses',
        builder: (context, state) => const CoursesListPage(),
      ),
      GoRoute(
        path: '/course/:slug',
        builder: (context, state) {
          final slug = state.pathParameters['slug']!;
          return CourseDetailPage(slug: slug);
        },
      ),
      GoRoute(
        path: '/my-learning',
        builder: (context, state) => const MyLearningPage(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsPage(),
      ),
      GoRoute(
        path: '/player/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return VideoPlayerPage(id: id);
        },
      ),
      GoRoute(
        path: '/live-classes',
        builder: (context, state) => const LiveClassesListPage(),
      ),
      GoRoute(
        path: '/live-classes/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return LiveClassDetailPage(id: id);
        },
      ),
      GoRoute(
        path: '/live-classes/:id/call',
        builder: (context, state) {
          final payload = state.extra as JoinPayload;
          return AgoraCallPage(payload: payload);
        },
      ),
    ],
  );
});
