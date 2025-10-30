#!/bin/bash

# Voice MVP Test Script
# This script helps test the speech recognition functionality

echo "🎙️ Voice MVP - Speech Recognition Test Script"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Pre-flight Checks:"
echo "-------------------"

# Check if expo-speech-recognition is installed
if npm list expo-speech-recognition > /dev/null 2>&1; then
    echo "✅ expo-speech-recognition package is installed"
else
    echo "❌ expo-speech-recognition package is not installed"
    echo "   Run: npm install expo-speech-recognition"
    exit 1
fi

# Check if app.json has the plugin configured
if grep -q "expo-speech-recognition" app.json; then
    echo "✅ expo-speech-recognition plugin is configured in app.json"
else
    echo "❌ expo-speech-recognition plugin is not configured in app.json"
    exit 1
fi

# Check if the hook exists
if [ -f "hooks/useSpeechRecognition.ts" ]; then
    echo "✅ useSpeechRecognition hook exists"
else
    echo "❌ useSpeechRecognition hook is missing"
    exit 1
fi

# Check if the main screen exists
if [ -f "app/(tabs)/speech-recognition.tsx" ]; then
    echo "✅ Speech recognition screen exists"
else
    echo "❌ Speech recognition screen is missing"
    exit 1
fi

# Check if the advanced screen exists
if [ -f "app/(tabs)/advanced-speech.tsx" ]; then
    echo "✅ Advanced speech recognition screen exists"
else
    echo "❌ Advanced speech recognition screen is missing"
    exit 1
fi

echo ""
echo "🚀 Starting Development Server:"
echo "-------------------------------"
echo ""

# Start the development server
echo "Starting Expo development server..."
echo "Once the server starts:"
echo "  • Press 'i' to open iOS simulator"
echo "  • Press 'a' to open Android emulator"
echo "  • Press 'w' to open in web browser"
echo "  • Scan QR code with Expo Go app on your device"
echo ""
echo "Navigate to the 'Voice' or 'Advanced' tab to test speech recognition"
echo ""

npm start
