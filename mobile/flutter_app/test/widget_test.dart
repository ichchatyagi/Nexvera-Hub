import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/main.dart';
import 'package:nexvera_mobile/features/auth/auth_state.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class MockAuthNotifier extends AuthStatusNotifier {
  MockAuthNotifier() : super(const FlutterSecureStorage());

  @override
  Future<void> checkAuthStatus() async {
    state = AuthStatus.unauthenticated;
  }
}

void main() {
  testWidgets('App initialization smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authStatusProvider.overrideWith((ref) => MockAuthNotifier()),
        ],
        child: const MyApp(),
      ),
    );

    expect(find.byType(MyApp), findsOneWidget);
    await tester.pumpAndSettle();
  });
}
