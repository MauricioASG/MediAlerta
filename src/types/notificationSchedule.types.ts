export type NotificationTriggerType = 'interval' | 'daily_time';

export interface NotificationSchedule {
  id: string;
  medicationId: string;
  scheduleId: string;
  notificationIdentifier: string;
  triggerType: NotificationTriggerType;
  scheduledTime: string | null;
  intervalHours: number | null;
  /** Domain weekday (1=Mon…7=Sun) for weekly triggers. null means fires every day. */
  weekday: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationScheduleInput {
  medicationId: string;
  scheduleId: string;
  notificationIdentifier: string;
  triggerType: NotificationTriggerType;
  scheduledTime?: string | null;
  intervalHours?: number | null;
  weekday?: number | null;
}
