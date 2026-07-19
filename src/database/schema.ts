export const DATABASE_NAME = 'medialerta.db';

export const CREATE_MEDICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    dosage TEXT NOT NULL,
    instructions TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

export const CREATE_MEDICATION_SCHEDULES_TABLE = `
  CREATE TABLE IF NOT EXISTS medication_schedules (
    id TEXT PRIMARY KEY NOT NULL,
    medication_id TEXT NOT NULL,
    schedule_type TEXT NOT NULL CHECK (
      schedule_type IN ('interval', 'specific_times')
    ),
    interval_hours INTEGER,
    times TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (medication_id)
      REFERENCES medications(id)
      ON DELETE CASCADE
  );
`;

export const CREATE_DOSE_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS dose_logs (
    id TEXT PRIMARY KEY NOT NULL,
    medication_id TEXT NOT NULL,
    schedule_id TEXT,
    scheduled_at TEXT NOT NULL,
    taken_at TEXT,
    status TEXT NOT NULL CHECK (
      status IN ('pending', 'taken', 'skipped', 'snoozed', 'missed')
    ),
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (medication_id)
      REFERENCES medications(id)
      ON DELETE CASCADE,
    FOREIGN KEY (schedule_id)
      REFERENCES medication_schedules(id)
      ON DELETE SET NULL
  );
`;

export const CREATE_MEDICATIONS_ACTIVE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_medications_is_active
  ON medications(is_active);
`;

export const CREATE_SCHEDULES_MEDICATION_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_medication_schedules_medication_id
  ON medication_schedules(medication_id);
`;

export const CREATE_DOSE_LOGS_MEDICATION_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_dose_logs_medication_id
  ON dose_logs(medication_id);
`;

export const CREATE_DOSE_LOGS_SCHEDULED_AT_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_dose_logs_scheduled_at
  ON dose_logs(scheduled_at);
`;

export const CREATE_DOSE_LOGS_STATUS_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_dose_logs_status
  ON dose_logs(status);
`;

export const CREATE_NOTIFICATION_SCHEDULES_TABLE = `
  CREATE TABLE IF NOT EXISTS notification_schedules (
    id TEXT PRIMARY KEY NOT NULL,
    medication_id TEXT NOT NULL,
    schedule_id TEXT NOT NULL,
    notification_identifier TEXT NOT NULL,
    trigger_type TEXT NOT NULL CHECK (
      trigger_type IN ('interval', 'daily_time')
    ),
    scheduled_time TEXT,
    interval_hours INTEGER,
    weekday INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (medication_id)
      REFERENCES medications(id)
      ON DELETE CASCADE,
    FOREIGN KEY (schedule_id)
      REFERENCES medication_schedules(id)
      ON DELETE CASCADE
  );
`;

export const CREATE_MEDICATION_SCHEDULE_DAYS_TABLE = `
  CREATE TABLE IF NOT EXISTS medication_schedule_days (
    id TEXT PRIMARY KEY NOT NULL,
    schedule_id TEXT NOT NULL,
    weekday INTEGER NOT NULL,
    FOREIGN KEY (schedule_id)
      REFERENCES medication_schedules(id)
      ON DELETE CASCADE,
    UNIQUE (schedule_id, weekday)
  );
`;

export const CREATE_SCHEDULE_DAYS_SCHEDULE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_medication_schedule_days_schedule_id
  ON medication_schedule_days(schedule_id);
`;

/**
 * ALTER TABLE to add weekday column to existing notification_schedules installations.
 * For new installs the column is already included in CREATE_NOTIFICATION_SCHEDULES_TABLE.
 */
export const ALTER_NOTIFICATION_SCHEDULES_ADD_WEEKDAY = `
  ALTER TABLE notification_schedules ADD COLUMN weekday INTEGER;
`;

/**
 * Backfill all 7 weekdays for specific_times schedules that have no days yet.
 * INSERT OR IGNORE is idempotent — safe to run on every startup.
 */
export const BACKFILL_SCHEDULE_DAYS = `
  INSERT OR IGNORE INTO medication_schedule_days (id, schedule_id, weekday)
  SELECT
    'msd_' || ms.id || '_' || w.weekday,
    ms.id,
    w.weekday
  FROM medication_schedules ms,
       (SELECT 1 AS weekday UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
        SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7) w
  WHERE ms.schedule_type = 'specific_times';
`;

export const CREATE_NOTIFICATION_SCHEDULES_MEDICATION_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_notification_schedules_medication_id
  ON notification_schedules(medication_id);
`;

export const CREATE_NOTIFICATION_SCHEDULES_SCHEDULE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_notification_schedules_schedule_id
  ON notification_schedules(schedule_id);
`;

export const CREATE_NOTIFICATION_SCHEDULES_NOTIFICATION_IDENTIFIER_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_notification_schedules_notification_identifier
  ON notification_schedules(notification_identifier);
`;
