import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type EffectiveRole = "member" | "expert" | "sponsor" | "admin";

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
    const userRole = profile.user_role as string;
    let effectiveRole: EffectiveRole = "member";

    // Super admin goes to admin panel
    if (profile.is_super_admin) {
      effectiveRole = "admin";
    } else if (["expert", "creator"].includes(userRole)) {
      effectiveRole = "expert";
    } else if (["sponsor", "business", "government", "ngo"].includes(userRole)) {
      effectiveRole = "sponsor";
    } else {
      effectiveRole = "member";
    }

    // Get the redirect path based on role
    const redirectPaths: Record<EffectiveRole, string> = {
      member: "/iranyitopult",
      expert: "/szakertoi-studio",
      sponsor: "/tamogatoi-kozpont",
      admin: "/admin-panel",
    };

    const targetPath = redirectPaths[effectiveRole];
    
    // Navigate to role-specific dashboard
    navigate(targetPath, { replace: true });
  }, [user, profile, loading, navigate, location.pathname]);
}

/**
 * Helper to get the dashboard URL for a given role
 */
export function getDashboardUrl(role: string, isSuperAdmin: boolean = false): string {
  if (isSuperAdmin) {
    return "/admin-panel";
  }
  
  if (["expert", "creator"].includes(role)) {
    return "/szakertoi-studio";
  }
  
  if (["sponsor", "business", "government", "ngo"].includes(role)) {
    return "/tamogatoi-kozpont";
  }
  
  return "/iranyitopult";
}

export default useRoleRedirect;
