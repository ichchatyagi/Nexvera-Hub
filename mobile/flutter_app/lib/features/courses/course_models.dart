class CourseSummary {
  final String id;
  final String slug;
  final String title;
  final String? description;
  final String? thumbnail;
  final String? category;
  final String? teacherName;
  final double? price;

  CourseSummary({
    required this.id,
    required this.slug,
    required this.title,
    this.description,
    this.thumbnail,
    this.category,
    this.teacherName,
    this.price,
  });

  factory CourseSummary.fromJson(Map<String, dynamic> json) {
    return CourseSummary(
      id: json['id'] ?? json['_id'] ?? '',
      slug: json['slug'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      thumbnail: json['thumbnail'],
      category: json['category'],
      teacherName: json['teacher']?['name'] ?? json['instructor']?['name'],
      price: (json['price'] as num?)?.toDouble(),
    );
  }
}

class CourseDetail extends CourseSummary {
  final String? longDescription;
  final List<String>? learningOutcomes;
  final bool isEnrolled;

  CourseDetail({
    required super.id,
    required super.slug,
    required super.title,
    super.description,
    super.thumbnail,
    super.category,
    super.teacherName,
    super.price,
    this.longDescription,
    this.learningOutcomes,
    this.isEnrolled = false,
  });

  factory CourseDetail.fromJson(Map<String, dynamic> json) {
    return CourseDetail(
      id: json['id'] ?? json['_id'] ?? '',
      slug: json['slug'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      thumbnail: json['thumbnail'],
      category: json['category'],
      teacherName: json['teacher']?['name'] ?? json['instructor']?['name'],
      price: (json['price'] as num?)?.toDouble(),
      longDescription: json['longDescription'],
      learningOutcomes: (json['learningOutcomes'] as List?)?.cast<String>(),
      isEnrolled: json['isEnrolled'] ?? false,
    );
  }
}

class CurriculumSection {
  final String id;
  final String title;
  final List<CurriculumLesson> lessons;

  CurriculumSection({
    required this.id,
    required this.title,
    required this.lessons,
  });

  factory CurriculumSection.fromJson(Map<String, dynamic> json) {
    return CurriculumSection(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      lessons: (json['lessons'] as List?)
              ?.map((l) => CurriculumLesson.fromJson(l))
              .toList() ??
          [],
    );
  }
}

class CurriculumLesson {
  final String id;
  final String title;
  final String type;
  final bool isPreview;
  final int? durationSeconds;
  final String? videoId;

  CurriculumLesson({
    required this.id,
    required this.title,
    required this.type,
    this.isPreview = false,
    this.durationSeconds,
    this.videoId,
  });

  factory CurriculumLesson.fromJson(Map<String, dynamic> json) {
    return CurriculumLesson(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      type: json['type'] ?? 'video',
      isPreview: json['isPreview'] ?? json['is_preview'] ?? false,
      durationSeconds: json['durationSeconds'] ?? json['duration'],
      videoId: json['content']?['video_id']?.toString(),
    );
  }
}
