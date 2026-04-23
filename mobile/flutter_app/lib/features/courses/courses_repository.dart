import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/http/dio_provider.dart';
import 'package:nexvera_mobile/features/courses/course_models.dart';

final coursesRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return CoursesRepository(dio);
});

class CoursesRepository {
  final Dio _dio;

  CoursesRepository(this._dio);

  Future<List<CourseSummary>> listCourses({
    String? q,
    String? category,
    int page = 1,
    int limit = 20,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (q != null) params['q'] = q;
    if (category != null) params['category'] = category;

    final response = await _dio.get('/courses', queryParameters: params);

    final List data = response.data['data'] ?? [];
    return data.map((json) => CourseSummary.fromJson(json)).toList();
  }

  Future<CourseDetail> getCourseBySlug(String slug) async {
    final response = await _dio.get('/courses/$slug');
    return CourseDetail.fromJson(response.data['data']);
  }

  Future<List<CurriculumSection>> getCurriculum(String courseId) async {
    final response = await _dio.get('/courses/$courseId/curriculum');
    final List data = response.data['data'] ?? [];
    return data.map((json) => CurriculumSection.fromJson(json)).toList();
  }

  Future<void> enroll(String courseId) async {
    try {
      await _dio.post('/enrollments/$courseId/enroll');
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
        // Idempotent success: already enrolled
        return;
      }
      rethrow;
    }
  }

  Future<List<CourseSummary>> myLearning() async {
    final response = await _dio.get('/enrollments/my-learning');
    final List data = response.data['data'] ?? [];
    // The backend might return Enrollment objects, we extract the course
    return data.map((json) {
      final courseJson = json['course'] ?? json;
      if (courseJson is! Map) return CourseSummary.fromJson({});
      
      final merged = {
        ...Map<String, dynamic>.from(courseJson),
        'id': json['course_id'] ?? json['courseId'] ?? courseJson['id'] ?? courseJson['_id'],
      };
      return CourseSummary.fromJson(merged);
    }).toList();
  }
}
