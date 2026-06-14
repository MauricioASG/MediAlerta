import { getDatabase } from '../../database/database';
import type {
  CreateMedicationInput,
  Medication,
  MedicationType,
  UpdateMedicationInput,
} from '../../types/medication.types';
import { generateLocalId } from '../../shared/utils/id';

type SQLiteValue = string | number | null;

interface MedicationRow {
  id: string;
  name: string;
  type: MedicationType;
  dosage: string;
  instructions: string | null;
  start_date: string;
  end_date: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const mapMedicationRowToMedication = (row: MedicationRow): Medication => ({
  id: row.id,
  name: row.name,
  type: row.type,
  dosage: row.dosage,
  instructions: row.instructions,
  startDate: row.start_date,
  endDate: row.end_date,
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createMedication = async (
  input: CreateMedicationInput,
): Promise<Medication> => {
  const database = await getDatabase();

  const now = new Date().toISOString();

  const medication: Medication = {
    id: generateLocalId('med'),
    name: input.name.trim(),
    type: input.type,
    dosage: input.dosage.trim(),
    instructions: input.instructions?.trim() || null,
    startDate: input.startDate,
    endDate: input.endDate || null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await database.runAsync(
    `
      INSERT INTO medications (
        id,
        name,
        type,
        dosage,
        instructions,
        start_date,
        end_date,
        is_active,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    medication.id,
    medication.name,
    medication.type,
    medication.dosage,
    medication.instructions ?? null,
    medication.startDate,
    medication.endDate ?? null,
    medication.isActive ? 1 : 0,
    medication.createdAt,
    medication.updatedAt,
  );

  return medication;
};

export const getMedications = async (): Promise<Medication[]> => {
  const database = await getDatabase();

  const rows = await database.getAllAsync<MedicationRow>(`
    SELECT
      id,
      name,
      type,
      dosage,
      instructions,
      start_date,
      end_date,
      is_active,
      created_at,
      updated_at
    FROM medications
    ORDER BY name ASC;
  `);

  return rows.map(mapMedicationRowToMedication);
};

export const getActiveMedications = async (): Promise<Medication[]> => {
  const database = await getDatabase();

  const rows = await database.getAllAsync<MedicationRow>(`
    SELECT
      id,
      name,
      type,
      dosage,
      instructions,
      start_date,
      end_date,
      is_active,
      created_at,
      updated_at
    FROM medications
    WHERE is_active = 1
    ORDER BY name ASC;
  `);

  return rows.map(mapMedicationRowToMedication);
};

export const getMedicationById = async (
  medicationId: string,
): Promise<Medication | null> => {
  const database = await getDatabase();

  const row = await database.getFirstAsync<MedicationRow>(
    `
      SELECT
        id,
        name,
        type,
        dosage,
        instructions,
        start_date,
        end_date,
        is_active,
        created_at,
        updated_at
      FROM medications
      WHERE id = ?
      LIMIT 1;
    `,
    medicationId,
  );

  return row ? mapMedicationRowToMedication(row) : null;
};

export const updateMedication = async (
  medicationId: string,
  input: UpdateMedicationInput,
): Promise<Medication | null> => {
  const database = await getDatabase();

  const updates: string[] = [];
  const values: SQLiteValue[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    values.push(input.name.trim());
  }

  if (input.type !== undefined) {
    updates.push('type = ?');
    values.push(input.type);
  }

  if (input.dosage !== undefined) {
    updates.push('dosage = ?');
    values.push(input.dosage.trim());
  }

  if (input.instructions !== undefined) {
    updates.push('instructions = ?');
    values.push(input.instructions?.trim() || null);
  }

  if (input.startDate !== undefined) {
    updates.push('start_date = ?');
    values.push(input.startDate);
  }

  if (input.endDate !== undefined) {
    updates.push('end_date = ?');
    values.push(input.endDate || null);
  }

  if (input.isActive !== undefined) {
    updates.push('is_active = ?');
    values.push(input.isActive ? 1 : 0);
  }

  if (updates.length === 0) {
    return getMedicationById(medicationId);
  }

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());

  values.push(medicationId);

  await database.runAsync(
    `
      UPDATE medications
      SET ${updates.join(', ')}
      WHERE id = ?;
    `,
    ...values,
  );

  return getMedicationById(medicationId);
};

export const deactivateMedication = async (
  medicationId: string,
): Promise<Medication | null> => {
  return updateMedication(medicationId, {
    isActive: false,
  });
};

export const deleteMedication = async (
  medicationId: string,
): Promise<void> => {
  const database = await getDatabase();

  await database.runAsync(
    `
      DELETE FROM medications
      WHERE id = ?;
    `,
    medicationId,
  );
};
