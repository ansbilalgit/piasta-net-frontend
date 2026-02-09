import Database from 'better-sqlite3';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    const db = new Database(dbPath);

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const sort = searchParams.get('sort') || 'name';
    const minTimeParam = searchParams.get('min_time');
    const maxTimeParam = searchParams.get('max_time');
    const minTime = minTimeParam ? Number(minTimeParam) : null;
    const maxTime = maxTimeParam ? Number(maxTimeParam) : null;

    // Determine which columns exist in the `items` table and select only those
    const pragma = db.prepare("PRAGMA table_info(items)").all();
    const colNames = pragma.map((c: any) => c.name);

    const baseCols = ['id', 'name', 'length', 'description', 'thumbnail', 'type', 'copies'];
    const selectCols = baseCols.filter((c) => colNames.includes(c));
    // Qualify base columns with the items table to avoid ambiguous column errors
    const qualifiedSelects = selectCols.map((c) => `items.${c}`);

    // Check which auxiliary tables exist so we can safely LEFT JOIN them
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r: any) => r.name);
    const hasBoardgames = tables.includes('boardgames');
    const hasVideogames = tables.includes('videogames');

    // If client only wants the max length, return it quickly
    if (searchParams.has('get_max_length')) {
      if (!colNames.includes('length')) {
        db.close();
        return NextResponse.json({ success: true, maxLength: null });
      }
      const row = db.prepare("SELECT MAX(items.length) as maxLength FROM items WHERE items.type != 'book'").get();
      const maxLength = row ? (row.maxLength ?? null) : null;
      db.close();
      return NextResponse.json({ success: true, maxLength });
    }

    if (hasBoardgames || hasVideogames) {
      // Add player columns via COALESCE when possible
      qualifiedSelects.push("COALESCE(boardgames.min_players, videogames.min_players) AS min_players");
      qualifiedSelects.push("COALESCE(boardgames.max_players, videogames.max_players) AS max_players");
    }

    // Always exclude books from results
    let query = `SELECT ${qualifiedSelects.join(', ')} FROM items`;
    if (hasBoardgames) query += ' LEFT JOIN boardgames ON items.id = boardgames.id';
    if (hasVideogames) query += ' LEFT JOIN videogames ON items.id = videogames.id';
    query += " WHERE items.type != 'book'";
    const params: any[] = [];

    // Add search filter
    if (search) {
      query += ' AND items.name LIKE ?';
      params.push(`%${search}%`);
    }

    // Add duration filters if length column exists
    if (colNames.includes('length')) {
      if (minTime != null && !Number.isNaN(minTime)) {
        query += ' AND items.length >= ?';
        params.push(minTime);
      }
      if (maxTime != null && !Number.isNaN(maxTime)) {
        query += ' AND items.length <= ?';
        params.push(maxTime);
      }
    }

    // Add type filter
    if (type && type !== 'All Games') {
      query += ' AND items.type = ?';
      params.push(type);
    }

    // Add sorting
    if (sort === 'Z-A') {
      query += ' ORDER BY items.name DESC';
    } else {
      query += ' ORDER BY items.name ASC';
    }

    // Debug logging: show incoming params and constructed query
    console.log('API /api/items called with:', { search, type, sort });
    console.log('Constructed SQL:', query, 'params:', params);

    const stmt = db.prepare(query);
    const items = stmt.all(...params);
    console.log('Returned items count:', items.length);

    db.close();

    return NextResponse.json({ items, success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items', success: false },
      { status: 500 }
    );
  }
}
