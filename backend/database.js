const { Pool } = require('pg');

let pool;

function getDb() {
  if (pool) return pool;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase requires SSL, Cloud SQL usually handles it securely but standard practice is to allow it.
    ssl: { rejectUnauthorized: false }
  });

  pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database.');
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  // Initialize tables
  const initDb = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          mode TEXT,
          vuln_impact_score INTEGER,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Conversations table is ready.');
    } catch (err) {
      console.error('Error creating conversations table:', err.message);
    }
  };

  initDb();

  return pool;
}

module.exports = { getDb };
