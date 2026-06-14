import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createMedicationSchedule,
  getSchedulesByMedicationId,
} from '../../features/schedules';
import { scheduleTestMedicationNotification } from '../../services/notification.service';
import { DEFAULT_MEDICATION_TYPE } from '../../shared/constants/medicationTypes';
import type { Medication } from '../../types/medication.types';
import type { MedicationSchedule, ScheduleType } from '../../types/schedule.types';
import {
  createMedication,
  deactivateMedication,
  getActiveMedications,
} from './medication.repository';

type ScheduleSummaryByMedicationId = Record<string, string>;

const buildScheduleSummary = (schedule: MedicationSchedule | null): string => {
  if (!schedule) {
    return 'Sin horario configurado';
  }

  if (schedule.scheduleType === 'interval') {
    return `Cada ${schedule.intervalHours} horas`;
  }

  return `A las ${schedule.times?.join(', ')}`;
};

const parseSpecificTimes = (value: string): string[] => {
  return value
    .split(',')
    .map((time) => time.trim())
    .filter(Boolean);
};

export const MedicationDemoScreen = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [scheduleSummaries, setScheduleSummaries] =
    useState<ScheduleSummaryByMedicationId>({});

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');

  const [scheduleType, setScheduleType] = useState<ScheduleType>('interval');
  const [intervalHours, setIntervalHours] = useState('8');
  const [specificTimes, setSpecificTimes] = useState('08:00, 14:00, 20:00');

  const [isLoading, setIsLoading] = useState(false);

  const loadMedications = useCallback(async () => {
    try {
      const activeMedications = await getActiveMedications();

      const summariesEntries = await Promise.all(
        activeMedications.map(async (medication) => {
          const schedules = await getSchedulesByMedicationId(medication.id);
          const firstSchedule = schedules[0] ?? null;

          return [
            medication.id,
            buildScheduleSummary(firstSchedule),
          ] as const;
        }),
      );

      setMedications(activeMedications);
      setScheduleSummaries(Object.fromEntries(summariesEntries));
    } catch (error) {
      console.error('[Medications] Error loading medications:', error);
      Alert.alert('Error', 'No se pudieron cargar los medicamentos.');
    }
  }, []);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const validateSchedule = (): boolean => {
    if (scheduleType === 'interval') {
      const parsedIntervalHours = Number(intervalHours);

      if (
        Number.isNaN(parsedIntervalHours) ||
        parsedIntervalHours <= 0 ||
        !Number.isInteger(parsedIntervalHours)
      ) {
        Alert.alert(
          'Horario invÃ¡lido',
          'Ingresa un intervalo vÃ¡lido en horas. Ejemplo: 8',
        );
        return false;
      }

      return true;
    }

    const parsedTimes = parseSpecificTimes(specificTimes);

    if (parsedTimes.length === 0) {
      Alert.alert(
        'Horario invÃ¡lido',
        'Ingresa al menos una hora. Ejemplo: 08:00, 14:00, 20:00',
      );
      return false;
    }

    return true;
  };

  const handleCreateMedication = async () => {
    if (!name.trim()) {
      Alert.alert('Dato requerido', 'Ingresa el nombre del medicamento.');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('Dato requerido', 'Ingresa la dosis del medicamento.');
      return;
    }

    if (!validateSchedule()) {
      return;
    }

    try {
      setIsLoading(true);

      const medication = await createMedication({
        name,
        type: DEFAULT_MEDICATION_TYPE,
        dosage,
        instructions: instructions || null,
        startDate: new Date().toISOString(),
        endDate: null,
      });

      await createMedicationSchedule({
        medicationId: medication.id,
        scheduleType,
        intervalHours:
          scheduleType === 'interval' ? Number(intervalHours) : null,
        times:
          scheduleType === 'specific_times'
            ? parseSpecificTimes(specificTimes)
            : null,
      });

      setName('');
      setDosage('');
      setInstructions('');
      setScheduleType('interval');
      setIntervalHours('8');
      setSpecificTimes('08:00, 14:00, 20:00');

      await loadMedications();
    } catch (error) {
      console.error('[Medications] Error creating medication:', error);
      Alert.alert('Error', 'No se pudo guardar el medicamento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateMedication = async (medicationId: string) => {
    try {
      await deactivateMedication(medicationId);
      await loadMedications();
    } catch (error) {
      console.error('[Medications] Error deactivating medication:', error);
      Alert.alert('Error', 'No se pudo desactivar el medicamento.');
    }
  };

  const handleScheduleTestNotification = async () => {
    try {
      await scheduleTestMedicationNotification({
        medicationName: 'MediAlerta',
        dosage: 'Recordatorio de prueba',
        instructions: 'Esta notificación confirma que los recordatorios locales funcionan.',
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>MediAlerta</Text>
      <Text style={styles.subtitle}>
        Prueba local de medicamentos, horarios y notificaciones
      </Text>

      <Pressable
        onPress={handleScheduleTestNotification}
        style={({ pressed }) => [
          styles.testNotificationButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.testNotificationButtonText}>
          Probar notificación en 5 segundos
        </Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Nuevo medicamento</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Metformina 850 mg"
          style={styles.input}
        />

        <Text style={styles.label}>Dosis</Text>
        <TextInput
          value={dosage}
          onChangeText={setDosage}
          placeholder="Ej. 1 tableta"
          style={styles.input}
        />

        <Text style={styles.label}>Instrucciones</Text>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Ej. Tomar despuÃ©s de comer"
          style={[styles.input, styles.textArea]}
          multiline
        />

        <Text style={styles.label}>Tipo de horario</Text>

        <View style={styles.scheduleTypeContainer}>
          <Pressable
            onPress={() => setScheduleType('interval')}
            style={[
              styles.scheduleTypeButton,
              scheduleType === 'interval' && styles.scheduleTypeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.scheduleTypeButtonText,
                scheduleType === 'interval' &&
                  styles.scheduleTypeButtonTextActive,
              ]}
            >
              Por intervalo
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setScheduleType('specific_times')}
            style={[
              styles.scheduleTypeButton,
              scheduleType === 'specific_times' &&
                styles.scheduleTypeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.scheduleTypeButtonText,
                scheduleType === 'specific_times' &&
                  styles.scheduleTypeButtonTextActive,
              ]}
            >
              Horas especÃ­ficas
            </Text>
          </Pressable>
        </View>

        {scheduleType === 'interval' ? (
          <>
            <Text style={styles.label}>Cada cuÃ¡ntas horas</Text>
            <TextInput
              value={intervalHours}
              onChangeText={setIntervalHours}
              placeholder="Ej. 8"
              keyboardType="numeric"
              style={styles.input}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Horas especÃ­ficas</Text>
            <TextInput
              value={specificTimes}
              onChangeText={setSpecificTimes}
              placeholder="Ej. 08:00, 14:00, 20:00"
              style={styles.input}
            />
          </>
        )}

        <Pressable
          onPress={handleCreateMedication}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
            isLoading && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Guardando...' : 'Guardar medicamento'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Medicamentos activos</Text>

        {medications.length === 0 ? (
          <Text style={styles.emptyText}>
            TodavÃ­a no hay medicamentos guardados.
          </Text>
        ) : (
          medications.map((medication) => (
            <View key={medication.id} style={styles.medicationItem}>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationDosage}>{medication.dosage}</Text>

                <Text style={styles.medicationSchedule}>
                  {scheduleSummaries[medication.id] ?? 'Cargando horario...'}
                </Text>

                {medication.instructions ? (
                  <Text style={styles.medicationInstructions}>
                    {medication.instructions}
                  </Text>
                ) : null}
              </View>

              <Pressable
                onPress={() => handleDeactivateMedication(medication.id)}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Desactivar</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f5f7fb',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#6b7280',
  },
  testNotificationButton: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#16a34a',
    alignItems: 'center',
  },
  testNotificationButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 14,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  textArea: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
  scheduleTypeContainer: {
    marginBottom: 14,
    flexDirection: 'row',
    gap: 10,
  },
  scheduleTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  scheduleTypeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  scheduleTypeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  scheduleTypeButtonTextActive: {
    color: '#1d4ed8',
  },
  primaryButton: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b91c1c',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
  },
  medicationItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medicationInfo: {
    flex: 1,
    paddingRight: 12,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  medicationDosage: {
    marginTop: 2,
    fontSize: 14,
    color: '#374151',
  },
  medicationSchedule: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  medicationInstructions: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
});
