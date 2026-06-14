export type NotificationTriggerType = 'interval' | 'daily_time';

export interface NotificationSchedule {
  id: string;
  medicationId: string;
  scheduleId: string;
  notificationIdentifier: string;
  triggerType: NotificationTriggerType;
  scheduledTime: string | null;
  intervalHours: number | null;
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
}
