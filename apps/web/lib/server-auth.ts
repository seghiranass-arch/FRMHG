import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Cookie name used by the backend
const COOKIE_NAME = 'frmhg_token';
const API_URL = process.env.API_URL || 'http://localhost:3001';

// User type
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  orgId?: string | null;
}

// Get current user from server-side
export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);
    
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Cookie: `${COOKIE_NAME}=${token.value}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Server auth error:', error);
    return null;
  }
}

// Check if user is authenticated (server-side)
export async function isAuthenticated(): Promise<boolean> {
  const user = await getServerUser();
  return user !== null;
}

// Check if user has role (server-side)
export async function hasServerRole(role: string): Promise<boolean> {
  const user = await getServerUser();
  if (!user) return false;
  return user.roles.includes(role);
}

// Require authentication - returns user or throws redirect
export async function requireAuth(): Promise<AuthUser> {
  const user = await getServerUser();
  if (!user) {
    redirect('/');
  }
  return user as AuthUser;
}
