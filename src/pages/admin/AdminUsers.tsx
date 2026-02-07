import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
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
  expert_title?: string | null;
  location_city?: string | null;
}

interface RoleStats {
  all: number;
  member: number;
  expert: number;
  sponsor: number;
  superAdmin: number;
}

interface AdminOutletContext {
  selectedProjectId: string | null;
}

const AdminUsers = () => {
  const { isDemoMode } = useAuth();
  const { selectedProjectId } = useOutletContext<AdminOutletContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('role') || 'all');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [roleStats, setRoleStats] = useState<RoleStats>({
    all: 0,
    member: 0,
    expert: 0,
    sponsor: 0,
    superAdmin: 0
  });
  
  // Modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const LIMIT = 50;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setOffset(0); // Reset pagination on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get full name from profile
  const getFullName = (user: UserProfile): string => {
    if (user.first_name && user.last_name) {
      return `${user.last_name} ${user.first_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    return '-';
  };

  // Fetch role statistics
  const fetchRoleStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_role, is_super_admin');

      if (error) throw error;

      const stats: RoleStats = {
        all: data?.length || 0,
        member: data?.filter(u => u.user_role === 'member').length || 0,
        expert: data?.filter(u => ['expert', 'creator'].includes(u.user_role)).length || 0,
        sponsor: data?.filter(u => ['sponsor', 'business', 'government', 'ngo'].includes(u.user_role)).length || 0,
        superAdmin: data?.filter(u => u.is_super_admin).length || 0
      };

      setRoleStats(stats);
    } catch (error) {
      console.error('Error fetching role stats:', error);
    }
  };

  // Fetch users with filters and pagination
  const fetchUsers = async (loadMore = false) => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('profiles')
        .select('id, email, first_name, last_name, avatar_url, user_role, is_super_admin, created_at, expert_title, location_city')
        .order('created_at', { ascending: false });

      // Apply project filter
      if (selectedProjectId) query = query.eq('project_id', selectedProjectId);

      // Apply role filter
      if (activeTab !== 'all') {
        if (activeTab === 'superAdmin') {
          query = query.eq('is_super_admin', true);
        } else if (activeTab === 'expert') {
          query = query.in('user_role', ['expert', 'creator']);
        } else if (activeTab === 'sponsor') {
          query = query.in('user_role', ['sponsor', 'business', 'government', 'ngo']);
        } else {
          query = query.eq('user_role', activeTab);
        }
      }

      // Apply search filter
      if (debouncedSearch.trim()) {
        query = query.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      // Apply pagination
      const currentOffset = loadMore ? offset : 0;
      query = query.range(currentOffset, currentOffset + LIMIT);

      const { data, error } = await query;

      if (error) throw error;

      const newUsers = (data || []) as UserProfile[];
      
      if (loadMore) {
        setUsers(prev => [...prev, ...newUsers]);
        setOffset(currentOffset + LIMIT + 1);
      } else {
        setUsers(newUsers);
        setOffset(LIMIT + 1);
      }

      // Check if there are more users
      setHasMore(newUsers.length === LIMIT + 1);
      
      // Remove extra item if we got LIMIT + 1
      if (newUsers.length === LIMIT + 1) {
        setUsers(prev => prev.slice(0, -1));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Hiba a felhasználók betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when filters change
  useEffect(() => {
    fetchUsers();
  }, [activeTab, debouncedSearch, selectedProjectId]);

  // Fetch stats on mount
  useEffect(() => {
    fetchRoleStats();
  }, []);

  // Load more handler
  const handleLoadMore = () => {
    fetchUsers(true);
  };

  // Handle row click - open modal
  const handleRowClick = (userId: string) => {
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
            {roleStats.all} regisztrált felhasználó kezelése
          </p>
        </div>
        <Button onClick={() => { fetchUsers(); fetchRoleStats(); }} variant="outline" className="gap-2">
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
                    {roleStats.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="member" className="gap-1.5">
                  Tagok
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleStats.member}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="expert" className="gap-1.5">
                  Szakértők
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleStats.expert}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="sponsor" className="gap-1.5">
                  Szponzorok
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleStats.sponsor}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="superAdmin" className="gap-1.5">
                  Adminok
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleStats.superAdmin}
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
              <TableHead>Szakmai cím / Helyszín</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Nincs találat</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
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
                      <span className="font-medium">{getFullName(user)}</span>
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

                  {/* Expert Title / Location */}
                  <TableCell className="text-sm text-muted-foreground">
                    {user.expert_title || user.location_city || '-'}
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

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="px-6 py-4 border-t flex justify-center">
            <Button onClick={handleLoadMore} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              További felhasználók betöltése
            </Button>
          </div>
        )}

        {/* Show count */}
        {users.length > 0 && (
          <div className="px-6 py-2 border-t text-sm text-muted-foreground text-center">
            {users.length} felhasználó megjelenítve
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
