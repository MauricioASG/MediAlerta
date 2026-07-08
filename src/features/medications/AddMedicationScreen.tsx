import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../shared/ui/AppButton';
import { FormField } from '../../shared/ui/FormField';
import { palette, radius, shadow, spacing } from '../../shared/theme/tokens';
import type { ScheduleType } from '../../types/schedule.types';
import { ScheduleTypePicker } from './components/ScheduleTypePicker';
import { parseSpecificTimes } from './medication.helpers';
import { useMedications } from './useMedications';

export const AddMedicationScreen = () => {
  const router = useRouter();
  const { addMedication } = useMedications();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');

  const [scheduleType, setScheduleType] = useState<ScheduleType>('interval');
  const [intervalHours, setIntervalHours] = useState('8');
  const [specificTimes, setSpecificTimes] = useState('08:00, 14:00, 20:00');

  const [isSaving, setIsSaving] = useState(false);

  const validate = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Dato requerido', 'Ingresa el nombre del medicamento.');
      return false;
    }

    if (!dosage.trim()) {
      Alert.alert('Dato requerido', 'Ingresa la dosis del medicamento.');
      return false;
    }

    if (scheduleType === 'interval') {
      const parsed = Number(intervalHours);

      if (Number.isNaN(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
        Alert.alert(
          'Horario inválido',
          'Ingresa un intervalo válido en horas. Ejemplo: 8',
        );
        return false;
      }

      return true;
    }

    if (parseSpecificTimes(specificTimes).length === 0) {
      Alert.alert(
        'Horario inválido',
        'Ingresa al menos una hora. Ejemplo: 08:00, 14:00, 20:00',
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setIsSaving(true);

      await addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        instructions: instructions.trim() || null,
        scheduleType,
        intervalHours: scheduleType === 'interval' ? Number(intervalHours) : null,
        times:
          scheduleType === 'specific_times'
            ? parseSpecificTimes(specificTimes)
            : null,
      });

      router.back();
    } catch (error) {
      console.error('[Medications] Error creating medication:', error);
      Alert.alert('Error', 'No se pudo guardar el medicamento.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos del medicamento</Text>

          <FormField
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Ej. Metformina 850 mg"
          />

          <FormField
            label="Dosis"
            value={dosage}
            onChangeText={setDosage}
            placeholder="Ej. 1 tableta"
          />

          <FormField
            label="Instrucciones"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Ej. Tomar después de comer"
            style={styles.textArea}
            multiline
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Horario</Text>

          <Text style={styles.label}>Tipo de horario</Text>
          <ScheduleTypePicker value={scheduleType} onChange={setScheduleType} />

          {scheduleType === 'interval' ? (
            <FormField
              label="Cada cuántas horas"
              value={intervalHours}
              onChangeText={setIntervalHours}
              placeholder="Ej. 8"
              keyboardType="numeric"
            />
          ) : (
            <FormField
              label="Horas específicas"
              value={specificTimes}
              onChangeText={setSpecificTimes}
              placeholder="Ej. 08:00, 14:00, 20:00"
            />
          )}
        </View>

        <AppButton
          label={isSaving ? 'Guardando...' : 'Guardar medicamento'}
          onPress={handleSave}
          variant="success"
          loading={isSaving}
        />

        <View style={styles.cancelSpacing}>
          <AppButton
            label="Cancelar"
            onPress={() => router.back()}
            variant="ghost"
            disabled={isSaving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  card: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    ...shadow.card,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  label: {
    marginBottom: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  textArea: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
  cancelSpacing: {
    marginTop: spacing.md,
  },
});
