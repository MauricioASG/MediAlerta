import { getDatabase } from '../../database/database';
import { generateLocalId } from '../../shared/utils/id';
import type {
  CreateNotificationScheduleInput,
  NotificationSchedule,
  NotificationTriggerType,
} from '../../types/notificationSchedule.types';

interface NotificationScheduleRow {
  id: string;
  medication_id: string;
  schedule_id: string;
  notification_identifier: string;
  trigger_type: NotificationTriggerType;
  scheduled_time: string | null;
  interval_hours: number | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const mapNotificationScheduleRowToNotificationSchedule = (
  row: NotificationScheduleRow,
): NotificationSchedule => ({
  id: row.id,
  medicationId: row.medication_id,
  scheduleId: row.schedule_id,
  notificationIdentifier: row.notification_identifier,
  triggerType: row.trigger_type,
  scheduledTime: row.scheduled_time,
  intervalHours: row.interval_hours,
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createNotificationSchedule = async (
  input: CreateNotificationScheduleInput,
): Promise<NotificationSchedule> => {
  const database = await getDatabase();

  const now = new Date().toISOString();

  const notificationSchedule: NotificationSchedule = {
    id: generateLocalId('notification'),
    medicationId: input.medicationId,
    scheduleId: input.scheduleId,
    notificationIdentifier: input.notificationIdentifier,
    triggerType: input.triggerType,
    scheduledTime: input.scheduledTime ?? null,
    intervalHours: input.intervalHours ?? null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await database.runAsync(
    `
      INSERT INTO notification_schedules (
        id,
        medication_id,
        schedule_id,
        notification_identifier,
        trigger_type,
        scheduled_time,
        interval_hours,
        is_active,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    notificationSchedule.id,
    notificationSchedule.medicationId,
    notificationSchedule.scheduleId,
    notificationSchedule.notificationIdentifier,
    notificationSchedule.triggerType,
    notificationSchedule.scheduledTime,
    notificationSchedule.intervalHours,
    notificationSchedule.isActive ? 1 : 0,
    notificationSchedule.createdAt,
    notificationSchedule.updatedAt,
  );

  return notificationSchedule;
};

export const getActiveNotificationSchedulesByMedicationId = async (
  medicationId: string,
): Promise<NotificationSchedule[]> => {
  const database = await getDatabase();

  const rows = await database.getAllAsync<NotificationScheduleRow>(
    `
      SELECT
        id,
        medication_id,
        schedule_id,
        notification_identifier,
        trigger_type,
        scheduled_time,
        interval_hours,
        is_active,
        created_at,
        updated_at
      FROM notification_schedules
      WHERE medication_id = ?
        AND is_active = 1
      ORDER BY created_at ASC;
    `,
    medicationId,
  );

  return rows.map(mapNotificationScheduleRowToNotificationSchedule);
};

export const getActiveNotificationSchedulesByScheduleId = async (
  scheduleId: string,
): Promise<NotificationSchedule[]> => {
  const database = await getDatabase();

  const rows = await database.getAllAsync<NotificationScheduleRow>(
    `
      SELECT
        id,
        medication_id,
        schedule_id,
        notification_identifier,
        trigger_type,
        scheduled_time,
        interval_hours,
        is_active,
        created_at,
        updated_at
      FROM notification_schedules
      WHERE schedule_id = ?
        AND is_active = 1
      ORDER BY created_at ASC;
    `,
    scheduleId,
  );

  return rows.map(mapNotificationScheduleRowToNotificationSchedule);
};

export const deactivateNotificationScheduleByIdentifier = async (
  notificationIdentifier: string,
): Promise<void> => {
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE notification_schedules
      SET
        is_active = 0,
        updated_at = ?
      WHERE notification_identifier = ?;
    `,
    new Date().toISOString(),
    notificationIdentifier,
  );
};

export const deactivateNotificationSchedulesByMedicationId = async (
  medicationId: string,
): Promise<void> => {
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE notification_schedules
      SET
        is_active = 0,
        updated_at = ?
      WHERE medication_id = ?;
    `,
    new Date().toISOString(),
    medicationId,
  );
};

export const deleteNotificationSchedulesByMedicationId = async (
  medicationId: string,
): Promise<void> => {
  const database = await getDatabase();

  await database.runAsync(
    `
      DELETE FROM notification_schedules
      WHERE medication_id = ?;
    `,
    medicationId,
  );
};
