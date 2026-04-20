import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:nexvera_mobile/core/navigation/deep_link_handler.dart';
import 'package:nexvera_mobile/core/push/local_notifications.dart';

class PushService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final Dio _dio;

  PushService(this._dio);

  Future<void> initialize() async {
    // 0. Handle Initial Message (App launched from terminated state)
    final initialMessage = await _fcm.getInitialMessage();
    if (initialMessage != null) {
      DeepLinkHandler.handle(initialMessage.data);
    }

    // 1. Request Permission (Crucial for iOS)
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      provisional: false,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('User granted push notification permission');
      
      // 2. Obtain initial token
      String? token = await _fcm.getToken();
      if (token != null) {
        await registerToken(token);
      }
    } else {
      debugPrint('User declined or has not yet granted push notification permission');
    }

    // 3. Listen for token refreshes
    _fcm.onTokenRefresh.listen(registerToken);

    // 4. Foreground Message Handler
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Handling foreground push: ${message.notification?.title}');
      if (message.notification != null) {
        LocalNotificationsService.display(
          message.notification!.title ?? 'Nexvera',
          message.notification!.body ?? '',
          payload: message.data,
        );
      }
    });

    // 5. Interaction Handler (App opened from notification in background)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('App opened from push notification: ${message.data}');
      DeepLinkHandler.handle(message.data);
    });
  }

  Future<void> registerToken(String token) async {
    try {
      debugPrint('Syncing FCM token with backend: $token');
      final response = await _dio.post('/users/me/push-tokens', data: {
        'token': token,
        'platform': Platform.isAndroid ? 'android' : 'ios',
      });
      
      if (response.data['success'] == true) {
        debugPrint('Successfully registered push token');
      }
    } catch (e) {
      debugPrint('Failed to register push token with backend: $e');
    }
  }
}
