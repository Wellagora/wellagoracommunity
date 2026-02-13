import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, User, Calendar, Loader2, X } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'program' | 'expert' | 'event';
  title: string;
  subtitle?: string;
  url: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchPattern = `%${q}%`;

      const [programsRes, expertsRes, eventsRes] = await Promise.all([
        supabase
          .from('expert_contents')
          .select('id, title, category')
          .eq('is_published', true)
          .ilike('title', searchPattern)
          .limit(5),
        supabase
          .from('profiles')
          .select('id, first_name, last_name, expert_title, user_role')
          .in('user_role', ['expert', 'creator'])
          .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},expert_title.ilike.${searchPattern}`)
          .limit(5),
        supabase
          .from('events')
          .select('id, title, start_date')
          .ilike('title', searchPattern)
          .gte('start_date', new Date().toISOString())
          .limit(5),
      ]);

      const combined: SearchResult[] = [
        ...(programsRes.data || []).map(p => ({
          id: p.id,
          type: 'program' as const,
          title: p.title,
          subtitle: p.category || undefined,
          url: `/programs/${p.id}`,
        })),
        ...(expertsRes.data || []).map(e => ({
          id: e.id,
          type: 'expert' as const,
          title: `${e.first_name} ${e.last_name}`,
          subtitle: e.expert_title || undefined,
          url: `/expert/${e.id}`,
        })),
        ...(eventsRes.data || []).map(ev => ({
          id: ev.id,
          type: 'event' as const,
          title: ev.title,
          subtitle: ev.start_date ? new Date(ev.start_date).toLocaleDateString('hu') : undefined,
          url: `/esemenyek/${ev.id}`,
        })),
      ];

      setResults(combined);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    onOpenChange(false);
  };

  const typeIcons = {
    program: <BookOpen className="w-4 h-4" />,
    expert: <User className="w-4 h-4" />,
    event: <Calendar className="w-4 h-4" />,
  };

  const typeLabels = {
    program: t('search.type_program') || 'Program',
    expert: t('search.type_expert') || 'Szakértő',
    event: t('search.type_event') || 'Esemény',
  };

  const typeColors = {
    program: 'bg-blue-100 text-blue-700',
    expert: 'bg-amber-100 text-amber-700',
    event: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="flex items-center border-b px-4">
          <Search className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder') || 'Keresés programok, szakértők, események között...'}
            className="border-0 focus-visible:ring-0 h-12 text-base"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('search.no_results') || 'Nincs találat'}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className={`p-1.5 rounded-md ${typeColors[result.type]}`}>
                    {typeIcons[result.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {typeLabels[result.type]}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('search.hint') || 'Írj be legalább 2 karaktert a kereséshez'}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>⌘K {t('search.shortcut_hint') || 'a gyors kereséshez'}</span>
          <span>ESC {t('search.close') || 'bezárás'}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
