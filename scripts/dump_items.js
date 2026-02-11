const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  const db = new Database(dbPath, { readonly: true });

  const query = `SELECT id, name, length, description, thumbnail, type, copies, min_players, max_players
                 FROM items
                 WHERE type != 'book'
                 ORDER BY name ASC`;

  const stmt = db.prepare(query);
  const rows = stmt.all();
  console.log(JSON.stringify({ success: true, count: rows.length, items: rows }, null, 2));
  db.close();
} catch (err) {
  console.error(JSON.stringify({ success: false, error: String(err) }));
  process.exit(1);
}
