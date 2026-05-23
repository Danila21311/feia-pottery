import bcrypt from 'bcryptjs';
import type pg from 'pg';
import { query, withTransaction } from '@/lib/db';

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
}

export async function emailIsTaken(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  const { rows } = await query<{ exists: boolean }>(
    'select exists(select 1 from public.users where lower(email) = $1) as exists',
    [normalized],
  );
  return rows[0]?.exists ?? false;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const normalized = email.trim().toLowerCase();
  const { rows } = await query<DbUser>(
    'select id, email, password_hash from public.users where lower(email) = $1 limit 1',
    [normalized],
  );
  return rows[0] ?? null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { rows } = await query<{ id: string; email: string; name: string | null; roles: string[] | null }>(
    `select u.id, u.email, p.name,
            coalesce(array_agg(ur.role::text) filter (where ur.role is not null), '{}') as roles
     from public.users u
     left join public.profiles p on p.id = u.id
     left join public.user_roles ur on ur.user_id = u.id
     where u.id = $1
     group by u.id, u.email, p.name`,
    [userId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    roles: row.roles ?? ['user'],
  };
}

export async function createUser(
  email: string,
  password: string,
  name: string,
): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  const displayName = name.trim() || null;

  return withTransaction(async (client: pg.PoolClient) => {
    const userResult = await client.query<{ id: string; email: string }>(
      `insert into public.users (email, password_hash)
       values ($1, $2)
       returning id, email`,
      [normalizedEmail, passwordHash],
    );
    const user = userResult.rows[0];
    if (!user) throw new Error('Failed to create user');

    await client.query(
      'insert into public.profiles (id, name) values ($1, $2)',
      [user.id, displayName],
    );
    await client.query(
      'insert into public.user_roles (user_id, role) values ($1, $2)',
      [user.id, 'user'],
    );

    return {
      id: user.id,
      email: user.email,
      name: displayName,
      roles: ['user'],
    };
  });
}

export async function verifyPassword(email: string, password: string): Promise<UserProfile | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;
  return getUserProfile(user.id);
}

export async function updateProfileName(userId: string, name: string): Promise<void> {
  await query('update public.profiles set name = $1 where id = $2', [name.trim() || null, userId]);
}

export async function userIsAdmin(userId: string): Promise<boolean> {
  const { rows } = await query<{ role: string }>(
    `select role::text from public.user_roles where user_id = $1 and role = 'admin' limit 1`,
    [userId],
  );
  return rows.length > 0;
}
