import Database from 'better-sqlite3';
const db = new Database('server/database.db');
const rows = db.prepare('SELECT * FROM categories').all();
console.log(JSON.stringify(rows, null, 2));
