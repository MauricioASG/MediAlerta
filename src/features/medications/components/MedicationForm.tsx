import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { palette, radius, shadow, spacing } from '../../../shared/theme/tokens';
import { AppButton } from '../../../shared/ui/AppButton';
import { FormField } from '../../../shared/ui/FormField';
import type { ScheduleType } from '../../../types/schedule.types';
import { parseSpecificTimes } from '../medication.helpers';
import { ScheduleTypePicker } from './ScheduleTypePicker';

export interface MedicationFormValues {
  name: string;
  dosage: string;
  instructions: string | null;
  scheduleType: ScheduleType;
  intervalHours: number | null;
  times: string[] | null;
}

export interface MedicationFormInitialValues {
  name: string;
  dosage: string;
  instructions: string;
  scheduleType: ScheduleType;
  intervalHours: string;
  specificTimes: string;
}

export const EMPTY_MEDICATION_FORM: MedicationFormInitialValues = {
  name: '',
  dosage: '',
  instructions: '',
  scheduleType: 'interval',
  intervalHours: '8',
  specificTimes: '08:00, 14:00, 20:00',
};

interface MedicationFormProps {
  initialValues: MedicationFormInitialValues;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: MedicationFormValues) => void;
  onCancel: () => void;
}

export const MedicationForm = ({
  initialValues,
  submitLabel,
  submittingLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: MedicationFormProps) => {
  const [name, setName] = useState(initialValues.name);
  const [dosage, setDosage] = useState(initialValues.dosage);
  const [instructions, setInstructions] = useState(initialValues.instructions);

  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    initialValues.scheduleType,
  );
  const [intervalHours, setIntervalHours] = useState(
    initialValues.intervalHours,
  );
  const [specificTimes, setSpecificTimes] = useState(
    initialValues.specificTimes,
  );

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

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    onSubmit({
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

        <Text style={styles.disclaimer}>
          Recordatorio configurado por el usuario. Sigue las indicaciones de tu
          profesional de salud.
        </Text>

        <AppButton
          label={isSubmitting ? submittingLabel : submitLabel}
          onPress={handleSubmit}
          variant="success"
          loading={isSubmitting}
        />

        <View style={styles.cancelSpacing}>
          <AppButton
            label="Cancelar"
            onPress={onCancel}
            variant="ghost"
            disabled={isSubmitting}
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
  disclaimer: {
    marginBottom: spacing.lg,
    fontSize: 13,
    color: palette.textMuted,
    textAlign: 'center',
  },
  cancelSpacing: {
    marginTop: spacing.md,
  },
});
