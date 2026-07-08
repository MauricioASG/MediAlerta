import type { MedicationSchedule } from '../../types/schedule.types';

export const buildScheduleSummary = (
  schedule: MedicationSchedule | null,
): string => {
  if (!schedule) {
    return 'Sin horario configurado';
  }

  if (schedule.scheduleType === 'interval') {
    return `Cada ${schedule.intervalHours} horas`;
  }

  return `A las ${schedule.times?.join(', ')}`;
};

export const parseSpecificTimes = (value: string): string[] => {
  return value
    .split(',')
    .map((time) => time.trim())
    .filter(Boolean);
};
