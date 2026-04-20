import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:nexvera_mobile/core/http/dio_provider.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthStatusNotifier extends StateNotifier<AuthStatus> {
  final FlutterSecureStorage _storage;

  AuthStatusNotifier(this._storage) : super(AuthStatus.unknown) {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    final token = await _storage.read(key: 'access_token');
    if (token != null) {
      state = AuthStatus.authenticated;
    } else {
      state = AuthStatus.unauthenticated;
    }
  }

  void setAuthenticated() {
    state = AuthStatus.authenticated;
  }

  void setUnauthenticated() {
    state = AuthStatus.unauthenticated;
  }
}

final authStatusProvider = StateNotifierProvider<AuthStatusNotifier, AuthStatus>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return AuthStatusNotifier(storage);
});
