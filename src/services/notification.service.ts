import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  createNotificationSchedule,
  deactivateNotificationSchedulesByMedicationId,
  getActiveNotificationSchedulesByMedicationId,
} from '../features/notifications';
import type { Medication } from '../types/medication.types';
import type { MedicationSchedule } from '../types/schedule.types';
import { ALL_WEEKDAYS, type Weekday } from '../types/weekday.types';

const MEDIALERTA_NOTIFICATION_CHANNEL_ID = 'medialerta-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface ScheduleTestNotificationInput {
  medicationName: string;
  dosage: string;
  instructions?: string | null;
}

interface ParsedTime {
  hour: number;
  minute: number;
}

const configureAndroidNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    MEDIALERTA_NOTIFICATION_CHANNEL_ID,
    {
      name: 'Recordatorios de medicamentos',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563eb',
    },
  );
};

const parseTime = (time: string): ParsedTime => {
  const [hourValue, minuteValue] = time.split(':');

  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error(`Hora inválida: ${time}`);
  }

  return {
    hour,
    minute,
  };
};

const buildMedicationNotificationBody = (medication: Medication): string => {
  const bodyParts = [`Dosis: ${medication.dosage}`];

  if (medication.instructions) {
    bodyParts.push(`Instrucción: ${medication.instructions}`);
  }

  return bodyParts.join('. ');
};

/**
 * Maps a domain weekday (1=Mon…7=Sun) to expo-notifications weekday (1=Sun, 2=Mon…7=Sat).
 * Formula: (weekday % 7) + 1
 */
const toExpoWeekday = (weekday: Weekday): number => (weekday % 7) + 1;

export const requestNotificationPermissions = async (): Promise<boolean> => {
  await configureAndroidNotificationChannel();

  const currentPermissions = await Notifications.getPermissionsAsync();

  if (currentPermissions.status === 'granted') {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();

  return requestedPermissions.status === 'granted';
};

export const scheduleTestMedicationNotification = async ({
  medicationName,
  dosage,
  instructions,
}: ScheduleTestNotificationInput): Promise<string> => {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    throw new Error('El usuario no concedió permisos de notificación.');
  }

  const bodyParts = [`Dosis: ${dosage}`];

  if (instructions) {
    bodyParts.push(`Instrucción: ${instructions}`);
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Hora de tomar ${medicationName}`,
      body: bodyParts.join('. '),
      sound: 'default',
      data: {
        type: 'medication_reminder_test',
        medicationName,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: MEDIALERTA_NOTIFICATION_CHANNEL_ID,
    },
  });

  return notificationId;
};

export const cancelMedicationNotifications = async (
  medicationId: string,
): Promise<void> => {
  const storedNotifications =
    await getActiveNotificationSchedulesByMedicationId(medicationId);

  await Promise.all(
    storedNotifications.map(async (storedNotification) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(
          storedNotification.notificationIdentifier,
        );
      } catch (error) {
        console.warn(
          '[Notifications] Error canceling scheduled notification:',
          error,
        );
      }
    }),
  );

  await deactivateNotificationSchedulesByMedicationId(medicationId);
};

export const scheduleMedicationNotifications = async (
  medication: Medication,
  schedule: MedicationSchedule,
): Promise<string[]> => {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    throw new Error('El usuario no concedió permisos de notificación.');
  }

  await cancelMedicationNotifications(medication.id);

  const notificationIds: string[] = [];

  if (schedule.scheduleType === 'interval') {
    if (!schedule.intervalHours || schedule.intervalHours <= 0) {
      throw new Error('El horario por intervalo requiere horas válidas.');
    }

    const seconds = schedule.intervalHours * 60 * 60;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Hora de tomar ${medication.name}`,
        body: buildMedicationNotificationBody(medication),
        sound: 'default',
        data: {
          type: 'medication_reminder',
          medicationId: medication.id,
          scheduleId: schedule.id,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: true,
        channelId: MEDIALERTA_NOTIFICATION_CHANNEL_ID,
      },
    });

    await createNotificationSchedule({
      medicationId: medication.id,
      scheduleId: schedule.id,
      notificationIdentifier: notificationId,
      triggerType: 'interval',
      intervalHours: schedule.intervalHours,
      scheduledTime: null,
      weekday: null,
    });

    notificationIds.push(notificationId);

    return notificationIds;
  }

  const times = schedule.times ?? [];

  if (times.length === 0) {
    throw new Error('El horario por horas específicas requiere horas válidas.');
  }

  const weekdays: Weekday[] = schedule.weekdays ?? ALL_WEEKDAYS;
  const isAllDays = weekdays.length === ALL_WEEKDAYS.length;

  for (const time of times) {
    const { hour, minute } = parseTime(time);

    if (isAllDays) {
      // All 7 days — use daily trigger (1 notification per time slot).
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Hora de tomar ${medication.name}`,
          body: buildMedicationNotificationBody(medication),
          sound: 'default',
          data: {
            type: 'medication_reminder',
            medicationId: medication.id,
            scheduleId: schedule.id,
            scheduledTime: time,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: MEDIALERTA_NOTIFICATION_CHANNEL_ID,
        },
      });

      await createNotificationSchedule({
        medicationId: medication.id,
        scheduleId: schedule.id,
        notificationIdentifier: notificationId,
        triggerType: 'daily_time',
        scheduledTime: time,
        intervalHours: null,
        weekday: null,
      });

      notificationIds.push(notificationId);
    } else {
      // Specific days — one weekly notification per (day × time) combination.
      for (const weekday of weekdays) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Hora de tomar ${medication.name}`,
            body: buildMedicationNotificationBody(medication),
            sound: 'default',
            data: {
              type: 'medication_reminder',
              medicationId: medication.id,
              scheduleId: schedule.id,
              scheduledTime: time,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: toExpoWeekday(weekday),
            hour,
            minute,
            channelId: MEDIALERTA_NOTIFICATION_CHANNEL_ID,
          },
        });

        await createNotificationSchedule({
          medicationId: medication.id,
          scheduleId: schedule.id,
          notificationIdentifier: notificationId,
          triggerType: 'daily_time',
          scheduledTime: time,
          intervalHours: null,
          weekday,
        });

        notificationIds.push(notificationId);
      }
    }
  }

  return notificationIds;
};

export const cancelAllMedicationNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
