import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Search, 
  MoreHorizontal, 
  UserCog, 
  UserCheck, 
  Building2, 
  UserMinus,
  Ban,
  RefreshCw,
  Users
} from 'lucide-react';

// User type definition
// Valid user roles from the database enum
type UserRoleType = 'citizen' | 'business' | 'government' | 'ngo' | 'creator' | 'member' | 'expert' | 'sponsor';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  user_role: UserRoleType;
  is_super_admin?: boolean;
  created_at: string;
  is_mock?: boolean;
}

// Mock users for demo mode
const MOCK_USERS: UserProfile[] = [
  {
    id: 'mock-1',
    email: 'toth.eszter@example.com',
    first_name: 'Eszter',
    last_name: 'Tóth',
    avatar_url: null,
    user_role: 'member',
    created_at: '2025-12-15T10:00:00Z',
    is_mock: true
  },
  {
    id: 'mock-2',
    email: 'kovacs.janos@example.com',
    first_name: 'János',
    last_name: 'Kovács',
    avatar_url: null,
    user_role: 'expert',
    created_at: '2025-11-20T14:30:00Z',
    is_mock: true
  },
  {
    id: 'mock-3',
    email: 'info@kalipanzio.hu',
    first_name: 'Káli',
    last_name: 'Panzió',
    avatar_url: null,
    user_role: 'sponsor',
    created_at: '2025-10-05T09:15:00Z',
    is_mock: true
  },
  {
    id: 'mock-4',
    email: 'nagy.peter@example.com',
    first_name: 'Péter',
    last_name: 'Nagy',
    avatar_url: null,
    user_role: 'member',
    created_at: '2025-12-28T16:45:00Z',
    is_mock: true
  },
  {
    id: 'mock-5',
    email: 'szabo.anna@example.com',
    first_name: 'Anna',
    last_name: 'Szabó',
    avatar_url: null,
    user_role: 'expert',
    created_at: '2025-11-10T11:20:00Z',
    is_mock: true
  },
  {
    id: 'mock-6',
    email: 'molnar.gabor@example.com',
    first_name: 'Gábor',
    last_name: 'Molnár',
    avatar_url: null,
    user_role: 'member',
    created_at: '2026-01-02T08:00:00Z',
    is_mock: true
  },
  {
    id: 'mock-7',
    email: 'info@balatonbio.hu',
    first_name: 'Balaton',
    last_name: 'Bio Kft.',
    avatar_url: null,
    user_role: 'sponsor',
    created_at: '2025-09-15T13:00:00Z',
    is_mock: true
  },
  {
    id: 'mock-8',
    email: 'admin@wellagora.hu',
    first_name: 'Admin',
    last_name: 'User',
    avatar_url: null,
    user_role: 'member',
    is_super_admin: true,
    created_at: '2025-08-01T00:00:00Z',
    is_mock: true
  },
];

