# Nexvera Mobile

The mobile application for the Nexvera Hub platform.

## Getting Started

This project is built with Flutter and uses Riverpod for state management and GoRouter for navigation.

## Running Locally

To run the application locally and connect to the backend, use the standard Flutter run command.

### Configuring the API URL

The app automatically detects whether it's running on an Android emulator or iOS simulator and sets the default `API_BASE_URL` accordingly:
- **Android Emulator**: `http://10.0.2.2:5000/api/v1`
- **iOS Simulator / Desktop**: `http://localhost:5000/api/v1`

You can override the base URL using `--dart-define`:

```bash
# Example for Android
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1

# Example for iOS
flutter run --dart-define=API_BASE_URL=http://localhost:5000/api/v1
```

## Features

- **Authentication**: Secure token storage and automatic refresh logic.
- **User Profile**: Integration with `/users/me`.
- **Notifications**: Real-time unread count indicator.
- **Reactive Routing**: Splash screen with automatic redirection based on auth state.
