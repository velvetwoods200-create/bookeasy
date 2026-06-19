import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let dbInitialized = false;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  }
  return pool;
}

function toPostgres(query: string): string {
  let i = 0;
  return query.replace(/\?/g, () => `$${++i}`);
}

export async function initDb(): Promise<void> {
  if (dbInitialized) return;
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      slug TEXT UNIQUE,
      business_name TEXT,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      subscription_status TEXT NOT NULL DEFAULT 'trialing',
      trial_end BIGINT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    )
  `);
  await p.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL DEFAULT 30,
      price NUMERIC NOT NULL DEFAULT 0,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    )
  `);
  await p.query(`
    CREATE TABLE IF NOT EXISTS working_hours (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL DEFAULT '09:00',
      end_time TEXT NOT NULL DEFAULT '17:00',
      is_active INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, day_of_week)
    )
  `);
  await p.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
      service_name TEXT NOT NULL,
      service_duration INTEGER NOT NULL,
      service_price NUMERIC NOT NULL DEFAULT 0,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    )
  `);
  dbInitialized = true;
}

async function query(sql: string, params: unknown[]) {
  await initDb();
  return getPool().query(toPostgres(sql), params);
}

export async function dbGet<T>(sql: string, ...params: unknown[]): Promise<T | undefined> {
  const result = await query(sql, params);
  return result.rows[0] as T | undefined;
}

export async function dbAll<T>(sql: string, ...params: unknown[]): Promise<T[]> {
  const result = await query(sql, params);
  return result.rows as T[];
}

export async function dbRun(sql: string, ...params: unknown[]): Promise<void> {
  await query(sql, params);
}

export interface DbUser {
  id: number;
  name: string;
  email: string;
  password: string;
  slug: string | null;
  business_name: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
  trial_end: number | null;
  created_at: number;
}

export interface DbService {
  id: number;
  user_id: number;
  name: string;
  duration: number;
  price: number;
  created_at: number;
}

export interface DbWorkingHours {
  id: number;
  user_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: number;
}

export interface DbBooking {
  id: number;
  user_id: number;
  service_id: number | null;
  service_name: string;
  service_duration: number;
  service_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: number;
}
