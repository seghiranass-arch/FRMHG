// Auth types and utilities
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
}

// Re-export from client-auth for convenience
export { useAuth, AuthProvider, hasRole, hasAnyRole, ROLES } from './client-auth';
export { getServerUser, isAuthenticated, hasServerRole, requireAuth } from './server-auth';
