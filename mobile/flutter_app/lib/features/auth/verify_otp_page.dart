import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/features/auth/auth_providers.dart';

class VerifyOtpPage extends ConsumerStatefulWidget {
  final String email;
  const VerifyOtpPage({super.key, required this.email});

  @override
  ConsumerState<VerifyOtpPage> createState() => _VerifyOtpPageState();
}

class _VerifyOtpPageState extends ConsumerState<VerifyOtpPage> {
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    final verifyState = ref.watch(verifyRegistrationOtpProvider);
    final resendState = ref.watch(resendOtpProvider);

    ref.listen(verifyRegistrationOtpProvider, (previous, next) {
      if (next.hasValue && !next.isLoading && previous?.isLoading == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Verification successful! Please login.')),
        );
        context.go('/login');
      }
      if (next.hasError && !next.isLoading) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error.toString())),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Verify Email',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(height: 8),
              Text('Enter the 6-digit code sent to ${widget.email}'),
              const SizedBox(height: 32),
              TextFormField(
                controller: _otpController,
                decoration: const InputDecoration(
                  labelText: 'Verification Code',
                  hintText: 'Enter 6-digit code',
                  border: OutlineInputBorder(),
                  counterText: '',
                ),
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 24, letterSpacing: 8),
                validator: (v) => v?.length != 6 ? 'Enter a 6-digit code' : null,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: verifyState.isLoading
                    ? null
                    : () {
                        if (_formKey.currentState!.validate()) {
                          ref.read(verifyRegistrationOtpProvider.notifier).verify(
                                widget.email,
                                _otpController.text,
                              );
                        }
                      },
                child: verifyState.isLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Verify'),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: resendState.isLoading
                    ? null
                    : () async {
                        final messenger = ScaffoldMessenger.of(context);
                        await ref.read(resendOtpProvider.notifier).resend(widget.email);
                        if (!mounted) return;
                        if (!ref.read(resendOtpProvider).hasError) {
                          messenger.showSnackBar(
                            const SnackBar(content: Text('A new code has been sent.')),
                          );
                        }
                      },
                child: Text(resendState.isLoading ? 'Resending...' : 'Resend Code'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
