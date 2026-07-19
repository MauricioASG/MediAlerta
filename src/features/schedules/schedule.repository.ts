import { getDatabase } from '../../database/database';
import { generateLocalId } from '../../shared/utils/id';
import type {
  CreateMedicationScheduleInput,
  MedicationSchedule,
  ScheduleType,
  UpdateMedicationScheduleInput,
} from '../../types/schedule.types';
import { ALL_WEEKDAYS, type Weekday } from '../../types/weekday.types';

interface MedicationScheduleRow {
  id: string;
  medication_id: string;
  schedule_type: ScheduleType;
  interval_hours: number | null;
  times: string | null;
  created_at: string;
  updated_at: string;
}

interface ScheduleDayRow {
  schedule_id: string;
  weekday: number;
}

interface NormalizedScheduleFields {
  scheduleType: ScheduleType;
  intervalHours: number | null;
  times: string[] | null;
}

const parseTimes = (times: string | null): string[] | null => {
  if (!times) {
    return null;
  }

  try {
    const parsedTimes = JSON.parse(times);

    if (!Array.isArray(parsedTimes)) {
      return null;
    }

    return parsedTimes.filter((time) => typeof time === 'string');
  } catch {
    return null;
  }
};

const mapScheduleRowToSchedule = (
  row: MedicationScheduleRow,
  weekdays: Weekday[] | null,
): MedicationSchedule => ({
  id: row.id,
  medicationId: row.medication_id,
  scheduleType: row.schedule_type,
  intervalHours: row.interval_hours,
  times: parseTimes(row.times),
  weekdays,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeScheduleFields = (
  scheduleType: ScheduleType,
  intervalHours?: number | null,
  times?: string[] | null,
): NormalizedScheduleFields => {
  if (scheduleType === 'interval') {
    if (!intervalHours || intervalHours <= 0) {
      throw new Error('El horario por intervalo requiere un intervalo mayor a 0.');
    }

    return {
      scheduleType,
      intervalHours,
      times: null,
    };
  }

  const cleanTimes = (times ?? [])
    .map((time) => time.trim())
    .filter(Boolean);

  if (cleanTimes.length === 0) {
    throw new Error('El horario por horas específicas requiere al menos una hora.');
  }

  return {
    scheduleType,
    intervalHours: null,
    times: cleanTimes,
  };
};

/** Loads weekdays for the given schedule IDs in a single query. */
const loadWeekdaysForSchedules = async (
  scheduleIds: string[],
): Promise<Record<string, Weekday[]>> => {
  if (scheduleIds.length === 0) return {};

  const database = await getDatabase();
  const placeholders = scheduleIds.map(() => '?').join(', ');

  const rows = await database.getAllAsync<ScheduleDayRow>(
    `SELECT schedule_id, weekday
     FROM medication_schedule_days
     WHERE schedule_id IN (${placeholders})
     ORDER BY schedule_id, weekday ASC;`,
    ...scheduleIds,
  );

  const result: Record<string, Weekday[]> = {};
  for (const row of rows) {
    if (!result[row.schedule_id]) {
      result[row.schedule_id] = [];
    }
    result[row.schedule_id].push(row.weekday as Weekday);
  }
  return result;
};

export const createMedicationSchedule = async (
  input: CreateMedicationScheduleInput,
): Promise<MedicationSchedule> => {
  const database = await getDatabase();

  const now = new Date().toISOString();

  const normalizedFields = normalizeScheduleFields(
    input.scheduleType,
    input.intervalHours,
    input.times,
  );

  const weekdays: Weekday[] | null =
    normalizedFields.scheduleType === 'specific_times'
      ? (input.weekdays && input.weekdays.length > 0 ? input.weekdays : ALL_WEEKDAYS)
      : null;

  const schedule: MedicationSchedule = {
    id: generateLocalId('schedule'),
    medicationId: input.medicationId,
    scheduleType: normalizedFields.scheduleType,
    intervalHours: normalizedFields.intervalHours,
    times: normalizedFields.times,
    weekdays,
    createdAt: now,
    updatedAt: now,
  };

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `
        INSERT INTO medication_schedules (
          id,
          medication_id,
          schedule_type,
          interval_hours,
          times,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `,
      schedule.id,
      schedule.medicationId,
      schedule.scheduleType,
      schedule.intervalHours,
      schedule.times ? JSON.stringify(schedule.times) : null,
      schedule.createdAt,
      schedule.updatedAt,
    );

    if (schedule.weekdays) {
      for (const weekday of schedule.weekdays) {
        await database.runAsync(
          `INSERT INTO medication_schedule_days (id, schedule_id, weekday) VALUES (?, ?, ?);`,
          generateLocalId('day'),
          schedule.id,
          weekday,
        );
      }
    }
  });

  return schedule;
};

