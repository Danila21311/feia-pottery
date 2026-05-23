import { auth } from '@/auth';
import { getUserProfile } from '@/lib/repositories/users';

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const profile = await getUserProfile(session.user.id);
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    roles: profile.roles,
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}

export async function requireAdminUser() {
  const user = await getSessionUser();
  if (!user) return null;
  if (!user.roles.includes('admin')) return null;
  return user;
}

export function sessionUserToApi(user: {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
  };
}
