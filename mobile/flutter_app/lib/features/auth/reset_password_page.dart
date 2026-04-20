import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:nexvera_mobile/features/auth/auth_providers.dart';

class ResetPasswordPage extends ConsumerStatefulWidget {
  final String email;
  const ResetPasswordPage({super.key, required this.email});

  @override
  ConsumerState<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends ConsumerState<ResetPasswordPage> {
  final _otpController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    final resetState = ref.watch(resetPasswordProvider);

    ref.listen(resetPasswordProvider, (previous, next) {
      if (next.hasValue && !next.isLoading && previous?.isLoading == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password reset successful! Please login.')),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Reset Password',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(height: 8),
              Text('Enter the code sent to ${widget.email} and your new password.'),
              const SizedBox(height: 32),
              TextFormField(
                controller: _otpController,
                decoration: const InputDecoration(
                  labelText: 'Reset Code',
                  hintText: '6-digit code',
                  border: OutlineInputBorder(),
                  counterText: '',
                ),
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 24, letterSpacing: 8),
                validator: (v) => v?.length != 6 ? 'Enter 6-digit code' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: 'New Password',
                  prefixIcon: Icon(Icons.lock_outline),
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
                validator: (v) => v!.length < 8 ? 'Min 8 characters' : null,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: resetState.isLoading
                    ? null
                    : () {
                        if (_formKey.currentState!.validate()) {
                          ref.read(resetPasswordProvider.notifier).reset(
                            widget.email,
                            _otpController.text,
                            _passwordController.text,
                          );
                        }
                      },
                child: resetState.isLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Reset Password'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