export const getSchedulesByMedicationId = async (
  medicationId: string,
): Promise<MedicationSchedule[]> => {
  const database = await getDatabase();

  const rows = await database.getAllAsync<MedicationScheduleRow>(
    `
      SELECT
        id,
        medication_id,
        schedule_type,
        interval_hours,
        times,
        created_at,
        updated_at
      FROM medication_schedules
      WHERE medication_id = ?
      ORDER BY created_at ASC;
    `,
    medicationId,
  );

  const specificTimeIds = rows
    .filter((r) => r.schedule_type === 'specific_times')
    .map((r) => r.id);

  const weekdaysByScheduleId = await loadWeekdaysForSchedules(specificTimeIds);

  return rows.map((row) => {
    const weekdays =
      row.schedule_type === 'specific_times'
        ? (weekdaysByScheduleId[row.id] ?? ALL_WEEKDAYS)
        : null;
    return mapScheduleRowToSchedule(row, weekdays);
  });
};

export const getScheduleById = async (
  scheduleId: string,
): Promise<MedicationSchedule | null> => {
  const database = await getDatabase();

  const row = await database.getFirstAsync<MedicationScheduleRow>(
    `
      SELECT
        id,
        medication_id,
        schedule_type,
        interval_hours,
        times,
        created_at,
        updated_at
      FROM medication_schedules
      WHERE id = ?
      LIMIT 1;
    `,
    scheduleId,
  );

  if (!row) return null;

  let weekdays: Weekday[] | null = null;
  if (row.schedule_type === 'specific_times') {
    const weekdayMap = await loadWeekdaysForSchedules([row.id]);
    weekdays = weekdayMap[row.id] ?? ALL_WEEKDAYS;
  }

  return mapScheduleRowToSchedule(row, weekdays);
};

export const updateMedicationSchedule = async (
  scheduleId: string,
  input: UpdateMedicationScheduleInput,
): Promise<MedicationSchedule | null> => {
  const currentSchedule = await getScheduleById(scheduleId);

  if (!currentSchedule) {
    return null;
  }

  const database = await getDatabase();

  const nextScheduleType = input.scheduleType ?? currentSchedule.scheduleType;
  const nextIntervalHours =
    input.intervalHours !== undefined
      ? input.intervalHours
      : currentSchedule.intervalHours;
  const nextTimes =
    input.times !== undefined ? input.times : currentSchedule.times;

  const normalizedFields = normalizeScheduleFields(
    nextScheduleType,
    nextIntervalHours,
    nextTimes,
  );

  const updatedAt = new Date().toISOString();

  await database.runAsync(
    `
      UPDATE medication_schedules
      SET
        schedule_type = ?,
        interval_hours = ?,
        times = ?,
        updated_at = ?
      WHERE id = ?;
    `,
    normalizedFields.scheduleType,
    normalizedFields.intervalHours,
    normalizedFields.times ? JSON.stringify(normalizedFields.times) : null,
    updatedAt,
    scheduleId,
  );

  if (input.weekdays !== undefined && normalizedFields.scheduleType === 'specific_times') {
    const newWeekdays =
      input.weekdays && input.weekdays.length > 0 ? input.weekdays : ALL_WEEKDAYS;

    await database.runAsync(
      'DELETE FROM medication_schedule_days WHERE schedule_id = ?;',
      scheduleId,
    );

    for (const weekday of newWeekdays) {
      await database.runAsync(
        'INSERT INTO medication_schedule_days (id, schedule_id, weekday) VALUES (?, ?, ?);',
        generateLocalId('day'),
        scheduleId,
        weekday,
      );
    }
  }

  return getScheduleById(scheduleId);
};

export const deleteMedicationSchedule = async (
  scheduleId: string,
): Promise<void> => {
  const database = await getDatabase();

  await database.runAsync(
    `
      DELETE FROM medication_schedules
      WHERE id = ?;
    `,
    scheduleId,
  );
};

export const deleteSchedulesByMedicationId = async (
  medicationId: string,
): Promise<void> => {
  const database = await getDatabase();

  await database.runAsync(
    `
      DELETE FROM medication_schedules
      WHERE medication_id = ?;
    `,
    medicationId,
  );
};
