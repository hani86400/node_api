// api_process_commands2.js
import Database from 'better-sqlite3';

// Open database once (sync, fast, thread-safe for single process)
const dbPath = process.env.SQLITE_PATH || './db/api.sqlite3';
const db = new Database(dbPath, { fileMustExist: true });

// Helper: Get today’s date as YYYY-MM-DD
function currentDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * POST /api/v1/commands
 * Body JSON: { "C": "ip a", "R": "Show IPs", "D": "2025-11-08", "V": 3 }
 * If D missing, use current date (YYYY-MM-DD).
 */
export function process_add_shell_command(req, res) {
  try {
    let { C, R = null, D = null, V = 0 } = req.body;

    if (!C || typeof C !== 'string' || !C.trim()) {
      return res.status(400).json({ error: 'Missing or invalid field: C (command)' });
    }

    D = D || currentDate();

    const stmt = db.prepare('INSERT INTO CMD (C, R, D, V) VALUES (?, ?, ?, ?)');
    const result = stmt.run(C.trim(), R, D, V);

    const inserted = db.prepare('SELECT * FROM CMD WHERE N = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Command added successfully',
      id: result.lastInsertRowid,
      row: inserted
    });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

/**
 * GET /api/v1/commands/least-used?cols=C,R,D
 * Selects the least-used command, increments V, returns chosen columns.
 */
export function process_get_shell_command(req, res) {
  try {
    const row = db.prepare('SELECT N, C, R, D, V FROM CMD ORDER BY V ASC, N ASC LIMIT 1;').get();
    if (!row) return res.status(404).json({ error: 'No commands found' });

    const newV = row.V > 999 ? 1 : row.V + 1;
    db.prepare('UPDATE CMD SET V = ? WHERE N = ?').run(newV, row.N);

    const colsParam = (req.query.cols || 'C,R,V').trim();
    const allowed = ['N', 'C', 'R', 'D', 'V'];
    const cols = colsParam
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(c => allowed.includes(c));

    if (cols.length === 0) return res.status(400).json({ error: 'Invalid cols parameter' });

    const result = {};
    for (const c of cols) result[c] = row[c];

    res.json(result);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}
