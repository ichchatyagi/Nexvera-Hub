# Nexvera Mobile

The mobile application for the Nexvera Hub platform.

## Getting Started

This project is built with Flutter and uses Riverpod for state management, GoRouter for navigation, and Agora for live classes.

## Running Locally

To run the application locally and connect to your local backend, use the standard Flutter run command.

### Configuring the API URL

The app automatically detects whether it's running on an Android emulator or iOS simulator and sets the default `API_BASE_URL` accordingly. You can override the base URL using `--dart-define`:

**Example for Android:**
```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1
```

**Example for iOS / Desktop:**
```bash
flutter run --dart-define=API_BASE_URL=http://localhost:5000/api/v1
```

## Push Notifications & Firebase Config

> [!IMPORTANT]
> The following configuration files are platform-specific and are **ignored by git**. You must obtain these from the Firebase Console for your project:

- **Android**: `android/app/google-services.json`
- **iOS**: `ios/Runner/GoogleService-Info.plist`

Failure to include these files will result in a warning during initialization but will not crash the app in development mode.

## Deep Link Testing

The app supports custom URI schemes (`nexvera://`) for handling payment returns and other actions. You can test these using the following CLI commands while the app is running:

**Android:**
```bash
adb shell am start -a android.intent.action.VIEW -d "nexvera://payment-complete?status=success&slug=physics-101&courseId=123"
```

**iOS Simulator:**
```bash
xcrun simctl openurl booted "nexvera://payment-complete?status=success&slug=physics-101&courseId=123"
```

## Release Signing (Android)

To build a signed release for Android, you must configure your keystore credentials:

1.  Copy `android/key.properties.example` to `android/key.properties`.
2.  Update the fields in `android/key.properties` with your keystore path, alias, and passwords.
3.  Ensure your keystore file (`.jks`) is placed in the location specified by `storeFile`.
4.  Run the build command:
    ```bash
    flutter build apk --release
    # Or for App Bundle
    flutter build appbundle --release
    ```

> [!IMPORTANT]
> `android/key.properties` is listed in `.gitignore` and should never be committed to version control.

## Features

- **Auth**: Secure JWT storage and automatic refresh logic.
- **Courses**: Browsing, detailed curriculum preview, and enrollment.
- **Live Classes**: Real-time video/audio via Agora integration.
- **Video Player**: HLS streaming support with signed URL handling.
- **Notifications**: Push notifications with deep-linking to relevant content.
- **Deep Linking**: Seamless return from web-based payment checkouts.
