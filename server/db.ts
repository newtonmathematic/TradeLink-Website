import { Pool, type QueryResult } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;
  const connectionString =
    process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL/SUPABASE_DB_URL is not set");
  }
  pool = new Pool({ connectionString, max: 5 });
  return pool;
}

export async function query<T = any>(
  text: string,
  params: any[] = [],
): Promise<QueryResult<T>> {
  const p = getPool();
  return p.query<T>(text, params);
}
