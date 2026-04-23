import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/features/courses/courses_providers.dart';
import 'package:nexvera_mobile/core/config.dart';
import 'package:url_launcher/url_launcher.dart';

class CourseDetailPage extends ConsumerWidget {
  final String slug;
  const CourseDetailPage({super.key, required this.slug});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(courseDetailProvider(slug));
    final enrollState = ref.watch(enrollActionProvider);

    ref.listen(enrollActionProvider, (prev, next) {
      if (next.hasValue && !next.isLoading && prev?.isLoading == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Successfully enrolled!')),
        );
        ref.invalidate(courseDetailProvider(slug));
      }
      if (next.hasError && !next.isLoading) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Enrollment failed: ${next.error}')),
        );
      }
    });

    return Scaffold(
      body: detailAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Scaffold(
          appBar: AppBar(),
          body: Center(child: Text('Error loading course: $err')),
        ),
        data: (course) {
          final curriculumAsync = ref.watch(courseCurriculumProvider(course.id));

          return CustomScrollView(
            slivers: [
              SliverAppBar.large(
                title: Text(course.title),
                expandedHeight: 200,
                flexibleSpace: FlexibleSpaceBar(
                  background: course.thumbnail != null
                      ? Image.network(course.thumbnail!, fit: BoxFit.cover)
                      : Container(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1)),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    Row(
                      children: [
                        const Icon(Icons.person, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(course.teacherName ?? 'Nexvera Instructor'),
                        const Spacer(),
                        if (course.category != null)
                          Chip(label: Text(course.category!, style: const TextStyle(fontSize: 10))),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Overview',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(course.description ?? 'No description available.'),
                    if (course.longDescription != null) ...[
                      const SizedBox(height: 16),
                      Text(course.longDescription!),
                    ],
                    const SizedBox(height: 24),
                    Text(
                      'Curriculum Preview',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    curriculumAsync.when(
                      loading: () => const Center(child: CircularProgressIndicator()),
                      error: (err, stack) => const Text('Unable to load curriculum at this time.'),
                      data: (sections) => sections.isEmpty
                          ? const Text('The curriculum for this course is not yet available.')
                          : Column(
                              children: sections.map((section) {
                                return ExpansionTile(
                                  title: Text(section.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                                  children: section.lessons.map((lesson) {
                                    final canPlay = lesson.type == 'video' && (lesson.isPreview || course.isEnrolled);
                                    return ListTile(
                                      leading: Icon(
                                        lesson.type == 'video' ? Icons.play_circle_outline : Icons.description_outlined,
                                        color: canPlay ? Theme.of(context).colorScheme.primary : Colors.grey,
                                      ),
                                      title: Text(
                                        lesson.title,
                                        style: TextStyle(
                                          color: canPlay ? null : Colors.grey,
                                        ),
                                      ),
                                      trailing: lesson.isPreview
                                          ? const Chip(label: Text('PREVIEW', style: TextStyle(fontSize: 10)))
                                          : (course.isEnrolled ? null : const Icon(Icons.lock_outline, size: 16)),
                                      onTap: canPlay
                                          ? () => context.push('/player/${lesson.videoId ?? lesson.id}')
                                          : null,
                                    );
                                  }).toList(),
                                );
                              }).toList(),
                            ),
                    ),
                    const SizedBox(height: 100), // Space for bottom button
                  ]),
                ),
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: detailAsync.maybeWhen(
        data: (course) => Padding(
          padding: const EdgeInsets.all(16.0),
          child: FilledButton(
            onPressed: (course.isEnrolled || enrollState.isLoading)
                ? null
                : () async {
                    if ((course.price ?? 0) > 0) {
                      final url = Uri.parse('$webBaseUrl/checkout/${course.id}?platform=mobile');
                      if (await canLaunchUrl(url)) {
                        await launchUrl(url, mode: LaunchMode.externalApplication);
                      } else {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Could not launch payment page')),
                          );
                        }
                      }
                    } else {
                      ref.read(enrollActionProvider.notifier).enroll(course.id);
                    }
                  },
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(56),
              backgroundColor: course.isEnrolled ? Colors.green : null,
            ),
            child: enrollState.isLoading
                ? const CircularProgressIndicator(color: Colors.white)
                : Text(
                    course.isEnrolled 
                      ? 'ENTERED' 
                      : (course.price != null && course.price! > 0) 
                        ? 'BUY FOR ₹${course.price}' 
                        : 'ENROLL FREE'
                  ),
          ),
        ),
        orElse: () => null,
      ),
    );
  }
}
