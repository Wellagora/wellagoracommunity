import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Building2, Heart, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const RoleSwitcher = () => {
  const { user, profile, setProfile } = useAuth();
  const { t } = useLanguage();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [originalRole, setOriginalRole] = useState<string | null>(null);

  // Check if user is super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!user) return;

      try {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'super_admin')
          .maybeSingle();

        setIsSuperAdmin(!!roles);
        if (roles && !originalRole && profile) {
          setOriginalRole(profile.user_role);
        }
      } catch (error) {
        // Silent fail - user is not super admin
      }
    };

    checkSuperAdmin();
  }, [user, profile]);

  if (!isSuperAdmin || !profile) return null;

  const handleRoleChange = (newRole: string) => {
    // Change the role in memory only (not in database or localStorage)
    setProfile({
      ...profile,
      user_role: newRole as any
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'citizen':
        return <User className="w-4 h-4" />;
      case 'business':
        return <Building2 className="w-4 h-4" />;
      case 'ngo':
        return <Heart className="w-4 h-4" />;
      case 'government':
        return <MapPin className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'citizen':
        return t('roles.citizen');
      case 'business':
        return t('roles.business');
      case 'ngo':
        return t('roles.ngo');
      case 'government':
        return t('roles.government');
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
      <Shield className="w-4 h-4 text-purple-600" />
      <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30">
        {t('roles.super_admin')}
      </Badge>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{t('roles.role_label')}:</span>
        <Select value={profile.user_role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue>
              <div className="flex items-center gap-2">
                {getRoleIcon(profile.user_role)}
                <span>{getRoleLabel(profile.user_role)}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="citizen">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{t('roles.citizen')}</span>
              </div>
            </SelectItem>
            <SelectItem value="business">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{t('roles.business')}</span>
              </div>
            </SelectItem>
            <SelectItem value="ngo">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>{t('roles.ngo')}</span>
              </div>
            </SelectItem>
            <SelectItem value="government">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{t('roles.government')}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
