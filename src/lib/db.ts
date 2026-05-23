import pg from 'pg';

const globalForPg = globalThis as unknown as { pgPool: pg.Pool | undefined };

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return url;
}

function sslConfig(connectionString: string): pg.ConnectionConfig['ssl'] {
  if (process.env.PGSSLMODE === 'disable') return undefined;
  if (/localhost|127\.0\.0\.1/.test(connectionString)) return undefined;
  return { rejectUnauthorized: false };
}

export function getPool(): pg.Pool {
  if (!globalForPg.pgPool) {
    const connectionString = resolveDatabaseUrl();
    globalForPg.pgPool = new pg.Pool({
      connectionString,
      ssl: sslConfig(connectionString),
      max: 10,
    });
  }
  return globalForPg.pgPool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    const result = await fn(client);
    await client.query('commit');
    return result;
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}