// Generate more mock members for realistic count
const generateMockMembers = (count: number): UserProfile[] => {
  const names = ['Kiss', 'Németh', 'Horváth', 'Varga', 'Balogh', 'Farkas', 'Papp', 'Takács'];
  const firstNames = ['László', 'István', 'József', 'Zoltán', 'Katalin', 'Erzsébet', 'Mária', 'Ilona'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-gen-${i}`,
    email: `user${i + 10}@example.com`,
    first_name: firstNames[i % firstNames.length],
    last_name: names[i % names.length],
    avatar_url: null,
    user_role: 'member' as const,
    created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    is_mock: true
  }));
};

const AdminUsers = () => {
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  // Helper function for interpolation since t() doesn't support it
  const tWithParams = (key: string, params: Record<string, string | number>) => {
    let result = t(key);
    Object.entries(params).forEach(([param, value]) => {
      result = result.replace(`{{${param}}}`, String(value));
    });
    return result;
  };
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('role') || 'all');

  // Get full name from profile
  const getFullName = (user: UserProfile): string => {
    if (user.first_name && user.last_name) {
      return `${user.last_name} ${user.first_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    return '-';
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      if (isDemoMode) {
        // Demo mode: use mock data
        const allMockUsers = [
          ...MOCK_USERS,
          ...generateMockMembers(119) // Total ~127 users
        ];
        setUsers(allMockUsers);
      } else {
        // Real data from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, avatar_url, user_role, is_super_admin, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers((data || []) as UserProfile[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('admin.users.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isDemoMode]);

  // Handle URL params for role filter
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setActiveTab(roleParam);
    }
  }, [searchParams]);

  // Filter users based on search and tab
  const filteredUsers = useMemo(() => {
    let result = users;

    // Filter by role tab
    if (activeTab !== 'all') {
      if (activeTab === 'superAdmin') {
        result = result.filter(user => user.is_super_admin);
      } else {
        result = result.filter(user => user.user_role === activeTab);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => {
        const fullName = getFullName(user).toLowerCase();
        return fullName.includes(query) || user.email.toLowerCase().includes(query);
      });
    }

    return result;
  }, [users, activeTab, searchQuery]);

  // Role counts - use is_super_admin for admin count since there's no 'admin' role
  const roleCounts = useMemo(() => ({
    all: users.length,
    member: users.filter(u => u.user_role === 'member').length,
    expert: users.filter(u => u.user_role === 'expert').length,
    sponsor: users.filter(u => u.user_role === 'sponsor').length,
    superAdmin: users.filter(u => u.is_super_admin).length,
  }), [users]);

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: UserProfile['user_role'], isMock?: boolean) => {
    if (isMock || isDemoMode) {
      // Demo mode: just update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, user_role: newRole } : u
      ));
      toast.success(t('admin.users.role_updated'));
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, user_role: newRole } : u
      ));
      toast.success(t('admin.users.role_updated'));
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(t('admin.users.role_update_error'));
    }
  };

  // Handle ban (mock for pilot safety)
  const handleBan = (userId: string, userName: string) => {
    toast.success(tWithParams('admin.users.user_banned', { name: userName }), {
      description: t('admin.users.ban_mock_notice')
    });
  };

  // Get initials for avatar
  const getInitials = (user: UserProfile): string => {
    const name = getFullName(user);
    if (name && name !== '-') {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.email[0].toUpperCase();
  };

  // Role badge styling
  const getRoleBadge = (role: string, isSuperAdmin?: boolean) => {
    if (isSuperAdmin) {
      return <Badge className="bg-red-600 hover:bg-red-700">Super Admin</Badge>;
    }
    
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{t('admin.users.role_admin')}</Badge>;
      case 'expert':
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">{t('admin.users.role_expert')}</Badge>;
      case 'sponsor':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">{t('admin.users.role_sponsor')}</Badge>;
      default:
        return <Badge variant="secondary">{t('admin.users.role_member')}</Badge>;
    }
  };

  // Tab change handler
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'all') {
      searchParams.delete('role');
    } else {
      searchParams.set('role', value);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('admin.users.title')}
          </h1>
          <p className="text-muted-foreground">
            {tWithParams('admin.users.subtitle', { count: users.length })}
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t('admin.users.refresh')}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('admin.users.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="gap-1.5">
                  {t('admin.users.tab_all')}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleCounts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="member" className="gap-1.5">
                  {t('admin.users.tab_members')}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleCounts.member}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="expert" className="gap-1.5">
                  {t('admin.users.tab_experts')}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleCounts.expert}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="sponsor" className="gap-1.5">
                  {t('admin.users.tab_sponsors')}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleCounts.sponsor}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="superAdmin" className="gap-1.5">
                  {t('admin.users.tab_admins')}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleCounts.superAdmin}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.col_user')}</TableHead>
              <TableHead>{t('admin.users.col_email')}</TableHead>
              <TableHead>{t('admin.users.col_role')}</TableHead>
              <TableHead>{t('admin.users.col_status')}</TableHead>
              <TableHead>{t('admin.users.col_joined')}</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">{t('admin.users.no_users')}</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.slice(0, 50).map((user) => (
                <TableRow key={user.id}>
                  {/* Avatar & Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getFullName(user)}</span>
                        {user.is_mock && (
                          <Badge variant="outline" className="text-xs">Demo</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>

                  {/* Role Badge */}
                  <TableCell>
                    {getRoleBadge(user.user_role, user.is_super_admin)}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {t('admin.users.status_active')}
                    </Badge>
                  </TableCell>

                  {/* Joined Date */}
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {t('admin.users.actions')}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem>
                          <UserCog className="w-4 h-4 mr-2" />
                          {t('admin.users.action_edit')}
                        </DropdownMenuItem>

                        {user.user_role !== 'expert' && !user.is_super_admin && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, 'expert', user.is_mock)}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            {t('admin.users.action_make_expert')}
                          </DropdownMenuItem>
                        )}

                        {user.user_role !== 'sponsor' && !user.is_super_admin && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, 'sponsor', user.is_mock)}
                          >
                            <Building2 className="w-4 h-4 mr-2" />
                            {t('admin.users.action_make_sponsor')}
                          </DropdownMenuItem>
                        )}

                        {(user.user_role === 'expert' || user.user_role === 'sponsor') && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, 'member', user.is_mock)}
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            {t('admin.users.action_demote')}
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleBan(user.id, getFullName(user))}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          {t('admin.users.action_ban')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Show count if more than 50 */}
        {filteredUsers.length > 50 && (
          <div className="px-6 py-4 border-t text-sm text-muted-foreground text-center">
            {tWithParams('admin.users.showing_count', { shown: 50, total: filteredUsers.length })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUsers;
