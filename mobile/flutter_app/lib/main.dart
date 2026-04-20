import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/navigation/app_router.dart';
import 'package:nexvera_mobile/core/navigation/app_links_provider.dart';
import 'package:nexvera_mobile/core/push/local_notifications.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
    await LocalNotificationsService.initialize();
  } catch (e) {
    debugPrint('Firebase initialization failed (likely missing config files): $e');
  }
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    // Initialize App Links for real URL intent handling
    ref.watch(appLinksInitializerProvider);

    return MaterialApp.router(
      title: 'Nexvera Hub',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}
