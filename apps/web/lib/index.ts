// Re-export all lib modules
export { api, type ApiResponse } from './api-client';
export { 
  AuthProvider, 
  useAuth, 
  hasRole, 
  hasAnyRole, 
  ROLES,
  type AuthUser 
} from './client-auth';
export { 
  getServerUser, 
  isAuthenticated, 
  hasServerRole, 
  requireAuth 
} from './server-auth';
