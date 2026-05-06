const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables before requiring files that use them
dotenv.config();

const { getDb } = require('./database');
const { analyzeInput } = require('./aiService');


const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy is required for Cloud Run to correctly identify client IPs for rate limiting
app.set('trust proxy', 1);

// Security Middleware: Helmet
// Configured to allow our own Vite assets and inline styles/scripts for the React build
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://logincdn.msauth.net"], // Allow Microsoft logo for Sandbox
      connectSrc: ["'self'", "https://api.pwnedpasswords.com"], // Allow HIBP API
    },
  },
}));

// Security Middleware: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per `window` (here, per minute)
  message: { error: 'Too many requests from this IP, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Security Middleware: CORS
// In production (Cloud Run), the frontend is served from the same origin, so we don't strictly need external CORS.
// But we allow it strictly for the local Vite dev server.
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security Middleware: Payload Size Limit
// Prevent DoS via massive JSON payloads
app.use(express.json({ limit: '10kb' }));

// Initialize Database connection
const pool = getDb();

// API Routes
app.post('/api/chat', async (req, res) => {
  const { message, mode } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // 1. Log the incoming message to database
    try {
      await pool.query(
        'INSERT INTO conversations (role, content, mode) VALUES ($1, $2, $3)',
        ['user', message, mode || 'Forum']
      );
    } catch (err) {
      console.error('Error inserting user message:', err.message);
    }

    // 2. Call the AI Service to analyze the message
    const analysisResult = await analyzeInput(message, mode);

    // 3. Log the AI response to database
    try {
      await pool.query(
        'INSERT INTO conversations (role, content, mode, vuln_impact_score) VALUES ($1, $2, $3, $4)',
        ['ai', JSON.stringify(analysisResult), mode || 'Forum', analysisResult.vuln_impact_score]
      );
    } catch (err) {
      console.error('Error inserting ai message:', err.message);
    }

    // 4. Return the result strictly as JSON
    return res.json(analysisResult);
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM conversations ORDER BY timestamp ASC');
    res.json({ history: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static files in production
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Catch-all route to serve index.html for client-side routing
// In Express 5, app.get('*') throws a PathError, so we use app.use() as the fallback.
app.use((req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ZeroDay Backend is running on port ${PORT}`);
});
