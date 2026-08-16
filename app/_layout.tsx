import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';
import { logDatabaseTables } from '../src/database/debug';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  useEffect(() => {
    const prepareDatabase = async () => {
      try {
        await logDatabaseTables();
        setIsDatabaseReady(true);
      } catch (error) {
        console.error('[SQLite] Error initializing database:', error);
        setDatabaseError('No se pudo inicializar la base de datos local.');
      }
    };

    prepareDatabase();
  }, []);

  if (databaseError) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
          Error al iniciar MediAlerta
        </Text>
        <Text style={{ marginTop: 8, textAlign: 'center' }}>
          {databaseError}
        </Text>
      </View>
    );
  }

  if (!isDatabaseReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Preparando MediAlerta...</Text>
      </View>
    );
  }
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="medication/new"
          options={{ presentation: 'modal', title: 'Nuevo medicamento' }}
        />
        <Stack.Screen
          name="medication/[id]"
          options={{ presentation: 'modal', title: 'Editar medicamento' }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
