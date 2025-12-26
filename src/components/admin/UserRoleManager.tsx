import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Shield, UserPlus, Trash2, Search } from 'lucide-react';

interface UserWithRoles {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

const UserRoleManager = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('email');

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        roles: userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült betölteni a felhasználókat',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const assignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: t('users.missing_data'),
        description: t('users.select_user_and_role'),
        variant: 'destructive'
      });
      return;
    }

    try {
      const currentUser = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: selectedUserId,
          role: selectedRole as any,
          assigned_by: currentUser.data.user?.id || null
        }]);

      if (error) throw error;

      toast({
        title: t('users.role_assigned'),
        description: t('users.role_assigned_success'),
      });

      loadUsers();
      setSelectedUserId(null);
      setSelectedRole('');
    } catch (error: any) {
      toast({
        title: t('users.error'),
        description: error.message || t('users.assign_error'),
        variant: 'destructive'
      });
    }
  };

  const removeRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);

      if (error) throw error;

      toast({
        title: t('users.role_removed'),
        description: t('users.role_removed_success'),
      });

      loadUsers();
    } catch (error) {
      toast({
        title: t('users.error'),
        description: t('users.remove_error'),
        variant: 'destructive'
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      admin: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      government: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      business: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white',
      ngo: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
      citizen: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
    };
    return colors[role] || 'bg-gray-500 text-white';
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchEmail.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('users.title')}
          </CardTitle>
          <CardDescription>
            {t('users.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('users.search_placeholder')}
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>

          {/* Assign Role */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label>{t('users.select_user')}</Label>
              <Select value={selectedUserId || ''} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('users.select_user_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email} ({user.first_name} {user.last_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('users.select_role')}</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t('users.select_role_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                  <SelectItem value="citizen">Citizen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={assignRole} className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                {t('users.assign_role')}
              </Button>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-2">
            <h3 className="font-semibold mb-4">{t('users.users_and_roles')}</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {user.roles.length === 0 ? (
                        <Badge variant="outline">{t('users.no_role')}</Badge>
                      ) : (
                        user.roles.map(role => (
                          <div key={role} className="flex items-center gap-1">
                            <Badge className={getRoleBadgeColor(role)}>
                              {role}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeRole(user.id, role)}
                              className="h-6 w-6 p-0 hover:bg-destructive/20"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleManager;
