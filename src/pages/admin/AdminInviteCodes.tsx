import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Ticket, Plus, RefreshCw, Copy, Check } from 'lucide-react';

interface InviteCode {
  id: string;
  code: string;
  is_active: boolean;
  max_uses: number;
  use_count: number;
  used_at: string | null;
  note: string | null;
  created_at: string;
}

interface AdminOutletContext {
  selectedProjectId: string | null;
}

const AdminInviteCodes = () => {
  const { language } = useLanguage();
  useOutletContext<AdminOutletContext>();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New code form
  const [newCode, setNewCode] = useState('');
  const [newMaxUses, setNewMaxUses] = useState('10');
  const [newNote, setNewNote] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes((data as InviteCode[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(language === 'hu' ? 'Hiba a kódok betöltésekor' : 'Error loading codes', {
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const generateCode = () => {
    const prefix = 'WELL';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(`${prefix}-${suffix}`);
  };

  const handleCreate = async () => {
    if (!newCode.trim()) {
      toast.error(language === 'hu' ? 'Add meg a kódot' : 'Enter a code');
      return;
    }
    setCreating(true);
    try {
      const { error } = await supabase.from('invite_codes').insert({
        code: newCode.trim().toUpperCase(),
        max_uses: parseInt(newMaxUses) || 10,
        note: newNote.trim() || null,
        is_active: true,
        use_count: 0,
      });
      if (error) throw error;
      toast.success(language === 'hu' ? 'Kód létrehozva!' : 'Code created!');
      setNewCode('');
      setNewNote('');
      setNewMaxUses('10');
      fetchCodes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(language === 'hu' ? 'Hiba a kód létrehozásakor' : 'Error creating code', {
        description: msg,
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('invite_codes')
        .update({ is_active: !currentActive })
        .eq('id', id);
      if (error) throw error;
      setCodes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !currentActive } : c))
      );
      toast.success(
        !currentActive
          ? (language === 'hu' ? 'Kód aktiválva' : 'Code activated')
          : (language === 'hu' ? 'Kód deaktiválva' : 'Code deactivated')
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Error', { description: msg });
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalActive = codes.filter((c) => c.is_active).length;
  const totalUsed = codes.reduce((sum, c) => sum + c.use_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-emerald-600" />
            {language === 'hu' ? 'Meghívó kódok' : 'Invite Codes'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'hu'
              ? 'A zárt béta meghívó kódjainak kezelése'
              : 'Manage closed beta invite codes'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCodes} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {language === 'hu' ? 'Frissítés' : 'Refresh'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{codes.length}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'hu' ? 'Összes kód' : 'Total codes'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{totalActive}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'hu' ? 'Aktív' : 'Active'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{totalUsed}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'hu' ? 'Felhasználások' : 'Total uses'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Code */}
      <Card className="rounded-xl shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {language === 'hu' ? 'Új kód létrehozása' : 'Create new code'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>{language === 'hu' ? 'Kód' : 'Code'}</Label>
              <div className="flex gap-2">
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="WELL-XXXX"
                  className="uppercase tracking-wider"
                />
                <Button variant="outline" size="icon" onClick={generateCode} title="Generate">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hu' ? 'Max használat' : 'Max uses'}</Label>
              <Input
                type="number"
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value)}
                min="1"
                max="1000"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'hu' ? 'Megjegyzés' : 'Note'}</Label>
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={language === 'hu' ? 'pl. Káli-medence pilot' : 'e.g. Pilot group'}
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating || !newCode.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {creating ? '...' : (language === 'hu' ? 'Létrehozás' : 'Create')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Codes Table */}
      <Card className="rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'hu' ? 'Kód' : 'Code'}</TableHead>
                <TableHead>{language === 'hu' ? 'Használat' : 'Usage'}</TableHead>
                <TableHead>{language === 'hu' ? 'Státusz' : 'Status'}</TableHead>
                <TableHead>{language === 'hu' ? 'Megjegyzés' : 'Note'}</TableHead>
                <TableHead>{language === 'hu' ? 'Létrehozva' : 'Created'}</TableHead>
                <TableHead className="text-right">{language === 'hu' ? 'Művelet' : 'Action'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {language === 'hu' ? 'Betöltés...' : 'Loading...'}
                  </TableCell>
                </TableRow>
              ) : codes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {language === 'hu' ? 'Még nincs meghívó kód.' : 'No invite codes yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                codes.map((code) => (
                  <TableRow key={code.id} className={!code.is_active ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-semibold text-sm bg-slate-100 px-2 py-1 rounded">
                          {code.code}
                        </code>
                        <button
                          onClick={() => copyCode(code.code, code.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedId === code.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={code.use_count >= code.max_uses ? 'text-red-500 font-semibold' : ''}>
                        {code.use_count} / {code.max_uses}
                      </span>
                    </TableCell>
                    <TableCell>
                      {code.is_active ? (
                        code.use_count >= code.max_uses ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            {language === 'hu' ? 'Kimerült' : 'Exhausted'}
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            {language === 'hu' ? 'Aktív' : 'Active'}
                          </Badge>
                        )
                      ) : (
                        <Badge variant="secondary">
                          {language === 'hu' ? 'Inaktív' : 'Inactive'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {code.note || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(code.created_at).toLocaleDateString(language === 'hu' ? 'hu-HU' : 'en-US')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          {code.is_active
                            ? (language === 'hu' ? 'Aktív' : 'On')
                            : (language === 'hu' ? 'Inaktív' : 'Off')}
                        </span>
                        <Switch
                          checked={code.is_active}
                          onCheckedChange={() => toggleActive(code.id, code.is_active)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInviteCodes;
