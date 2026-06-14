import { getDatabase } from './database';

interface SQLiteTableInfo {
  name: string;
}

export const logDatabaseTables = async (): Promise<void> => {
  const database = await getDatabase();

  const tables = await database.getAllAsync<SQLiteTableInfo>(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name;
  `);

  const tableNames = tables.map((table) => table.name);

  console.log('[SQLite] Database initialized successfully');
  console.log('[SQLite] Tables:', tableNames.join(', '));
};
