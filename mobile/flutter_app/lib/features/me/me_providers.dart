import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/core/http/dio_provider.dart';
import 'package:nexvera_mobile/features/me/me_model.dart';
import 'package:nexvera_mobile/features/me/me_repository.dart';

final meRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return MeRepository(dio);
});

final meProvider = FutureProvider<Me>((ref) async {
  return ref.watch(meRepositoryProvider).getMe();
});
