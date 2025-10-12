import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Sparkles, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserRoleManager from './UserRoleManager';

interface PendingChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_days: number;
  points_base: number;
  base_impact: {
    co2_saved: number;
    description: string;
  };
  validation_requirements: {
    type: string;
    description: string;
    steps: string[];
    tips: string[];
  };
  created_at: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [pendingChallenges, setPendingChallenges] = useState<PendingChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    pendingReview: 0,
    totalImpact: 0
  });

  // Check admin access - SECURITY: Server-side verification via edge function
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        // Server-side admin verification - cannot be bypassed by client
        const { data, error } = await supabase.functions.invoke('verify-admin-access');

        if (error || !data?.hasAccess) {
          toast({
            title: 'Hozzáférés megtagadva',
            description: 'Csak adminisztrátorok érhetik el ezt az oldalt.',
            variant: 'destructive'
          });
          navigate('/dashboard');
        } else {
          setHasAdminAccess(true);
        }
      } catch (error) {
        console.error('Error verifying admin access:', error);
        toast({
          title: 'Hiba',
          description: 'Hiba történt az adminisztrátori jogosultságok ellenőrzése során.',
          variant: 'destructive'
        });
        navigate('/dashboard');
      }
    };

    checkAccess();
  }, [user, navigate, toast]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load pending challenges
      const { data: pending, error: pendingError } = await supabase
        .from('challenge_definitions')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      setPendingChallenges(pending?.map(p => ({
        ...p,
        base_impact: p.base_impact as { co2_saved: number; description: string },
        validation_requirements: p.validation_requirements as {
          type: string;
          description: string;
          steps: string[];
          tips: string[];
        }
      })) || []);

      // Load stats
      const { count: totalCount } = await supabase
        .from('challenge_definitions')
        .select('*', { count: 'exact', head: true });

      const { count: activeCount } = await supabase
        .from('challenge_definitions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalChallenges: totalCount || 0,
        activeChallenges: activeCount || 0,
        pendingReview: pending?.length || 0,
        totalImpact: 0 // Calculate from completions
      });

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült betölteni az adatokat',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const approveChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_definitions')
        .update({ is_active: true })
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: 'Kihívás jóváhagyva',
        description: 'A kihívás mostantól elérhető a felhasználók számára',
      });

      loadData();
    } catch (error) {
      console.error('Error approving challenge:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült jóváhagyni a kihívást',
        variant: 'destructive'
      });
    }
  };

  const rejectChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_definitions')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: 'Kihívás elutasítva',
        description: 'A kihívás törölve lett',
      });

      loadData();
    } catch (error) {
      console.error('Error rejecting challenge:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült elutasítani a kihívást',
        variant: 'destructive'
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      energy: 'bg-yellow-500',
      transport: 'bg-blue-500',
      food: 'bg-green-500',
      waste: 'bg-orange-500',
      community: 'bg-purple-500',
      innovation: 'bg-pink-500',
      water: 'bg-cyan-500',
      biodiversity: 'bg-emerald-500',
      'circular-economy': 'bg-indigo-500',
      'green-finance': 'bg-teal-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (!hasAdminAccess || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Vissza a Platformra
        </Button>
        <Badge variant="outline" className="text-lg">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-powered
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Kihívások moderálása és platform statisztikák</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Összes Kihívás</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChallenges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktív Kihívások</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeChallenges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Jóváhagyásra Vár</CardTitle>
            <Clock className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingReview}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Résztvevők</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,234</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Jóváhagyásra vár ({pendingChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="active">Aktív kihívások</TabsTrigger>
          <TabsTrigger value="users">Felhasználók</TabsTrigger>
          <TabsTrigger value="analytics">Analitika</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingChallenges.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Minden kihívás jóváhagyva!</h3>
                <p className="text-muted-foreground">Jelenleg nincs új kihívás moderálásra várva.</p>
              </CardContent>
            </Card>
          ) : (
            pendingChallenges.map((challenge) => (
              <Card key={challenge.id} className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(challenge.category)}>
                          {challenge.category}
                        </Badge>
                        <Badge className={getDifficultyColor(challenge.difficulty)} variant="secondary">
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {challenge.duration_days} nap
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      <CardDescription className="mt-2">{challenge.description}</CardDescription>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-primary">{challenge.points_base}</div>
                      <div className="text-sm text-muted-foreground">pont</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Várható Impact:</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        {challenge.base_impact.co2_saved} kg CO2 megtakarítás
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {challenge.base_impact.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Lépések ({challenge.validation_requirements.steps.length}):</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {challenge.validation_requirements.steps.slice(0, 3).map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                      {challenge.validation_requirements.steps.length > 3 && (
                        <li className="text-muted-foreground">+ még {challenge.validation_requirements.steps.length - 3} lépés</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => approveChallenge(challenge.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Jóváhagy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => rejectChallenge(challenge.id)}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Elutasít
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Aktív Kihívások</CardTitle>
              <CardDescription>A platform-on jelenleg elérhető kihívások</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Hamarosan...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <UserRoleManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analitika</CardTitle>
              <CardDescription>Részletes statisztikák és trendek</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Hamarosan...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
