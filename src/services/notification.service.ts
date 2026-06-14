import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

export const cancelAllMedicationNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
