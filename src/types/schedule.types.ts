export type ScheduleType = 'interval' | 'specific_times';

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  scheduleType: ScheduleType;
  intervalHours: number | null;
  times: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicationScheduleInput {
  medicationId: string;
  scheduleType: ScheduleType;
  intervalHours?: number | null;
  times?: string[] | null;
}

export interface UpdateMedicationScheduleInput {
  scheduleType?: ScheduleType;
  intervalHours?: number | null;
  times?: string[] | null;
}
