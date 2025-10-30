import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
    type ExpoSpeechRecognitionErrorCode,
} from 'expo-speech-recognition';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface SpeechRecognitionState {
  isRecognizing: boolean;
  transcript: string;
  finalTranscript: string;
  isListening: boolean;
  error: string | null;
  hasPermission: boolean;
  isAvailable: boolean;
}

export interface SpeechRecognitionOptions {
  language?: string;
  interimResults?: boolean;
  continuous?: boolean;
  requiresOnDeviceRecognition?: boolean;
  addsPunctuation?: boolean;
  contextualStrings?: string[];
}

export const useSpeechRecognition = (options: SpeechRecognitionOptions = {}) => {
  const [state, setState] = useState<SpeechRecognitionState>({
    isRecognizing: false,
    transcript: '',
    finalTranscript: '',
    isListening: false,
    error: null,
    hasPermission: false,
    isAvailable: false,
  });

  const {
    language = 'en-US',
    interimResults = true,
    continuous = false,
    requiresOnDeviceRecognition = false,
    addsPunctuation = false,
    contextualStrings = [],
  } = options;

  // Check if speech recognition is available
  useEffect(() => {
    const checkAvailability = async () => {
      const isAvailable = ExpoSpeechRecognitionModule.isRecognitionAvailable();
      const permissions = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      
      setState(prev => ({
        ...prev,
        isAvailable,
        hasPermission: permissions.granted,
      }));
    };

    checkAvailability();
  }, []);

  // Event listeners
  useSpeechRecognitionEvent('start', () => {
    setState(prev => ({
      ...prev,
      isRecognizing: true,
      isListening: true,
      error: null,
    }));
  });

  useSpeechRecognitionEvent('end', () => {
    setState(prev => ({
      ...prev,
      isRecognizing: false,
      isListening: false,
    }));
  });

  useSpeechRecognitionEvent('result', (event) => {
    const latestTranscript = event.results[0]?.transcript || '';
    
    setState(prev => ({
      ...prev,
      transcript: latestTranscript,
      finalTranscript: event.isFinal 
        ? prev.finalTranscript + latestTranscript + ' '
        : prev.finalTranscript,
    }));
  });

  useSpeechRecognitionEvent('error', (event) => {
    const errorMessage = getErrorMessage(event.error, event.message);
    
    setState(prev => ({
      ...prev,
      isRecognizing: false,
      isListening: false,
      error: errorMessage,
    }));

    // Show user-friendly error alert
    Alert.alert('Speech Recognition Error', errorMessage);
  });

  useSpeechRecognitionEvent('speechstart', () => {
    setState(prev => ({
      ...prev,
      isListening: true,
    }));
  });

  useSpeechRecognitionEvent('speechend', () => {
    setState(prev => ({
      ...prev,
      isListening: false,
    }));
  });

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      
      setState(prev => ({
        ...prev,
        hasPermission: result.granted,
      }));

      if (!result.granted) {
        Alert.alert(
          'Permissions Required',
          'Speech recognition requires microphone and speech recognition permissions. Please enable them in Settings.',
          [{ text: 'OK' }]
        );
      }

      return result.granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }, []);

  const startRecognition = useCallback(async () => {
    try {
      // Check permissions first
      if (!state.hasPermission) {
        const granted = await requestPermissions();
        if (!granted) return;
      }

      // Check availability
      if (!state.isAvailable) {
        Alert.alert(
          'Speech Recognition Unavailable',
          'Speech recognition is not available on this device. Please check your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Clear previous state
      setState(prev => ({
        ...prev,
        transcript: '',
        error: null,
      }));

      // Start recognition
      ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults,
        continuous,
        requiresOnDeviceRecognition,
        addsPunctuation,
        contextualStrings,
      });

    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to start speech recognition',
      }));
    }
  }, [state.hasPermission, state.isAvailable, language, interimResults, continuous, requiresOnDeviceRecognition, addsPunctuation, contextualStrings, requestPermissions]);

  const stopRecognition = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, []);

  const abortRecognition = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch (error) {
      console.error('Error aborting speech recognition:', error);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      finalTranscript: '',
    }));
  }, []);

  return {
    ...state,
    startRecognition,
    stopRecognition,
    abortRecognition,
    clearTranscript,
    requestPermissions,
  };
};

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode: ExpoSpeechRecognitionErrorCode, message?: string): string => {
  switch (errorCode) {
    case 'aborted':
      return 'Speech recognition was cancelled';
    case 'audio-capture':
      return 'Audio recording failed. Please check your microphone permissions.';
    case 'bad-grammar':
      return 'Invalid grammar provided';
    case 'language-not-supported':
      return 'The selected language is not supported';
    case 'network':
      return 'Network error occurred. Please check your internet connection.';
    case 'no-speech':
      return 'No speech was detected. Please try speaking again.';
    case 'not-allowed':
      return 'Microphone or speech recognition permission was denied';
    case 'service-not-allowed':
      return 'Speech recognition service is not available';
    case 'busy':
      return 'Speech recognition service is busy. Please try again later.';
    case 'client':
      return 'Client-side error occurred';
    case 'speech-timeout':
      return 'Speech recognition timed out';
    case 'unknown':
      return 'An unknown error occurred';
    default:
      return message || 'An error occurred during speech recognition';
  }
};
