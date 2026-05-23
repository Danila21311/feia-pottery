import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  return url;
}

function sslConfig(connectionString) {
  if (process.env.PGSSLMODE === 'disable') return undefined;
  if (/localhost|127\.0\.0\.1/.test(connectionString)) return undefined;
  return { rejectUnauthorized: false };
}

async function ensureMigrationsTable(client) {
  await client.query(`
    create table if not exists public.schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

async function getAppliedIds(client) {
  const { rows } = await client.query('select id from public.schema_migrations order by id');
  return new Set(rows.map((r) => r.id));
}

async function run() {
  const connectionString = getDatabaseUrl();
  const client = new pg.Client({
    connectionString,
    ssl: sslConfig(connectionString),
  });

  await client.connect();
  console.log('Connected to PostgreSQL');

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedIds(client);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const id = file.replace(/\.sql$/, '');
      if (applied.has(id)) {
        console.log(`Skip ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Applying ${file}...`);

      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into public.schema_migrations (id) values ($1)', [id]);
        await client.query('commit');
        console.log(`Applied ${file}`);
      } catch (err) {
        await client.query('rollback');
        throw err;
      }
    }

    console.log('Migrations complete');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
