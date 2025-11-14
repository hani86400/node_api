import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// ---------- Route Handlers Section ----------


import * as api_square        from './api_process_square.js';
import * as api_request_info  from './api_process_request_info.js';
//import * as api_commands1     from './api_process_commands1.js';
import * as api_commands2     from './api_process_commands2.js';
import * as api_items         from './api_process_items.js';

console.log(Object.keys(api_square));
Object.entries(api_request_info).forEach(([name, fn]) => console.log(`Loaded ${name}`));
Object.entries(api_items).forEach(([name, fn]) => console.log(`Loaded ${name}`));
//Object.entries(api_commands1).forEach(([name, fn]) => console.log(`Loaded ${name}`));
Object.entries(api_commands2).forEach(([name, fn]) => console.log(`Loaded ${name}`));

const app = express();


dotenv.config();
const HOSTNAME = process.env.HOSTNAME || 'localhost';
const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.API_TOKEN || '12345';

// Generic async error wrapper for Express routes
const asyncHandler = fn => (req, res, next) => {Promise.resolve(fn(req, res, next)).catch(next);};




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


// 1. Parse JSON early
app.use(express.json());

// 2. Apply CORS (if needed)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',   // allow all if not specified
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));

// 3. Apply authorization
//app.use(is_authorized);


app.use((req, res, next) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    return res.status(400).json({ error: 'Expected Content-Type: application/json' });
  }
  next();
});

// ---------- Route Definitions Section ----------

// Base routes
app.get( '/', (req, res) => { res.send('<h1>Hello from Node in vm1 👋</h1>'); });
app.get( '/health', (req, res) => { res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });});

// Info endpoints
app.get( '/api/v1/request-info', asyncHandler(api_request_info.process_get_request_info));

// Math utilities (square geometry)
app.post('/api/v1/squares/area', asyncHandler(api_square.process_post_square_area));
app.get( '/api/v1/squares/area', asyncHandler(api_square.process_get_square_area));
app.get( '/api/v1/squares/perimeter', asyncHandler(api_square.process_get_square_perimeter));

// SQLite-based shell command endpoints
//app.get( '/api/v1/commands/least-used', asyncHandler(api_commands1.process_get_shell_command));
//app.post('/api/v1/commands', asyncHandler(api_commands1.process_add_shell_command));

app.get( '/api/v1/commands/least-used', asyncHandler(api_commands2.process_get_shell_command));
app.post('/api/v1/commands', asyncHandler(api_commands2.process_add_shell_command));



// In-memory items CRUD
app.get('/api/items', asyncHandler(api_items.process_get_all_items));
app.get('/api/items/:id', asyncHandler(api_items.process_get_item));
app.post('/api/items', asyncHandler(api_items.process_add_item));
app.put('/api/items/:id', asyncHandler(api_items.process_update_item));
app.delete('/api/items/:id', asyncHandler(api_items.process_delete_item));



app.use((err, req, res, next) => {
  console.error('🔥 Error in route:', req.path, '\n', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});


//+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ +
//| Server settings & running
//+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ +
//+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ +
process.on('SIGINT', () => {console.log('\n🛑 Server shutting down...');  process.exit(0);});

app.listen(PORT,HOSTNAME, () => console.log(`✅ server running Mode: ${process.env.NODE_ENV || 'development'} on HOST=${HOSTNAME} PORT=${PORT}`))
//+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ +


