import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/features/auth/auth_repository.dart';

// Register
final registerProvider = AutoDisposeAsyncNotifierProvider<RegisterNotifier, void>(RegisterNotifier.new);

class RegisterNotifier extends AutoDisposeAsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<void> register(String email, String password, String name) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(authRepositoryProvider).register(email, password, name));
  }
}

// Verify OTP (Registration)
final verifyRegistrationOtpProvider = AutoDisposeAsyncNotifierProvider<VerifyRegistrationOtpNotifier, void>(VerifyRegistrationOtpNotifier.new);

class VerifyRegistrationOtpNotifier extends AutoDisposeAsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<void> verify(String email, String code) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(authRepositoryProvider).verifyRegistrationOtp(email, code));
  }
}

// Forgot Password
final forgotPasswordProvider = AutoDisposeAsyncNotifierProvider<ForgotPasswordNotifier, void>(ForgotPasswordNotifier.new);

class ForgotPasswordNotifier extends AutoDisposeAsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<void> requestOtp(String email) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(authRepositoryProvider).forgotPassword(email));
  }
}

// Reset Password
final resetPasswordProvider = AutoDisposeAsyncNotifierProvider<ResetPasswordNotifier, void>(ResetPasswordNotifier.new);

class ResetPasswordNotifier extends AutoDisposeAsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<void> reset(String email, String code, String newPassword) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(authRepositoryProvider).resetPassword(email, code, newPassword));
  }
}

// Resend OTP
final resendOtpProvider = AutoDisposeAsyncNotifierProvider<ResendOtpNotifier, void>(ResendOtpNotifier.new);

class ResendOtpNotifier extends AutoDisposeAsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<void> resend(String email) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(authRepositoryProvider).resendVerificationOtp(email));
  }
}
