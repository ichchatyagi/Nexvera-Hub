import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/features/video/video_models.dart';
import 'package:nexvera_mobile/features/video/video_repository.dart';

final playerPayloadProvider = FutureProvider.family<PlayerPayload, String>((ref, id) async {
  final repo = ref.read(videoRepositoryProvider);
  
  // Try as video ID first
  try {
     return await repo.getPlayerPayload(id);
  } catch (e) {
     // Fallback: try as lesson ID
     final videoId = await repo.getVideoIdForLesson(id);
     if (videoId != null && videoId != id) {
       return await repo.getPlayerPayload(videoId);
     }
     rethrow;
  }
});
