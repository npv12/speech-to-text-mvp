import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'ko-KR', name: 'Korean (South Korea)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
];

export default function AdvancedSpeechRecognitionScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [continuousMode, setContinuousMode] = useState(false);
  const [onDeviceRecognition, setOnDeviceRecognition] = useState(false);
  const [addPunctuation, setAddPunctuation] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

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
    language: selectedLanguage,
    interimResults: true,
    continuous: continuousMode,
    requiresOnDeviceRecognition: onDeviceRecognition,
    addsPunctuation: addPunctuation,
    contextualStrings: ['Voice MVP', 'Speech Recognition', 'React Native'],
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

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setShowLanguageSelector(false);
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

  const selectedLanguageName = LANGUAGES.find(lang => lang.code === selectedLanguage)?.name || 'English (US)';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Advanced Speech Recognition</Text>
        <Text style={styles.subtitle}>Customize your speech recognition experience</Text>
      </View>

      {/* Settings Panel */}
      <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
        {/* Language Selection */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Language</Text>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageSelector(!showLanguageSelector)}
          >
            <Text style={styles.languageText}>{selectedLanguageName}</Text>
            <Ionicons 
              name={showLanguageSelector ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        {showLanguageSelector && (
          <View style={styles.languageSelector}>
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === language.code && styles.selectedLanguageOption,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    selectedLanguage === language.code && styles.selectedLanguageOptionText,
                  ]}
                >
                  {language.name}
                </Text>
                {selectedLanguage === language.code && (
                  <Ionicons name="checkmark" size={20} color="#4ECDC4" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Continuous Mode */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Continuous Mode</Text>
            <Text style={styles.settingDescription}>
              Keep recognition active until manually stopped
            </Text>
          </View>
          <Switch
            value={continuousMode}
            onValueChange={setContinuousMode}
            trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
            thumbColor={continuousMode ? '#FFF' : '#FFF'}
          />
        </View>

        {/* On-Device Recognition */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>On-Device Recognition</Text>
            <Text style={styles.settingDescription}>
              Process speech locally (requires downloaded models)
            </Text>
          </View>
          <Switch
            value={onDeviceRecognition}
            onValueChange={setOnDeviceRecognition}
            trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
            thumbColor={onDeviceRecognition ? '#FFF' : '#FFF'}
          />
        </View>

        {/* Add Punctuation */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Add Punctuation</Text>
            <Text style={styles.settingDescription}>
              Automatically add punctuation to results
            </Text>
          </View>
          <Switch
            value={addPunctuation}
            onValueChange={setAddPunctuation}
            trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
            thumbColor={addPunctuation ? '#FFF' : '#FFF'}
          />
        </View>
      </ScrollView>

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlContainer}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            {
              backgroundColor: isRecognizing ? '#FF6B6B' : '#4ECDC4',
              transform: [{ scale: isListening ? 1.1 : 1 }],
            },
          ]}
          onPress={isRecognizing ? stopRecognition : handleStartPress}
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
            onPress={abortRecognition}
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
            onPress={() => {
              Alert.alert(
                'Clear Transcript',
                'Are you sure you want to clear the transcript?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: clearTranscript },
                ]
              );
            }}
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
  settingsContainer: {
    maxHeight: 200,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  languageText: {
    fontSize: 14,
    color: '#2C3E50',
    marginRight: 8,
  },
  languageSelector: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 150,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedLanguageOption: {
    backgroundColor: '#E8F4FD',
  },
  languageOptionText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  selectedLanguageOptionText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  controlContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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
    shadowOffset: { width: 0, height: 2 },
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
});
