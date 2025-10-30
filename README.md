# 🎙️ Voice MVP - Speech to Text App

A React Native MVP application built with Expo that demonstrates speech-to-text functionality using the `expo-speech-recognition` library.

## Features

- **Real-time Speech Recognition**: Convert speech to text in real-time
- **Cross-platform Support**: Works on iOS, Android, and Web
- **Permission Handling**: Automatic permission requests for microphone and speech recognition
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Modern UI**: Clean, intuitive interface with status indicators
- **Transcript Management**: Clear and manage your speech transcripts
- **Multiple Recognition Modes**: Support for interim results, continuous recognition, and on-device recognition

## Prerequisites

- Node.js (v18 or later)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd voice-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the app**
   The `app.json` file is already configured with the necessary permissions and plugins for speech recognition.

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your preferred platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Usage

1. **Launch the app** and navigate to the "Voice" tab
2. **Grant permissions** when prompted for microphone and speech recognition access
3. **Tap the microphone button** to start recording
4. **Speak clearly** into your device's microphone
5. **Tap stop** when you're finished speaking
6. **View your transcript** in real-time as you speak

## Key Components

### `useSpeechRecognition` Hook
A custom React hook that encapsulates all speech recognition functionality:

```typescript
const {
  isRecognizing,
  transcript,
  finalTranscript,
  isListening,
  error,
  hasPermission,
  isAvailable,
  startRecognition,
  stopRecognition,
  abortRecognition,
  clearTranscript,
  requestPermissions,
} = useSpeechRecognition({
  language: 'en-US',
  interimResults: true,
  continuous: false,
  requiresOnDeviceRecognition: false,
  addsPunctuation: true,
});
```

### Speech Recognition Screen
The main UI component featuring:
- Status indicators
- Large microphone button with visual feedback
- Real-time transcript display
- Error handling
- Clear transcript functionality

## Configuration Options

The speech recognition can be customized with various options:

- **Language**: Set the recognition language (default: 'en-US')
- **Interim Results**: Show partial results as you speak
- **Continuous**: Keep recognition active until manually stopped
- **On-Device Recognition**: Use local processing instead of cloud services
- **Punctuation**: Add punctuation to results
- **Contextual Strings**: Provide custom vocabulary for better accuracy

## Platform Compatibility

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Basic Recognition | ✅ | ✅ | ✅ |
| Real-time Results | ✅ | ✅ | ✅ |
| On-Device Recognition | ✅ | ✅ | ❌ |
| Continuous Recognition | ✅ | ✅ | ✅ |
| Permission Handling | ✅ | ✅ | ✅ |

## Troubleshooting

### Common Issues

1. **"Speech recognition not available"**
   - Ensure your device has speech recognition enabled in settings
   - For iOS: Enable Siri & Dictation in Settings
   - For Android: Install Google app or Speech Recognition & Synthesis

2. **"Permissions not granted"**
   - Go to device Settings > Apps > Voice MVP > Permissions
   - Enable Microphone and Speech Recognition permissions

3. **"No speech detected"**
   - Speak clearly and close to the microphone
   - Check that your device's microphone is working
   - Try speaking louder or in a quieter environment

### Android-Specific Issues

- **Android 12 and below**: Requires Google app (`com.google.android.googlequicksearchbox`)
- **Android 13+**: Requires Speech Recognition & Synthesis (`com.google.android.tts`)
- **On-device recognition**: May require downloading language models

### iOS-Specific Issues

- **Audio session conflicts**: The app automatically manages audio sessions
- **Siri disabled**: Enable Siri & Dictation in iOS Settings
- **Background restrictions**: Check Screen Time settings for speech recognition restrictions

## Development

### Project Structure

```
voice-mvp/
├── app/
│   ├── (tabs)/
│   │   ├── speech-recognition.tsx  # Main speech recognition screen
│   │   ├── index.tsx               # Home screen
│   │   └── explore.tsx              # Explore screen
│   └── _layout.tsx                 # Root layout
├── hooks/
│   └── useSpeechRecognition.ts     # Custom speech recognition hook
├── components/                     # Reusable UI components
├── constants/                       # App constants and themes
└── assets/                         # Images and static assets
```

### Adding New Features

1. **Custom Recognition Options**: Modify the `useSpeechRecognition` hook
2. **UI Enhancements**: Update the speech recognition screen component
3. **Additional Languages**: Add language selection functionality
4. **Export Features**: Add transcript export capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- Speech recognition powered by [expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition)
- UI components from [Expo Vector Icons](https://docs.expo.dev/guides/icons/)