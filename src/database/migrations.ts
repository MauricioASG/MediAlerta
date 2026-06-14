import {
  CREATE_DOSE_LOGS_MEDICATION_INDEX,
  CREATE_DOSE_LOGS_SCHEDULED_AT_INDEX,
  CREATE_DOSE_LOGS_STATUS_INDEX,
  CREATE_DOSE_LOGS_TABLE,
  CREATE_MEDICATIONS_ACTIVE_INDEX,
  CREATE_MEDICATIONS_TABLE,
  CREATE_MEDICATION_SCHEDULES_TABLE,
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

  await database.execAsync(CREATE_MEDICATIONS_ACTIVE_INDEX);
  await database.execAsync(CREATE_SCHEDULES_MEDICATION_INDEX);
  await database.execAsync(CREATE_DOSE_LOGS_MEDICATION_INDEX);
  await database.execAsync(CREATE_DOSE_LOGS_SCHEDULED_AT_INDEX);
  await database.execAsync(CREATE_DOSE_LOGS_STATUS_INDEX);
};
