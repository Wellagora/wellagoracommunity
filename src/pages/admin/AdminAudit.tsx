import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  RefreshCw,
  Search,
  Filter,
  User,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Ban,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

interface AuditEntry {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  created_at: string;
}

interface AuditEntryRaw {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  created_at: string;
}

const AdminAudit = () => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter);
      }

      if (searchQuery) {
        query = query.or(`user_email.ilike.%${searchQuery}%,record_id.eq.${searchQuery}`);
      }

      const { data, count, error } = await query;

      if (error) throw error;
      setEntries(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, actionFilter, tableFilter]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-4 w-4 text-emerald-600" />;
      case 'update':
        return <Pencil className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'reject':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'verify':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'suspend':
        return <Ban className="h-4 w-4 text-amber-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-emerald-100 text-emerald-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      approve: 'bg-emerald-100 text-emerald-700',
      reject: 'bg-red-100 text-red-700',
      verify: 'bg-purple-100 text-purple-700',
      suspend: 'bg-amber-100 text-amber-700',
    };
    
    const labels: Record<string, string> = {
      create: 'Létrehozás',
      update: 'Módosítás',
      delete: 'Törlés',
      approve: 'Jóváhagyás',
      reject: 'Elutasítás',
      verify: 'Hitelesítés',
      suspend: 'Felfüggesztés',
    };

    return (
      <Badge className={cn("flex items-center gap-1", colors[action] || 'bg-gray-100 text-gray-700')}>
        {getActionIcon(action)}
        {labels[action] || action}
      </Badge>
    );
  };

  const getTableLabel = (tableName: string) => {
    const labels: Record<string, string> = {
      profiles: 'Profilok',
      expert_contents: 'Programok',
      sponsors: 'Szponzorok',
      events: 'Események',
      organizations: 'Szervezetek',
      content_sponsorships: 'Szponzorációk',
      payouts: 'Kifizetések',
    };
    return labels[tableName] || tableName;
  };

  const formatChanges = (oldValues: Record<string, any> | null, newValues: Record<string, any> | null) => {
    if (!oldValues && !newValues) return null;
    
    const changes: { field: string; old: any; new: any }[] = [];
    
    if (newValues) {
      Object.keys(newValues).forEach(key => {
        const oldVal = oldValues?.[key];
        const newVal = newValues[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push({ field: key, old: oldVal, new: newVal });
        }
      });
    }
    
    return changes;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-500" />
            Audit Napló
          </h1>
          <p className="text-muted-foreground">
            Minden rendszer művelet nyomon követése
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Keresés email vagy rekord ID alapján..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Művelet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes művelet</SelectItem>
                <SelectItem value="create">Létrehozás</SelectItem>
                <SelectItem value="update">Módosítás</SelectItem>
                <SelectItem value="delete">Törlés</SelectItem>
                <SelectItem value="approve">Jóváhagyás</SelectItem>
                <SelectItem value="reject">Elutasítás</SelectItem>
                <SelectItem value="verify">Hitelesítés</SelectItem>
                <SelectItem value="suspend">Felfüggesztés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tableFilter} onValueChange={(v) => { setTableFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tábla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes tábla</SelectItem>
                <SelectItem value="profiles">Profilok</SelectItem>
                <SelectItem value="expert_contents">Programok</SelectItem>
                <SelectItem value="sponsors">Szponzorok</SelectItem>
                <SelectItem value="events">Események</SelectItem>
                <SelectItem value="payouts">Kifizetések</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Keresés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tevékenység Napló</CardTitle>
              <CardDescription>
                {totalCount} bejegyzés összesen
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nincs audit bejegyzés
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Időpont</TableHead>
                  <TableHead>Felhasználó</TableHead>
                  <TableHead>Művelet</TableHead>
                  <TableHead>Tábla</TableHead>
                  <TableHead>Rekord ID</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow 
                    key={entry.id}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(entry.created_at), 'yyyy.MM.dd HH:mm', { locale: hu })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">
                          {entry.user_email || 'Rendszer'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getActionBadge(entry.action)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTableLabel(entry.table_name)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {entry.record_id ? entry.record_id.slice(0, 8) + '...' : '-'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Részletek
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEntry && getActionIcon(selectedEntry.action)}
              Audit Részletek
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Időpont</p>
                  <p className="font-medium">
                    {format(new Date(selectedEntry.created_at), 'yyyy.MM.dd HH:mm:ss', { locale: hu })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Felhasználó</p>
                  <p className="font-medium">{selectedEntry.user_email || 'Rendszer'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Művelet</p>
                  {getActionBadge(selectedEntry.action)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tábla</p>
                  <Badge variant="outline">{getTableLabel(selectedEntry.table_name)}</Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Rekord ID</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded block mt-1">
                    {selectedEntry.record_id || '-'}
                  </code>
                </div>
              </div>

              {/* Changes */}
              {(selectedEntry.old_values || selectedEntry.new_values) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Változások</p>
                  <ScrollArea className="h-[200px] rounded border p-4">
                    <div className="space-y-2">
                      {formatChanges(selectedEntry.old_values, selectedEntry.new_values)?.map((change, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">{change.field}:</span>
                          <div className="ml-4 grid grid-cols-2 gap-2 mt-1">
                            <div className="bg-red-50 dark:bg-red-950 p-2 rounded">
                              <span className="text-xs text-red-600">Régi:</span>
                              <pre className="text-xs mt-1 overflow-auto">
                                {JSON.stringify(change.old, null, 2) || '-'}
                              </pre>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-950 p-2 rounded">
                              <span className="text-xs text-emerald-600">Új:</span>
                              <pre className="text-xs mt-1 overflow-auto">
                                {JSON.stringify(change.new, null, 2) || '-'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(selectedEntry.new_values || selectedEntry.old_values, null, 2)}
                        </pre>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAudit;
