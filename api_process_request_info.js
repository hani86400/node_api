// api_process_request_info.js

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
