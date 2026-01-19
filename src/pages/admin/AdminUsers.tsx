import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Search, 
  RefreshCw,
  Users
} from 'lucide-react';
import { UserDetailModal } from '@/components/admin/modals/UserDetailModal';

// User type definition
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

const AdminUsers = () => {
  const { isDemoMode } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('role') || 'all');
  
  // Modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
        setUsers(MOCK_USERS);
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, avatar_url, user_role, is_super_admin, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers((data || []) as UserProfile[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Hiba a felhasználók betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isDemoMode]);

  // Handle row click - open modal
  const handleRowClick = (userId: string) => {
    console.log('[AdminUsers] Row clicked:', userId);
    setSelectedUserId(userId);
    setModalOpen(true);
  };

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

    if (activeTab !== 'all') {
      if (activeTab === 'superAdmin') {
        result = result.filter(user => user.is_super_admin);
      } else if (activeTab === 'expert') {
        result = result.filter(user => ['expert', 'creator'].includes(user.user_role));
      } else if (activeTab === 'sponsor') {
        result = result.filter(user => ['sponsor', 'business', 'government', 'ngo'].includes(user.user_role));
      } else {
        result = result.filter(user => user.user_role === activeTab);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => {
        const fullName = getFullName(user).toLowerCase();
        return fullName.includes(query) || user.email.toLowerCase().includes(query);
      });
    }

    return result;
  }, [users, activeTab, searchQuery]);

  // Role counts
  const roleCounts = useMemo(() => ({
    all: users.length,
    member: users.filter(u => u.user_role === 'member').length,
    expert: users.filter(u => ['expert', 'creator'].includes(u.user_role)).length,
    sponsor: users.filter(u => ['sponsor', 'business', 'government', 'ngo'].includes(u.user_role)).length,
    superAdmin: users.filter(u => u.is_super_admin).length,
  }), [users]);

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
      case 'expert':
      case 'creator':
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">Szakértő</Badge>;
      case 'sponsor':
      case 'business':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Szponzor</Badge>;
      default:
        return <Badge variant="secondary">Tag</Badge>;
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
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Felhasználók
          </h1>
          <p className="text-muted-foreground">
            {users.length} regisztrált felhasználó kezelése
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Frissítés
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
                placeholder="Keresés név vagy email alapján..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="gap-1.5">
                  Összes
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleCounts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="member" className="gap-1.5">
                  Tagok
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleCounts.member}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="expert" className="gap-1.5">
                  Szakértők
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleCounts.expert}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="sponsor" className="gap-1.5">
                  Szponzorok
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleCounts.sponsor}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="superAdmin" className="gap-1.5">
                  Adminok
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
              <TableHead>Felhasználó</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Szerepkör</TableHead>
              <TableHead>Státusz</TableHead>
              <TableHead>Regisztráció</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
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
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Nincs találat</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.slice(0, 50).map((user) => (
                <TableRow 
                  key={user.id}
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleRowClick(user.id)}
                >
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
                      Aktív
                    </Badge>
                  </TableCell>

                  {/* Joined Date */}
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('hu-HU')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Show count if more than 50 */}
        {filteredUsers.length > 50 && (
          <div className="px-6 py-4 border-t text-sm text-muted-foreground text-center">
            {50} / {filteredUsers.length} megjelenítve
          </div>
        )}
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal
        userId={selectedUserId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default AdminUsers;
