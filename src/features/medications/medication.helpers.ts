import type { MedicationSchedule } from '../../types/schedule.types';
import { ALL_WEEKDAYS, WEEKDAY_ABBR, type Weekday } from '../../types/weekday.types';

const formatWeekdays = (weekdays: Weekday[]): string => {
  if (weekdays.length === ALL_WEEKDAYS.length) return 'Todos los días';

  const sorted = ([...weekdays] as Weekday[]).sort((a, b) => a - b);
  const abbrs = sorted.map((d) => WEEKDAY_ABBR[d]);

  if (abbrs.length === 1) return abbrs[0];

  return `${abbrs.slice(0, -1).join(', ')} y ${abbrs[abbrs.length - 1]}`;
};

const formatTimes = (times: string[]): string => {
  if (times.length === 1) return times[0];
  return `${times.slice(0, -1).join(', ')} y ${times[times.length - 1]}`;
};

export const buildScheduleSummary = (
  schedule: MedicationSchedule | null,
): string => {
  if (!schedule) return 'Sin horario configurado';

  if (schedule.scheduleType === 'interval') {
    return `Cada ${schedule.intervalHours} horas`;
  }

  const weekdays = schedule.weekdays ?? ALL_WEEKDAYS;
  const times = schedule.times ?? [];

  const daysStr = formatWeekdays(weekdays);
  const timesStr = times.length > 0 ? ` · ${formatTimes(times)}` : '';

  return `${daysStr}${timesStr}`;
};

export const parseSpecificTimes = (value: string): string[] => {
  return value
    .split(',')
    .map((time) => time.trim())
    .filter(Boolean);
};
