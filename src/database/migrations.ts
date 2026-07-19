import {
  ALTER_NOTIFICATION_SCHEDULES_ADD_WEEKDAY,
  BACKFILL_SCHEDULE_DAYS,
  CREATE_DOSE_LOGS_MEDICATION_INDEX,
  CREATE_DOSE_LOGS_SCHEDULED_AT_INDEX,
  CREATE_DOSE_LOGS_STATUS_INDEX,
  CREATE_DOSE_LOGS_TABLE,
  CREATE_MEDICATIONS_ACTIVE_INDEX,
  CREATE_MEDICATIONS_TABLE,
  CREATE_MEDICATION_SCHEDULE_DAYS_TABLE,
  CREATE_MEDICATION_SCHEDULES_TABLE,
  CREATE_NOTIFICATION_SCHEDULES_MEDICATION_INDEX,
  CREATE_NOTIFICATION_SCHEDULES_NOTIFICATION_IDENTIFIER_INDEX,
  CREATE_NOTIFICATION_SCHEDULES_SCHEDULE_INDEX,
  CREATE_NOTIFICATION_SCHEDULES_TABLE,
  CREATE_SCHEDULE_DAYS_SCHEDULE_INDEX,
  CREATE_SCHEDULES_MEDICATION_INDEX,
} from './schema';

type SQLiteDatabaseLike = {
  execAsync: (source: string) => Promise<void>;
};

export const runMigrations = async (
  database: SQLiteDatabaseLike,
): Promise<void> => {
  await database.execAsync('PRAGMA foreign_keys = ON;');

  await database.execAsync(CREATE_MEDICATIONS_TABLE);
  await database.execAsync(CREATE_MEDICATION_SCHEDULES_TABLE);
  await database.execAsync(CREATE_DOSE_LOGS_TABLE);
  await database.execAsync(CREATE_NOTIFICATION_SCHEDULES_TABLE);
  await database.execAsync(CREATE_MEDICATION_SCHEDULE_DAYS_TABLE);

  await database.execAsync(CREATE_MEDICATIONS_ACTIVE_INDEX);
  await database.execAsync(CREATE_SCHEDULES_MEDICATION_INDEX);
  await database.execAsync(CREATE_DOSE_LOGS_MEDICATION_INDEX);
  await database.execAsync(CREATE_DOSE_LOGS_SCHEDULED_AT_INDEX);
  await database.execAsync(CREATE_DOSE_LOGS_STATUS_INDEX);
  await database.execAsync(CREATE_NOTIFICATION_SCHEDULES_MEDICATION_INDEX);
  await database.execAsync(CREATE_NOTIFICATION_SCHEDULES_SCHEDULE_INDEX);
  await database.execAsync(CREATE_NOTIFICATION_SCHEDULES_NOTIFICATION_IDENTIFIER_INDEX);
  await database.execAsync(CREATE_SCHEDULE_DAYS_SCHEDULE_INDEX);

  // Add weekday column to notification_schedules on existing installs.
  // Fails silently when the column already exists (new installs have it from CREATE TABLE).
  try {
    await database.execAsync(ALTER_NOTIFICATION_SCHEDULES_ADD_WEEKDAY);
  } catch {
    // Column already present — safe to ignore.
  }

  // Backfill all 7 weekdays for existing specific_times schedules.
  // INSERT OR IGNORE makes this idempotent on repeated startups.
  await database.execAsync(BACKFILL_SCHEDULE_DAYS);
};
