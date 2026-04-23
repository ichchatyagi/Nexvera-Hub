import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/features/courses/courses_providers.dart';

class CoursesListPage extends ConsumerWidget {
  const CoursesListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coursesAsync = ref.watch(coursesListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Browse Courses'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search courses...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
              ),
              onChanged: (value) {
                ref.read(coursesQueryProvider.notifier).update(
                      (state) => (q: value.isEmpty ? null : value, category: state.category, page: 1),
                    );
              },
            ),
          ),
        ),
      ),
      body: coursesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Failed to load courses: $err'),
              TextButton(
                onPressed: () => ref.invalidate(coursesListProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (courses) {
          if (courses.isEmpty) {
            return const Center(child: Text('No courses found matching your query.'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: courses.length,
            separatorBuilder: (context, index) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final course = courses[index];
              return Card(
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () => context.push('/courses/${course.slug}'),
                  child: Row(
                    children: [
                      if (course.thumbnail != null)
                        Image.network(
                          course.thumbnail!,
                          width: 120,
                          height: 120,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            width: 120,
                            height: 120,
                            color: Colors.grey[200],
                            child: const Icon(Icons.image_not_supported),
                          ),
                        )
                      else
                        Container(
                          width: 120,
                          height: 120,
                          color: Colors.grey[200],
                          child: const Icon(Icons.school, size: 40, color: Colors.grey),
                        ),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                course.title,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                course.teacherName ?? 'Nexvera Instructor',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).colorScheme.primaryContainer,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      course.category ?? 'General',
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                                      ),
                                    ),
                                  ),
                                  const Spacer(),
                                  if (course.price != null && course.price! > 0)
                                    Text(
                                      '₹${course.price!.toStringAsFixed(0)}',
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                    )
                                  else
                                    const Text('FREE', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
