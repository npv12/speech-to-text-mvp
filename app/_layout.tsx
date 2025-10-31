import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { deactivateKeepAwake } from 'expo-keep-awake';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Suppress noisy web-only keep-awake errors and ensure it's disabled on web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Try to disable if something enabled it implicitly
    try {
      deactivateKeepAwake();
    } catch {}

    const handler = (e: PromiseRejectionEvent) => {
      try {
        const reason: any = e.reason;
        const msg = typeof reason === 'object' ? (reason?.message ?? String(reason)) : String(reason);
        if (msg && msg.toLowerCase().includes('activate keep awake')) {
          // Prevent the redbox on web for unsupported wake lock
          e.preventDefault();
          // Optional: console.warn('Suppressed keep-awake error on web:', msg);
        }
      } catch {}
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
