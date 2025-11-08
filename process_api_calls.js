import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function getDb() {
  return open({
    filename: '/home/hani/node_api/api.sqlite3',
    driver: sqlite3.Database
  });
}

/**
 * POST /addShellCoomand
 * Body JSON: { "C": "ip a", "R": "Show IPs", "D": "2025-11-08", "V": 3 }
 * If D missing, use current date (YYYY-MM-DD).
 */
export async function process_add_shell_coomand(req, res) {
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
    const result = await db.run(
      'INSERT INTO CMD (C, R, D, V) VALUES (?, ?, ?, ?)',
      [C.trim(), R, D, V]
    );

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
export async function process_get_shell_coomand(req, res) {
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
    const colsParam = (req.query.cols || 'C,R').trim(); // default to C,R
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


// ---------- Route Handlers Section ----------
// process_api_calls.js
// Handler: GET /getRequestInfo
export function process_get_request_info(req, res) {
  const info = {
    method: req.method,
    url: req.originalUrl,
    protocol: req.protocol,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    hostname: req.hostname,
    path: req.path,
    query: req.query,
    headers: req.headers,
  };

  const type = (req.query.type || 'json').toLowerCase();

  if (type === 'html') {
    const rows = Object.entries(info)
      .map(([k, v]) => {
        const value = typeof v === 'object' ? JSON.stringify(v, null, 2) : v;
        return `
          <tr>
            <td style="border:1px solid #aaa;padding:4px;">${k}</td>
            <td style="border:1px solid #aaa;padding:4px;">
              <pre>${value}</pre>
            </td>
          </tr>`;
      })
      .join('');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <html>
        <body>
          <table style="border-collapse:collapse;font-family:monospace;">
            ${rows}
          </table>
        </body>
      </html>
    `);
  } else {
    res.json(info);
  }
}

// Handler: POST /getSquareArea
export function process_post_square_area(req, res) {
  const { side, unit } = req.body;
  if (isNaN(side)) return res.status(400).json({ error: 'Invalid side' });

  const area = side * side;
  res.json({
    side,
    area,
    unit: unit ? unit + '²' : undefined,
  });
}

// Handler: GET /getSquareArea
export function process_get_square_area(req, res) {
  const side = parseFloat(req.query.side || req.body.side);
  const unit = (req.query.unit || req.body.unit || '').trim();
  if (isNaN(side)) return res.status(400).json({ error: 'Invalid side' });

  res.json({
    side,
    area: side * side,
    unit: unit + '²',
  });
}

// Handler: GET /getSquarePerimeter
export function process_get_square_perimeter(req, res) {
  const side = parseFloat(req.query.side || req.body.side);
  const unit = (req.query.unit || req.body.unit || '').trim();
  if (isNaN(side)) return res.status(400).json({ error: 'Invalid side' });

  res.json({
    side,
    perimeter: side * 4,
    unit,
  });
}
