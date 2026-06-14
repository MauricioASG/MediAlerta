import * as SQLite from 'expo-sqlite';

import { runMigrations } from './migrations';
import { DATABASE_NAME } from './schema';

type AppDatabase = Awaited<ReturnType<typeof SQLite.openDatabaseAsync>>;

let databaseInstance: AppDatabase | null = null;

export const getDatabase = async (): Promise<AppDatabase> => {
  if (databaseInstance) {
    return databaseInstance;
  }

  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await runMigrations(database);

  databaseInstance = database;

  return databaseInstance;
};

export const initializeDatabase = async (): Promise<void> => {
  await getDatabase();
};
