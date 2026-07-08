import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  createMedicationSchedule,
  getSchedulesByMedicationId,
} from '../../features/schedules';
import {
  cancelMedicationNotifications,
  scheduleMedicationNotifications,
} from '../../services/notification.service';
import { DEFAULT_MEDICATION_TYPE } from '../../shared/constants/medicationTypes';
import type { Medication } from '../../types/medication.types';
import type { ScheduleType } from '../../types/schedule.types';
import { buildScheduleSummary } from './medication.helpers';
import {
  createMedication,
  deactivateMedication,
  getActiveMedications,
} from './medication.repository';

type ScheduleSummaryByMedicationId = Record<string, string>;

export interface NewMedicationInput {
  name: string;
  dosage: string;
  instructions: string | null;
  scheduleType: ScheduleType;
  intervalHours: number | null;
  times: string[] | null;
}

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [scheduleSummaries, setScheduleSummaries] =
    useState<ScheduleSummaryByMedicationId>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadMedications = useCallback(async () => {
    try {
      const activeMedications = await getActiveMedications();

      const summariesEntries = await Promise.all(
        activeMedications.map(async (medication) => {
          const schedules = await getSchedulesByMedicationId(medication.id);
          const firstSchedule = schedules[0] ?? null;

          return [medication.id, buildScheduleSummary(firstSchedule)] as const;
        }),
      );

      setMedications(activeMedications);
      setScheduleSummaries(Object.fromEntries(summariesEntries));
    } catch (error) {
      console.error('[Medications] Error loading medications:', error);
      Alert.alert('Error', 'No se pudieron cargar los medicamentos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  /**
   * Creates a medication + its schedule and programs its notifications.
   * Returns true on success so the caller can navigate away.
   */
  const addMedication = useCallback(
    async (input: NewMedicationInput): Promise<boolean> => {
      const medication = await createMedication({
        name: input.name,
        type: DEFAULT_MEDICATION_TYPE,
        dosage: input.dosage,
        instructions: input.instructions,
        startDate: new Date().toISOString(),
        endDate: null,
      });

      const medicationSchedule = await createMedicationSchedule({
        medicationId: medication.id,
        scheduleType: input.scheduleType,
        intervalHours: input.intervalHours,
        times: input.times,
      });

      try {
        const notificationIds = await scheduleMedicationNotifications(
          medication,
          medicationSchedule,
        );

        console.log(
          '[Notifications] Medication notifications scheduled:',
          notificationIds,
        );
      } catch (notificationError) {
        console.error(
          '[Notifications] Error scheduling medication notifications:',
          notificationError,
        );

        Alert.alert(
          'Medicamento guardado',
          'El medicamento y su horario se guardaron, pero no se pudieron programar las notificaciones.',
        );
      }

      await loadMedications();
      return true;
    },
    [loadMedications],
  );

  const removeMedication = useCallback(
    async (medicationId: string) => {
      try {
        await cancelMedicationNotifications(medicationId);
        await deactivateMedication(medicationId);
        await loadMedications();
      } catch (error) {
        console.error('[Medications] Error deactivating medication:', error);
        Alert.alert('Error', 'No se pudo desactivar el medicamento.');
      }
    },
    [loadMedications],
  );

  return {
    medications,
    scheduleSummaries,
    isLoading,
    loadMedications,
    addMedication,
    removeMedication,
  };
};
