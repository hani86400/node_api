import express from 'express';

// ---------- Route Handlers Section ----------
import * as apicall from './process_api_calls.js';
Object.entries(apicall).forEach(([name, fn]) => console.log(`Loaded ${name}`));

const app = express();
const PORT = process.env.PORT || 3000;

// Configure your secret token
const API_TOKEN = process.env.API_TOKEN || '12345';

// ---------- Middleware Section ----------

// Authorization middleware
function is_authorized(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token !== API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// JSON body parser
app.use(express.json());

// Apply authorization to all routes
app.use(is_authorized);


// ---------- Route Definitions Section ----------

app.get('/', (req, res) => {res.send('<h1>Hello from Node in vm1 👋</h1>');});

app.get('/getRequestInfo', apicall.process_get_request_info);

app.post('/getSquareArea', apicall.process_post_square_area);
app.get('/getSquareArea', apicall.process_get_square_area);
app.get('/getSquarePerimeter', apicall.process_get_square_perimeter);

app.get( '/getShellCoomand', apicall.process_get_shell_coomand);
app.post('/addShellCoomand', apicall.process_add_shell_coomand);

// ---------- Start Server ----------

app.listen(PORT, () => {
  console.log(`✅ api4.js running on http://localhost:${PORT}`);
  console.log(`Try:\n\ncurl -X POST http://localhost:3000/getSquareArea -H "Authorization: Bearer 12345" -H "Content-Type: application/json" -d '{"side":5,"unit":"cm"}' | jq`);
  console.log(`\ncurl -X GET -H 'Authorization: Bearer 12345' 'http://localhost:3000/getSquarePerimeter?side=3&unit=cm'  | jq`);
  console.log(`\ncurl -H "Authorization: Bearer 12345" "http://localhost:3000/getRequestInfo?type=json" | jq`);
  console.log('curl -s -H "Authorization: Bearer 12345" http://localhost:3000/getShellCoomand | jq');
  console.log(`curl -s -X POST http://localhost:3000/addShellCoomand -H "Authorization: Bearer 12345" -H "Content-Type: application/json" -d '{"C":"ip a","R":"Show IPs","D":"2025-11-08","V":3}' | jq`);
});
