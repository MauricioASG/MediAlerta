export type MedicationType =
  | 'tablet'
  | 'capsule'
  | 'syrup'
  | 'injection'
  | 'drops'
  | 'insulin'
  | 'other';

export interface Medication {
  id: string;
  name: string;
  type: MedicationType;
  dosage: string;
  instructions?: string | null;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicationInput {
  name: string;
  type: MedicationType;
  dosage: string;
  instructions?: string | null;
  startDate: string;
  endDate?: string | null;
}

export interface UpdateMedicationInput {
  name?: string;
  type?: MedicationType;
  dosage?: string;
  instructions?: string | null;
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
}
