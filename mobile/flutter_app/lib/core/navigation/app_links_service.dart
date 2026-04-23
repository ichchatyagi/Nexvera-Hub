import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';
import 'package:nexvera_mobile/core/navigation/deep_link_handler.dart';

class AppLinksService {
  late final AppLinks _appLinks;
  StreamSubscription? _linkSubscription;

  AppLinksService() {
    _appLinks = AppLinks();
  }

  Future<void> initialize() async {
    debugPrint('AppLinksService: Initializing...');
    
    // 1. Handle Initial Link (App launched from link while terminated)
    try {
      final initialUri = await _appLinks.getInitialLink();
      if (initialUri != null) {
        debugPrint('AppLinksService: Found initial link: $initialUri');
        _handleUri(initialUri);
      }
    } catch (e) {
      debugPrint('AppLinksService: Failed to get initial app link: $e');
    }

    // 2. Listen for incoming links while the app is active/backgrounded
    _linkSubscription = _appLinks.uriLinkStream.listen(
      (uri) {
        debugPrint('AppLinksService: Incoming link stream: $uri');
        _handleUri(uri);
      },
      onError: (err) {
        debugPrint('AppLinksService: Link stream error: $err');
      },
    );
  }

  void _handleUri(Uri uri) {
    if (uri.scheme == 'nexvera' && uri.host == 'payment-complete') {
      final data = {
        'route': 'payment_complete',
        'status': uri.queryParameters['status'],
        'slug': uri.queryParameters['slug'],
        'courseId': uri.queryParameters['courseId'],
      };
      DeepLinkHandler.handle(data);
    } else {
      // Best effort: if scheme is nexvera, try to map host to route
      if (uri.scheme == 'nexvera') {
         final data = {
           'route': uri.host.replaceAll('-', '_'),
           ...uri.queryParameters,
         };
         DeepLinkHandler.handle(data);
      }
    }
  }

  void dispose() {
    _linkSubscription?.cancel();
  }
}
