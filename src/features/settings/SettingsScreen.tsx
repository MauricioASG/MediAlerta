import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { scheduleTestMedicationNotification } from '../../services/notification.service';
import { palette, radius, shadow, spacing } from '../../shared/theme/tokens';
import { AppButton } from '../../shared/ui/AppButton';

export const SettingsScreen = () => {
  const handleTestNotification = async () => {
    try {
      await scheduleTestMedicationNotification({
        medicationName: 'MediAlerta',
        dosage: 'Recordatorio de prueba',
        instructions:
          'Esta notificación confirma que los recordatorios locales funcionan.',
      });

      Alert.alert(
        'Notificación programada',
        'Debería llegar una notificación en aproximadamente 5 segundos.',
      );
    } catch (error) {
      console.error('[Notifications] Error scheduling test notification:', error);
      Alert.alert(
        'Error de notificación',
        'No se pudo programar la notificación de prueba.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Ajustes</Text>
        <Text style={styles.subtitle}>Notificaciones y preferencias</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          <Text style={styles.cardText}>
            Envía una notificación de prueba para comprobar que los
            recordatorios locales funcionan en este dispositivo.
          </Text>

          <View style={styles.buttonSpacing}>
            <AppButton
              label="Probar notificación en 5 segundos"
              onPress={handleTestNotification}
              variant="primary"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          <Text style={styles.cardText}>
            MediAlerta te ayuda a recordar tus medicamentos con recordatorios
            locales, sin necesidad de conexión.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 15,
    color: palette.textSecondary,
  },
  card: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    ...shadow.card,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.textSecondary,
  },
  buttonSpacing: {
    marginTop: spacing.lg,
  },
});
