import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Sparkles, Heart, Settings } from "lucide-react";
import { ROLE_DASHBOARDS, getEffectiveRole } from "@/hooks/useRoleRedirect";

export const RoleSwitcher = () => {
  const { profile, viewAsRole, setViewAsRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Super Admin: full God Mode (all roles)
  const isSuperAdmin = profile?.is_super_admin === true || 
    profile?.email === 'attila.kelemen@proself.org';

  // Founding Expert / dual-role: simplified Expert ↔ Tag toggle
  const canViewAsMember = (profile as any)?.can_view_as_member === true;

  if ((!isSuperAdmin && !canViewAsMember) || !profile) return null;

  const baseRole = (profile.user_role as UserRole) || 'member';
  const currentRole = viewAsRole || baseRole;

  const handleRoleChange = (newRole: string) => {
    // If switching back to own role, clear viewAsRole
    if (newRole === baseRole) {
      setViewAsRole(null);
    } else {
      setViewAsRole(newRole as UserRole);
    }
    const effectiveRole = getEffectiveRole(newRole, newRole === 'admin');
    navigate(ROLE_DASHBOARDS[effectiveRole]);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'member':
        return <User className="w-4 h-4" />;
      case 'expert':
        return <Sparkles className="w-4 h-4" />;
      case 'sponsor':
        return <Heart className="w-4 h-4" />;
      case 'admin':
        return <Settings className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'member':
        return t('roles.member') || 'Tag';
      case 'expert':
        return t('roles.expert') || 'Szakértő';
      case 'sponsor':
        return t('roles.sponsor') || 'Szponzor';
      case 'admin':
        return t('roles.admin') || 'Admin';
      default:
        return role;
    }
  };

  // Simplified Expert ↔ Tag toggle for Founding Experts
  if (canViewAsMember && !isSuperAdmin) {
    const isViewingAsMember = viewAsRole === 'member';
    return (
      <button
        onClick={() => handleRoleChange(isViewingAsMember ? 'expert' : 'member')}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg hover:border-emerald-500/40 transition-colors"
      >
        {isViewingAsMember ? (
          <>
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-emerald-700 hidden sm:inline">
              {t('roles.switch_to_expert') || 'Szakértő nézet'}
            </span>
          </>
        ) : (
          <>
            <User className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700 hidden sm:inline">
              {t('roles.switch_to_member') || 'Tag nézet'}
            </span>
          </>
        )}
      </button>
    );
  }

  // Full God Mode for Super Admins
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg">
      <Shield className="w-4 h-4 text-amber-600 shrink-0" />
      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30 text-xs px-1.5 py-0 hidden sm:inline-flex">
        God Mode
      </Badge>
      <Select value={currentRole} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[120px] h-7 text-xs border-amber-500/30 bg-background/50">
          <SelectValue>
            <div className="flex items-center gap-1.5">
              {getRoleIcon(currentRole)}
              <span className="hidden sm:inline">{getRoleLabel(currentRole)}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end" className="bg-background border shadow-lg z-50">
          <SelectItem value="member">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{getRoleLabel('member')}</span>
            </div>
          </SelectItem>
          <SelectItem value="expert">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{getRoleLabel('expert')}</span>
            </div>
          </SelectItem>
          <SelectItem value="sponsor">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>{getRoleLabel('sponsor')}</span>
            </div>
          </SelectItem>
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>{getRoleLabel('admin')}</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
