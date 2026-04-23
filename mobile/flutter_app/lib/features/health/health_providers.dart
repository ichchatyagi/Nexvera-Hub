import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/http/dio_provider.dart';
import 'package:nexvera_mobile/features/health/health_repository.dart';

final healthRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return HealthRepository(dio);
});

final backendUpProvider = FutureProvider<bool>((ref) async {
  return ref.watch(healthRepositoryProvider).isBackendUp();
});
