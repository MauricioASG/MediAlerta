import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  createMedicationSchedule,
  getSchedulesByMedicationId,
  updateMedicationSchedule,
} from '../schedules';
import { scheduleMedicationNotifications } from '../../services/notification.service';
import type { MedicationSchedule } from '../../types/schedule.types';
import {
  EMPTY_MEDICATION_FORM,
  type MedicationFormInitialValues,
  type MedicationFormValues,
} from './components/MedicationForm';
import { getMedicationById, updateMedication } from './medication.repository';

/**
 * Loads a medication and its schedule as editable form values, and persists
 * the changes (medication + schedule + notifications) as a single use case.
 */
export const useMedicationEditor = (medicationId: string) => {
  const [initialValues, setInitialValues] =
    useState<MedicationFormInitialValues | null>(null);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadMedication = async () => {
      try {
        const medication = await getMedicationById(medicationId);

        if (!medication) {
          if (isMounted) {
            setLoadError('No se encontró el medicamento.');
          }

          return;
        }

        const schedules = await getSchedulesByMedicationId(medicationId);
        const schedule: MedicationSchedule | null = schedules[0] ?? null;

        if (!isMounted) {
          return;
        }

        setScheduleId(schedule?.id ?? null);
        setInitialValues({
          name: medication.name,
          dosage: medication.dosage,
          instructions: medication.instructions ?? '',
          scheduleType: schedule?.scheduleType ?? EMPTY_MEDICATION_FORM.scheduleType,
          intervalHours:
            schedule?.intervalHours != null
              ? String(schedule.intervalHours)
              : EMPTY_MEDICATION_FORM.intervalHours,
          specificTimes:
            schedule?.times && schedule.times.length > 0
              ? schedule.times.join(', ')
              : EMPTY_MEDICATION_FORM.specificTimes,
        });
      } catch (error) {
        console.error('[Medications] Error loading medication:', error);

        if (isMounted) {
          setLoadError('No se pudo cargar el medicamento.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMedication();

    return () => {
      isMounted = false;
    };
  }, [medicationId]);

  /**
   * Saves the edited medication and reschedules its notifications.
   * Returns true on success so the caller can navigate away.
   */
  const saveMedication = useCallback(
    async (values: MedicationFormValues): Promise<boolean> => {
      try {
        setIsSaving(true);

        const medication = await updateMedication(medicationId, {
          name: values.name,
          dosage: values.dosage,
          instructions: values.instructions,
        });

        if (!medication) {
          Alert.alert('Error', 'No se encontró el medicamento.');
          return false;
        }

        const schedule = scheduleId
          ? await updateMedicationSchedule(scheduleId, {
              scheduleType: values.scheduleType,
              intervalHours: values.intervalHours,
              times: values.times,
            })
          : await createMedicationSchedule({
              medicationId,
              scheduleType: values.scheduleType,
              intervalHours: values.intervalHours,
              times: values.times,
            });

        if (!schedule) {
          Alert.alert('Error', 'No se pudo guardar el horario del medicamento.');
          return false;
        }

        setScheduleId(schedule.id);

        try {
          await scheduleMedicationNotifications(medication, schedule);
        } catch (notificationError) {
          console.error(
            '[Notifications] Error rescheduling medication notifications:',
            notificationError,
          );

          Alert.alert(
            'Cambios guardados',
            'El medicamento y su horario se actualizaron, pero no se pudieron reprogramar las notificaciones.',
          );
        }

        return true;
      } catch (error) {
        console.error('[Medications] Error updating medication:', error);
        Alert.alert('Error', 'No se pudieron guardar los cambios.');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [medicationId, scheduleId],
  );

  return {
    initialValues,
    isLoading,
    loadError,
    isSaving,
    saveMedication,
  };
};
