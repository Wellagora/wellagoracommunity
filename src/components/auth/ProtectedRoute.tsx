import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useViewMode } from '@/contexts/ViewModeContext';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types/database';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Allowed user roles. If not specified, any authenticated user can access */
  allowedRoles?: UserRole[];
  /** Require user to have an organization_id set */
  requireOrganization?: boolean;
  /** Require user to have admin or super_admin role */
  requireAdmin?: boolean;
  /** Require user to have super_admin role */
  requireSuperAdmin?: boolean;
  /** Custom redirect path (defaults to /auth for unauthenticated, /dashboard for unauthorized) */
  redirectTo?: string;
}

/**
 * Protected route component that handles authentication and authorization
 * Wraps routes that require user to be logged in and/or have specific roles
 */
export const ProtectedRoute = ({ 
  children, 
  allowedRoles,
  requireOrganization,
  requireAdmin,
  requireSuperAdmin,
  redirectTo
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const { isSuperAdmin } = useViewMode();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to={redirectTo || "/auth"} state={{ from: location }} replace />;
  }

  // Check for super admin requirement
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to={redirectTo || "/dashboard"} replace />;
  }

  // Check for admin requirement (uses super admin for now)
  if (requireAdmin && !isSuperAdmin) {
    return <Navigate to={redirectTo || "/dashboard"} replace />;
  }

  // Check role-based access
  if (allowedRoles && profile) {
    if (!allowedRoles.includes(profile.user_role)) {
      return <Navigate to={redirectTo || "/dashboard"} replace />;
    }
  }

  // Check organization requirement
  if (requireOrganization && !profile?.organization_id) {
    return <Navigate to={redirectTo || "/register/organization"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
