import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function SpeechRecognitionScreen() {
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

  const handleStartPress = async () => {
    if (!hasPermission) {
      await requestPermissions();
      return;
    }
    
    if (!isAvailable) {
      Alert.alert(
        'Speech Recognition Unavailable',
        'Speech recognition is not available on this device. Please check your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    await startRecognition();
  };

  const handleStopPress = () => {
    stopRecognition();
  };

  const handleAbortPress = () => {
    abortRecognition();
  };

  const handleClearPress = () => {
    Alert.alert(
      'Clear Transcript',
      'Are you sure you want to clear the transcript?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearTranscript },
      ]
    );
  };

  const getStatusText = () => {
    if (!isAvailable) return 'Speech recognition not available';
    if (!hasPermission) return 'Permissions required';
    if (isRecognizing && !isListening) return 'Starting...';
    if (isRecognizing && isListening) return 'Listening...';
    if (isRecognizing && !isListening) return 'Processing...';
    return 'Ready to listen';
  };

  const getStatusColor = () => {
    if (!isAvailable || !hasPermission) return '#FF6B6B';
    if (isRecognizing && isListening) return '#4ECDC4';
    if (isRecognizing) return '#FFE66D';
    return '#95E1D3';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Speech to Text</Text>
        <Text style={styles.subtitle}>Tap the microphone to start listening</Text>
      </View>

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
          {isRecognizing && <ActivityIndicator size="small" color="white" />}
        </View>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* Main Control Button */}
      <View style={styles.controlContainer}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            {
              backgroundColor: isRecognizing ? '#FF6B6B' : '#4ECDC4',
              transform: [{ scale: isListening ? 1.1 : 1 }],
            },
          ]}
          onPress={isRecognizing ? handleStopPress : handleStartPress}
          disabled={!isAvailable || (!hasPermission && !isRecognizing)}
        >
          <Ionicons
            name={isRecognizing ? 'stop' : 'mic'}
            size={40}
            color="white"
          />
        </TouchableOpacity>
        
        {isRecognizing && (
          <TouchableOpacity
            style={styles.abortButton}
            onPress={handleAbortPress}
          >
            <Ionicons name="close" size={20} color="#FF6B6B" />
            <Text style={styles.abortButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transcript Display */}
      <View style={styles.transcriptContainer}>
        <View style={styles.transcriptHeader}>
          <Text style={styles.transcriptTitle}>Transcript</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearPress}
            disabled={!transcript && !finalTranscript}
          >
            <Ionicons name="trash-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.transcriptScrollView}>
          <Text style={styles.transcriptText}>
            {finalTranscript}
            {transcript && (
              <Text style={styles.interimTranscript}>
                {transcript}
              </Text>
            )}
          </Text>
        </ScrollView>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to use:</Text>
        <Text style={styles.instructionsText}>
          • Tap the microphone button to start recording{'\n'}
          • Speak clearly into your device's microphone{'\n'}
          • Tap stop when you're finished speaking{'\n'}
          • Your speech will be converted to text in real-time
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  controlContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  abortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  abortButtonText: {
    marginLeft: 5,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transcriptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  clearButton: {
    padding: 4,
  },
  transcriptScrollView: {
    flex: 1,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2C3E50',
  },
  interimTranscript: {
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    marginLeft: 8,
    color: '#FF6B6B',
    fontSize: 14,
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: '#E8F4FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 20,
  },
});
