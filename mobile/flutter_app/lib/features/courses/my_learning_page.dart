import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/features/courses/courses_providers.dart';

class MyLearningPage extends ConsumerWidget {
  const MyLearningPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final myLearningAsync = ref.watch(myLearningProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Learning'),
      ),
      body: myLearningAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (courses) {
          if (courses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.school_outlined, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text('You haven\'t enrolled in any courses yet.'),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: () => context.go('/courses'),
                    child: const Text('Browse Courses'),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(myLearningProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: courses.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final course = courses[index];
                return Card(
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap: () => context.push('/courses/${course.slug}'),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (course.thumbnail != null)
                          Image.network(
                            course.thumbnail!,
                            height: 150,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          )
                        else
                          Container(
                            height: 150,
                            width: double.infinity,
                            color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                            child: const Icon(Icons.school, size: 48),
                          ),
                        Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                course.title,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                course.teacherName ?? 'Nexvera Instructor',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              const SizedBox(height: 12),
                              const LinearProgressIndicator(value: 0.1), // Placeholder for progress
                              const SizedBox(height: 8),
                              const Text('10% Complete', style: TextStyle(fontSize: 10)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
