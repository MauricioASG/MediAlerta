import type { Weekday } from './weekday.types';

export type ScheduleType = 'interval' | 'specific_times';

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  scheduleType: ScheduleType;
  intervalHours: number | null;
  times: string[] | null;
  /** Days of the week for specific_times schedules. null for interval schedules. */
  weekdays: Weekday[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicationScheduleInput {
  medicationId: string;
  scheduleType: ScheduleType;
  intervalHours?: number | null;
  times?: string[] | null;
  weekdays?: Weekday[] | null;
}

export interface UpdateMedicationScheduleInput {
  scheduleType?: ScheduleType;
  intervalHours?: number | null;
  times?: string[] | null;
  weekdays?: Weekday[] | null;
}
