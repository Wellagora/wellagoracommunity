import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getEffectiveRole, ROLE_DASHBOARDS } from '@/hooks/useRoleRedirect';

export type UserRole = 'member' | 'expert' | 'sponsor';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Allowed user roles. If not specified, any authenticated user can access */
  allowedRoles?: UserRole[];
  /** Require user to have admin role (legacy support) */
  requireAdmin?: boolean;
  /** Require user to have super_admin flag */
  requireSuperAdmin?: boolean;
  /** Custom redirect path (defaults to /auth for unauthenticated) */
  redirectTo?: string;
}

/**
 * Protected route component that handles authentication and authorization
 * 
 * Key principles:
 * - 1 user = 1 role (member/expert/sponsor)
 * - Super Admin = permission flag, not a role (is_super_admin = true can access EVERYTHING)
 * - No role switching - users select their role at registration
 * - Wrong role = redirect to their correct dashboard (not just /)
 */
export const ProtectedRoute = ({ 
  children, 
  allowedRoles,
  requireAdmin,
  requireSuperAdmin,
  redirectTo
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Betöltés...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to={redirectTo || "/auth"} state={{ from: location }} replace />;
  }

  // Get is_super_admin from profile - Super Admin ALWAYS has full access
  const isSuperAdmin = profile?.is_super_admin === true;

  // Super Admin bypasses ALL restrictions - can access any route regardless of allowedRoles
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Get user's effective role for redirection
  const userRole = profile?.user_role as string;
  const effectiveRole = getEffectiveRole(userRole, false);
  const userDashboard = ROLE_DASHBOARDS[effectiveRole];

  // Check for super admin requirement
  if (requireSuperAdmin) {
    toast.error('Super Admin jogosultság szükséges');
    return <Navigate to={redirectTo || userDashboard} replace />;
  }

  // Check for admin requirement (legacy - treat as super admin check)
  if (requireAdmin) {
    toast.error('Admin jogosultság szükséges');
    return <Navigate to={redirectTo || userDashboard} replace />;
  }

  // Check role-based access using user_role from profile
  if (allowedRoles && profile) {
    if (!allowedRoles.includes(effectiveRole as UserRole)) {
      toast.error('Nincs jogosultságod ehhez az oldalhoz');
      // Redirect to their OWN dashboard, not just "/"
      return <Navigate to={redirectTo || userDashboard} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
