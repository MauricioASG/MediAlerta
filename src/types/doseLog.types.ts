export type DoseStatus =
  | 'pending'
  | 'taken'
  | 'skipped'
  | 'snoozed'
  | 'missed';

export interface DoseLog {
  id: string;
  medicationId: string;
  scheduleId?: string | null;
  scheduledAt: string;
  takenAt?: string | null;
  status: DoseStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoseLogInput {
  medicationId: string;
  scheduleId?: string | null;
  scheduledAt: string;
  status?: DoseStatus;
  notes?: string | null;
}

export interface UpdateDoseLogInput {
  takenAt?: string | null;
  status?: DoseStatus;
  notes?: string | null;
}
