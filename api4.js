import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// ---------- Route Handlers Section ----------
import * as apicall  from './process_api_calls.js';
import * as apicall2 from './process_api_items.js';
Object.entries(apicall).forEach(([name, fn]) => console.log(`Loaded ${name}`));

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


// SQLite-based commands
app.get('/getShellCommand', asyncHandler(apicall.process_get_shell_comand));
app.post('/addShellCommand', asyncHandler(apicall.process_add_shell_command));



// ---------- Route Definitions Section ----------

// Base routes
app.get( '/', (req, res) => { res.send('<h1>Hello from Node in vm1 👋</h1>'); });
app.get( '/health', (req, res) => { res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });});

// Info endpoints
app.get( '/api/v1/request-info', asyncHandler(apicall.process_get_request_info));

// Math utilities (square geometry)
app.post('/api/v1/squares/area', asyncHandler(apicall.process_post_square_area));
app.get( '/api/v1/squares/area', asyncHandler(apicall.process_get_square_area));
app.get( '/api/v1/squares/perimeter', asyncHandler(apicall.process_get_square_perimeter));

// SQLite-based shell command endpoints
app.get( '/api/v1/commands/least-used', asyncHandler(apicall.process_get_shell_command));
app.post('/api/v1/commands', asyncHandler(apicall.process_add_shell_command));

// In-memory items CRUD
app.get('/api/items', asyncHandler(apicall2.process_get_all_items));
app.get('/api/items/:id', asyncHandler(apicall2.process_get_item));
app.post('/api/items', asyncHandler(apicall2.process_add_item));
app.put('/api/items/:id', asyncHandler(apicall2.process_update_item));
app.delete('/api/items/:id', asyncHandler(apicall2.process_delete_item));



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


