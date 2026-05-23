#!/usr/bin/env node
/**
 * Импорт данных из дампа Supabase в Railway PostgreSQL.
 *
 * Подготовка:
 * 1. pg_dump public-схемы из Supabase (без auth/storage)
 * 2. Экспорт auth.users: id, email (CSV или SQL)
 * 3. Задать переменные окружения (см. ниже)
 *
 * Переменные:
 *   DATABASE_URL          — целевая Railway БД
 *   SUPABASE_DUMP_DIR     — каталог с CSV: profiles.csv, user_roles.csv, products.csv, ...
 *   AUTH_USERS_CSV        — auth.users: id,email (пароли не переносятся — нужен сброс)
 *   DEFAULT_PASSWORD      — временный пароль для всех импортированных пользователей (опционально)
 *
 * Пример:
 *   DATABASE_URL=postgres://... AUTH_USERS_CSV=./dump/auth_users.csv SUPABASE_DUMP_DIR=./dump node scripts/migrate-from-supabase.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.match(/("([^"]|"")*"|[^,]*)/g)?.map((v) =>
      v.replace(/^"|"$/g, '').replace(/""/g, ''),
    ) ?? [];
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });
    return row;
  });
}

function readCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Skip missing file: ${filePath}`);
    return [];
  }
  return parseCsv(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const dumpDir = process.env.SUPABASE_DUMP_DIR?.trim() ?? path.join(__dirname, '..', 'dump', 'supabase');
  const authUsersCsv = process.env.AUTH_USERS_CSV?.trim();
  const defaultPassword = process.env.DEFAULT_PASSWORD?.trim();

  if (!databaseUrl) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: /localhost|127\.0\.0\.1/.test(databaseUrl) ? undefined : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await client.query('begin');

    const authUsers = authUsersCsv ? readCsv(authUsersCsv) : [];
    const passwordHash = defaultPassword ? await bcrypt.hash(defaultPassword, 12) : null;

    for (const row of authUsers) {
      const id = row.id;
      const email = row.email?.trim().toLowerCase();
      if (!id || !email) continue;

      if (!passwordHash) {
        console.warn(`Skip user ${email}: set DEFAULT_PASSWORD to import users`);
        continue;
      }

      await client.query(
        `insert into public.users (id, email, password_hash)
         values ($1, $2, $3)
         on conflict (email) do update set email = excluded.email`,
        [id, email, passwordHash],
      );
    }

    const tableFiles = [
      'profiles',
      'user_roles',
      'products',
      'workshops',
      'orders',
      'workshop_bookings',
      'feedback_requests',
      'gift_certificate_orders',
    ];

    for (const table of tableFiles) {
      const rows = readCsv(path.join(dumpDir, `${table}.csv`));
      if (rows.length === 0) continue;

      console.log(`Import ${table}: ${rows.length} rows (manual column mapping required per export)`);
      console.warn(
        `  → Рекомендуется pg_restore/pg_dump --data-only для ${table} или ручной SQL INSERT из Supabase SQL Editor.`,
      );
    }

    await client.query('commit');
    console.log('Import scaffold complete. Для полного переноса используйте pg_dump/public restore + mapping auth.users → users.');
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
