const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  const db = new Database(dbPath, { readonly: true });

  const cols = db.prepare("PRAGMA table_info(items)").all();
  const colNames = cols.map(c => c.name);
  console.error('columns:', colNames.join(', '));

  const selectCols = ['id','name','length','description','thumbnail','type','copies']
    .filter(c => colNames.includes(c));

  // optionally include min/max players if present
  if (colNames.includes('min_players') && colNames.includes('max_players')) {
    selectCols.push('min_players','max_players');
  }

  const query = `SELECT ${selectCols.join(', ')} FROM items WHERE type != 'book' ORDER BY name ASC`;
  const rows = db.prepare(query).all();
  console.log(JSON.stringify({ success: true, count: rows.length, items: rows }, null, 2));
  db.close();
} catch (err) {
  console.error(JSON.stringify({ success: false, error: String(err) }));
  process.exit(1);
}
