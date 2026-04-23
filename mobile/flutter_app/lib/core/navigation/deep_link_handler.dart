import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/navigation/app_router.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/features/courses/courses_providers.dart';

class DeepLinkHandler {
  static void handle(Map<String, dynamic>? data) {
    if (data == null) return;
    
    final route = data['route']?.toString();
    final context = navigatorKey.currentContext;
    if (context == null) {
      debugPrint('DeepLinkHandler: No context available for navigation');
      return;
    }

    debugPrint('DeepLinkHandler: Routing to $route with data $data');

    switch (route) {
      case 'course_detail':
        final slug = data['slug'] ?? data['courseSlug'];
        if (slug != null) {
          context.push('/course/$slug');
        }
        break;
      case 'live_class_detail':
        final id = data['liveClassId'] ?? data['live_class_id'];
        if (id != null) {
          context.push('/live-classes/$id');
        }
        break;
      case 'notifications':
        context.push('/notifications');
        break;
      case 'my_learning':
        context.push('/my-learning');
        break;
      case 'payment_complete':
        final status = data['status'];
        final slug = data['slug'];
        // Re-fetch data
         ProviderScope.containerOf(context, listen: false).invalidate(myLearningProvider);
         if (slug != null) {
           ProviderScope.containerOf(context, listen: false).invalidate(courseDetailProvider(slug));
         }
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(status == 'success' 
              ? 'Enrollment successful! Your learning dashboard is updated.' 
              : 'Payment failed or was cancelled.'),
            backgroundColor: status == 'success' ? Colors.green : Colors.red,
          ),
        );
        if (status == 'success') {
          context.go('/my-learning');
        }
        break;
      default:
        debugPrint('DeepLinkHandler: Unknown route: $route');
        break;
    }
  }
}
