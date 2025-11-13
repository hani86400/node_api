// api_process_commands1.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPath = process.env.SQLITE_PATH || './db/api.sqlite3';

async function getDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

/**
 * POST /addShellCoomand
 * Body JSON: { "C": "ip a", "R": "Show IPs", "D": "2025-11-08", "V": 3 }
 * If D missing, use current date (YYYY-MM-DD).
 */
export async function process_add_shell_command(req, res) {
  try {
    const db = await getDb();

    // Extract fields from body
    let { C, R = null, D = null, V = 0 } = req.body;

    if (!C || typeof C !== 'string' || !C.trim()) {
      return res.status(400).json({ error: 'Missing or invalid field: C (command)' });
    }

    // If D is missing or falsy, set to current date
    if (!D) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      D = `${yyyy}-${mm}-${dd}`;
    }

    // Run parameterized INSERT
    const result = await db.run('INSERT INTO CMD (C, R, D, V) VALUES (?, ?, ?, ?)', [C.trim(), R, D, V] );

    const inserted = await db.get('SELECT * FROM CMD WHERE N = ?', [result.lastID]);

    res.status(201).json({
      message: 'Command added successfully',
      id: result.lastID,
      row: inserted
    });

    await db.close();
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}


/**
 * GET /getShellCoomand?cols=C,R or cols=C,R,D
 * Selects the least-used command, increments V, returns chosen columns.
 */
export async function process_get_shell_command(req, res) {
  //throw new Error('Fake DB error for testing');	
  try {
    const db = await getDb();

    // 1) Pick one least-used row
    const row = await db.get('SELECT N, C, R, D, V FROM CMD ORDER BY V ASC, N ASC LIMIT 1;' );
    if (!row) return res.status(404).json({ error: 'No commands found' });

    // 2) Increment V safely
    const newV = row.V > 999 ? 1 : row.V + 1;
    await db.run('UPDATE CMD SET V = ? WHERE N = ?', [newV, row.N]);

    // 3) Determine which columns to return
    //    Example: ?cols=C,R,D
    const colsParam = (req.query.cols || 'C,R,V').trim(); // default to C,R
    const allowed = ['N', 'C', 'R', 'D', 'V'];          // safety whitelist
    const cols = colsParam
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(c => allowed.includes(c));

    if (cols.length === 0) return res.status(400).json({ error: 'Invalid cols parameter' });

    // 4) Build object with selected keys only
    const result = {};
    for (const c of cols) result[c] = row[c];

    res.json(result);
    await db.close();

  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

