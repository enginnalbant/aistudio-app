import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'local.db');
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
const schema: any = {};

for (const table of tables as any[]) {
  schema[table.name] = db.prepare(`PRAGMA table_info(${table.name})`).all();
}

console.log(JSON.stringify(schema, null, 2));
