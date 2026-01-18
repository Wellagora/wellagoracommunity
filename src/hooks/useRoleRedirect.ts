import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type EffectiveRole = "member" | "expert" | "sponsor" | "admin";

/**
 * Maps database user_role to effective role for routing
 */
export function getEffectiveRole(userRole: string | undefined, isSuperAdmin: boolean = false): EffectiveRole {
  if (isSuperAdmin) {
    return "admin";
  }
  
  if (!userRole) return "member";
  
  if (["expert", "creator"].includes(userRole)) {
    return "expert";
  }
  
  if (["sponsor", "business", "government", "ngo"].includes(userRole)) {
    return "sponsor";
  }
  
  return "member";
}

/**
 * Centralized redirect path configuration
 * PHASE 1/5: Using English paths as specified
 */
export const ROLE_DASHBOARDS: Record<EffectiveRole, string> = {
  member: "/programs",           // Marketplace/Piactér
  expert: "/expert-studio",      // Expert Studio
  sponsor: "/sponsor-dashboard", // Sponsor Dashboard
  admin: "/admin",               // Admin Panel
};

/**
 * Hook to redirect users to their role-specific dashboard after login
 * Should be used on auth-related pages (login, signup)
 */
export function useRoleRedirect() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;
    
    // Only redirect if user is logged in
    if (!user || !profile) return;

    // Don't redirect if we're not on auth page
    if (!location.pathname.includes("/auth")) return;

    // Determine effective role
    const effectiveRole = getEffectiveRole(
      profile.user_role as string,
      profile.is_super_admin === true
    );

    const targetPath = ROLE_DASHBOARDS[effectiveRole];
    
    // Navigate to role-specific dashboard
    navigate(targetPath, { replace: true });
  }, [user, profile, loading, navigate, location.pathname]);
}

/**
 * Helper to get the dashboard URL for a given role
 */
export function getDashboardUrl(role: string, isSuperAdmin: boolean = false): string {
  const effectiveRole = getEffectiveRole(role, isSuperAdmin);
  return ROLE_DASHBOARDS[effectiveRole];
}

export default useRoleRedirect;
