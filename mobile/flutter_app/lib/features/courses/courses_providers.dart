import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/features/courses/course_models.dart';
import 'package:nexvera_mobile/features/courses/courses_repository.dart';

// Search Query State
final coursesQueryProvider = StateProvider<({String? q, String? category, int page})>(
  (ref) => (q: null, category: null, page: 1),
);

// Course List List
final coursesListProvider = FutureProvider<List<CourseSummary>>((ref) async {
  final query = ref.watch(coursesQueryProvider);
  return ref.read(coursesRepositoryProvider).listCourses(
        q: query.q,
        category: query.category,
        page: query.page,
      );
});

// Course Detail
final courseDetailProvider = FutureProvider.family<CourseDetail, String>((ref, slug) async {
  return ref.read(coursesRepositoryProvider).getCourseBySlug(slug);
});

// Course Curriculum
final courseCurriculumProvider = FutureProvider.family<List<CurriculumSection>, String>((ref, courseId) async {
  return ref.read(coursesRepositoryProvider).getCurriculum(courseId);
});

// My Learning
final myLearningProvider = FutureProvider<List<CourseSummary>>((ref) async {
  return ref.read(coursesRepositoryProvider).myLearning();
});

// Enroll Action
final enrollActionProvider = AutoDisposeAsyncNotifierProvider<EnrollNotifier, void>(EnrollNotifier.new);

class EnrollNotifier extends AutoDisposeAsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<void> enroll(String courseId) async {
    state = const AsyncLoading();
    final result = await AsyncValue.guard(() => ref.read(coursesRepositoryProvider).enroll(courseId));
    state = result;
    if (!result.hasError) {
      // Refresh My Learning
      ref.invalidate(myLearningProvider);
    }
  }
}
