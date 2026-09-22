import pg from 'pg';
import { ENV } from './env.js';

const { Pool } = pg;

const isProduction = ENV.NODE_ENV === 'production';
const isRemoteDb = ENV.DATABASE_URL && (ENV.DATABASE_URL.includes('supabase') || ENV.DATABASE_URL.includes('render') || ENV.DATABASE_URL.includes('aws'));

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  ssl: isRemoteDb || isProduction ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('[Database Pool Error]:', err.message);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (ENV.NODE_ENV === 'development') {
      // console.log(`[SQL Query] (${duration}ms):`, text.slice(0, 80));
    }
    return res;
  } catch (err) {
    console.error('[SQL Execution Error]:', err.message, '\nQuery:', text);
    throw err;
  }
};
