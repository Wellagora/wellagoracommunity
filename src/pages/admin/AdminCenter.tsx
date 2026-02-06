import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

type BlockState<T> = {
  loading: boolean;
  error: string | null;
  data: T | null;
};

type PlatformOverview = {
  totalUsers: number;
  creators: number;
  sponsors: number;
  members: number;
  activeProjects: number;
  activePrograms: number;
};

type SponsorshipOverview = {
  totalSponsors: number;
  activeSponsoredPrograms: number;
};

type CreditOverview = {
  totalPurchases: number;
  totalSpend: number;
  currentBalance: number;
};

const safeCount = async (table: string, filters: (q: any) => any) => {
  const q = supabase.from(table).select('*', { count: 'exact', head: true });
  const res = await filters(q);
  if (res.error) throw res.error;
  return res.count || 0;
};

const AdminCenter = () => {
  const navigate = useNavigate();

  const [platform, setPlatform] = useState<BlockState<PlatformOverview>>({
    loading: true,
    error: null,
    data: null,
  });

  const [sponsorship, setSponsorship] = useState<BlockState<SponsorshipOverview>>({
    loading: true,
    error: null,
    data: null,
  });

  const [credits, setCredits] = useState<BlockState<CreditOverview>>({
    loading: true,
    error: null,
    data: null,
  });

  const purchasedTypes = useMemo(() => ['purchase', 'subscription', 'initial', 'rollover', 'bonus'], []);
  const spentTypes = useMemo(() => ['deduction', 'sponsorship', 'usage', 'spend'], []);

  useEffect(() => {
    const loadPlatform = async () => {
      setPlatform({ loading: true, error: null, data: null });
      try {
        const [
          totalUsers,
          creators,
          sponsors,
          members,
          activeProjects,
          activePrograms,
        ] = await Promise.all([
          safeCount('profiles', (q) => q),
          safeCount('profiles', (q) => q.eq('user_role', 'creator')),
          safeCount('profiles', (q) => q.eq('user_role', 'sponsor')),
          safeCount('profiles', (q) => q.eq('user_role', 'member')),
          safeCount('projects', (q) => q.eq('is_active', true)),
          safeCount('expert_contents', (q) => q.eq('is_published', true)),
        ]);

        setPlatform({
          loading: false,
          error: null,
          data: {
            totalUsers,
            creators,
            sponsors,
            members,
            activeProjects,
            activePrograms,
          },
        });
      } catch (e: any) {
        setPlatform({ loading: false, error: e?.message || 'No data available', data: null });
      }
    };

    const loadSponsorship = async () => {
      setSponsorship({ loading: true, error: null, data: null });
      try {
        const [totalSponsors, activeSponsoredPrograms] = await Promise.all([
          safeCount('sponsors', (q) => q),
          safeCount('content_sponsorships', (q) => q.eq('is_active', true)),
        ]);

        setSponsorship({
          loading: false,
          error: null,
          data: {
            totalSponsors,
            activeSponsoredPrograms,
          },
        });
      } catch (e: any) {
        setSponsorship({ loading: false, error: e?.message || 'No data available', data: null });
      }
    };

    const loadCredits = async () => {
      setCredits({ loading: true, error: null, data: null });
      try {
        const { data, error } = await supabase.from('credit_transactions').select('credits, transaction_type');
        if (error) throw error;

        const rows = (data || []) as { credits: number; transaction_type: string }[];
        const totalPurchases = rows
          .filter((r) => purchasedTypes.includes(r.transaction_type))
          .reduce((sum, r) => sum + (r.credits || 0), 0);

        const totalSpend = Math.abs(
          rows
            .filter((r) => spentTypes.includes(r.transaction_type))
            .reduce((sum, r) => sum + (r.credits || 0), 0)
        );

        const currentBalance = Math.max(0, totalPurchases - totalSpend);

        setCredits({
          loading: false,
          error: null,
          data: {
            totalPurchases,
            totalSpend,
            currentBalance,
          },
        });
      } catch (e: any) {
        setCredits({ loading: false, error: e?.message || 'No data available', data: null });
      }
    };

    loadPlatform();
    loadSponsorship();
    loadCredits();
  }, [purchasedTypes, spentTypes]);

  const StatRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );

  const Block = ({
    title,
    state,
    children,
  }: {
    title: string;
    state: BlockState<any>;
    children: ReactNode;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        {state.loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        {state.error ? <div className="text-sm text-muted-foreground">No data available</div> : children}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Admin Center</div>
          <h1 className="text-2xl font-semibold">Adminisztrációs Központ</h1>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          Admin Panel
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Block title="Platform overview" state={platform}>
          <div className="space-y-1">
            <StatRow label="Total users" value={String(platform.data?.totalUsers ?? 0)} />
            <StatRow label="Creators" value={String(platform.data?.creators ?? 0)} />
            <StatRow label="Sponsors" value={String(platform.data?.sponsors ?? 0)} />
            <StatRow label="Members" value={String(platform.data?.members ?? 0)} />
            <StatRow label="Active projects" value={String(platform.data?.activeProjects ?? 0)} />
            <StatRow label="Active programs" value={String(platform.data?.activePrograms ?? 0)} />
          </div>
        </Block>

        <Block title="Sponsorship overview" state={sponsorship}>
          <div className="space-y-1">
            <StatRow label="Total sponsors" value={String(sponsorship.data?.totalSponsors ?? 0)} />
            <StatRow label="Active sponsored programs" value={String(sponsorship.data?.activeSponsoredPrograms ?? 0)} />
          </div>
        </Block>

        <Block title="Credit overview (global)" state={credits}>
          <div className="space-y-1">
            <StatRow label="Total credit purchases" value={String(credits.data?.totalPurchases ?? 0)} />
            <StatRow label="Total credit spend" value={String(credits.data?.totalSpend ?? 0)} />
            <StatRow label="Current platform credit balance" value={String(credits.data?.currentBalance ?? 0)} />
          </div>
        </Block>
      </div>
    </div>
  );
};

export default AdminCenter;
