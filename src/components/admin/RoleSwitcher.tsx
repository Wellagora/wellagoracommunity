import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Building2, Heart, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const RoleSwitcher = () => {
  const { user, profile, setProfile } = useAuth();
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
        console.error('Error checking super admin status:', error);
      }
    };

    checkSuperAdmin();
  }, [user, profile]);

  if (!isSuperAdmin || !profile) return null;

  const handleRoleChange = (newRole: string) => {
    // Temporarily change the role in memory (not in database)
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
        return 'Állampolgár';
      case 'business':
        return 'Vállalat';
      case 'ngo':
        return 'NGO';
      case 'government':
        return 'Önkormányzat';
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
      <Shield className="w-4 h-4 text-purple-600" />
      <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30">
        Super Admin
      </Badge>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Szerepkör:</span>
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
                <span>Állampolgár</span>
              </div>
            </SelectItem>
            <SelectItem value="business">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Vállalat</span>
              </div>
            </SelectItem>
            <SelectItem value="ngo">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>NGO</span>
              </div>
            </SelectItem>
            <SelectItem value="government">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Önkormányzat</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
