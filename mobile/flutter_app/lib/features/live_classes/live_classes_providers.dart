import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/http/dio_provider.dart';
import 'package:nexvera_mobile/features/live_classes/live_class_models.dart';
import 'package:nexvera_mobile/features/live_classes/live_classes_repository.dart';

final liveClassesRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return LiveClassesRepository(dio);
});

final liveClassesListProvider = FutureProvider<List<LiveClassSummary>>((ref) {
  return ref.watch(liveClassesRepositoryProvider).listAll();
});

final liveClassesByCourseProvider = FutureProvider.family<List<LiveClassSummary>, String>((ref, courseId) {
  return ref.watch(liveClassesRepositoryProvider).listByCourse(courseId);
});

final liveClassJoinProvider = FutureProvider.family<JoinPayload, String>((ref, id) {
  return ref.watch(liveClassesRepositoryProvider).join(id);
});
