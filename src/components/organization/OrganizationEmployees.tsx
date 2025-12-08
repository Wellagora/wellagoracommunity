import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  UserPlus,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  Clock,
  UserMinus,
  Trophy,
  Target,
  Loader2
} from "lucide-react";
import { format, parseISO, addDays } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  user_role: string;
  created_at: string;
  organization_id: string | null;
  total_points?: number;
  program_count?: number;
}

interface OrganizationInvite {
  id: string;
  invite_code: string;
  is_active: boolean;
  use_count: number;
  max_uses: number | null;
  expires_at: string | null;
  created_at: string;
}

const OrganizationEmployees = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeInvite, setActiveInvite] = useState<OrganizationInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const getLocale = () => {
    switch (language) {
      case 'hu': return hu;
      case 'de': return de;
      default: return enUS;
    }
  };

  // Fetch employees with points and programs
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url, user_role, created_at, organization_id')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: true });

        if (employeesError) throw employeesError;

        // Fetch points for each employee
        const employeesWithStats = await Promise.all(
          (employeesData || []).map(async (emp) => {
            // Get total points
            const { data: completions } = await supabase
              .from('challenge_completions')
              .select('points_earned')
              .eq('user_id', emp.id)
              .eq('validation_status', 'approved');
            
            const totalPoints = completions?.reduce((sum, c) => sum + (c.points_earned || 0), 0) || 0;

            // Get unique program count
            const { data: programs } = await supabase
              .from('challenge_completions')
              .select('challenge_id')
              .eq('user_id', emp.id);
            
            const programCount = new Set(programs?.map(p => p.challenge_id) || []).size;

            return {
              ...emp,
              total_points: totalPoints,
              program_count: programCount
            };
          })
        );

        setEmployees(employeesWithStats);

        // Fetch active invite
        const { data: inviteData } = await supabase
          .from('organization_invites')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (inviteData && inviteData.length > 0) {
          // Check if expired
          const invite = inviteData[0];
          if (!invite.expires_at || new Date(invite.expires_at) > new Date()) {
            setActiveInvite(invite);
          }
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [profile?.organization_id]);

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const handleGenerateLink = async () => {
    if (!user?.id || !profile?.organization_id) return;

    setGeneratingLink(true);
    try {
      const inviteCode = generateInviteCode();
      const expiresAt = addDays(new Date(), 30); // 30 days expiry

      const { data, error } = await supabase
        .from('organization_invites')
        .insert({
          organization_id: profile.organization_id,
          invite_code: inviteCode,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveInvite(data);
      toast({
        title: "Meghívó link létrehozva!",
        description: "A link 30 napig érvényes.",
      });
    } catch (error) {
      console.error('Error generating invite:', error);
      toast({
        title: "Hiba",
        description: "Nem sikerült létrehozni a meghívó linket",
        variant: "destructive",
      });
    } finally {
      setGeneratingLink(false);
    }
  };

  const getInviteUrl = () => {
    if (!activeInvite) return '';
    return `${window.location.origin}/join/org/${activeInvite.invite_code}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getInviteUrl());
      setCopied(true);
      toast({
        title: "Link másolva!",
        description: "A meghívó link a vágólapra került.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Hiba",
        description: "Nem sikerült másolni a linket",
        variant: "destructive",
      });
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (employeeId === user?.id) {
      toast({
        title: "Hiba",
        description: "Nem távolíthatod el magadat a szervezetből",
        variant: "destructive",
      });
      return;
    }

    setRemovingId(employeeId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          organization_id: null,
          organization: null 
        })
        .eq('id', employeeId);

      if (error) throw error;

      setEmployees(prev => prev.filter(e => e.id !== employeeId));
      toast({
        title: "Munkatárs eltávolítva",
        description: "A munkatárs sikeresen eltávolítva a szervezetből.",
      });
    } catch (error) {
      console.error('Error removing employee:', error);
      toast({
        title: "Hiba",
        description: "Nem sikerült eltávolítani a munkatársat",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'yyyy. MM. dd.', { locale: getLocale() });
    } catch {
      return '-';
    }
  };

  const totalPoints = employees.reduce((sum, e) => sum + (e.total_points || 0), 0);
  const activeProgramCount = new Set(employees.flatMap(e => Array(e.program_count || 0).fill(e.id))).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Összes munkatárs</p>
                <p className="text-4xl font-bold text-foreground">{employees.length}</p>
              </div>
              <Users className="w-12 h-12 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Összesített pontok</p>
                <p className="text-4xl font-bold text-success">{totalPoints}</p>
              </div>
              <Trophy className="w-12 h-12 text-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-accent/5 to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktív programokban</p>
                <p className="text-4xl font-bold text-accent">{activeProgramCount}</p>
              </div>
              <Target className="w-12 h-12 text-accent/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Link Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Meghívó link
          </CardTitle>
          <CardDescription>
            Oszd meg ezt a linket a kollégáiddal, hogy csatlakozzanak a szervezethez
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeInvite ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  value={getInviteUrl()} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyLink} variant="outline">
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {activeInvite.use_count} használat
                </span>
                {activeInvite.expires_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Lejár: {formatDate(activeInvite.expires_at)}
                  </span>
                )}
              </div>
              <Button 
                onClick={handleGenerateLink} 
                variant="outline" 
                size="sm"
                disabled={generatingLink}
              >
                {generatingLink ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LinkIcon className="w-4 h-4 mr-2" />
                )}
                Új link generálása
              </Button>
            </div>
          ) : (
            <Button onClick={handleGenerateLink} disabled={generatingLink}>
              {generatingLink ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Meghívó link generálása
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Employee List */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Munkatársak</h2>
        {employees.length === 0 ? (
          <Card className="border-muted">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">Még nincs munkatárs</h3>
              <p className="text-muted-foreground mb-6">
                Generálj egy meghívó linket és oszd meg a kollégáiddal!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profilkép</TableHead>
                      <TableHead>Név</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Csatlakozott</TableHead>
                      <TableHead className="text-center">Pontok</TableHead>
                      <TableHead className="text-center">Programok</TableHead>
                      <TableHead className="text-right">Műveletek</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <Avatar>
                            <AvatarImage src={employee.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {employee.first_name?.[0]}{employee.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          {employee.first_name} {employee.last_name}
                          {employee.id === user?.id && (
                            <Badge variant="outline" className="ml-2 text-xs">Te</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {employee.email}
                        </TableCell>
                        <TableCell>
                          {formatDate(employee.created_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            {employee.total_points || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {employee.program_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {employee.id !== user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={removingId === employee.id}
                                >
                                  {removingId === employee.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <UserMinus className="w-4 h-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Munkatárs eltávolítása</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Biztosan el szeretnéd távolítani {employee.first_name} {employee.last_name} munkatársat a szervezetből? 
                                    Ez a művelet nem visszavonható.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Mégsem</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveEmployee(employee.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eltávolítás
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrganizationEmployees;
