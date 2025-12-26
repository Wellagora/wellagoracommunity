import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { ProgramCreator } from "@/components/admin/ProgramCreator";
import { ProgramEditor } from "@/components/admin/ProgramEditor";
import { 
  Users, Settings, Plus, LayoutDashboard, Calendar, FileText, 
  TrendingUp, TrendingDown, Activity, AlertCircle, Send, Download,
  Link2, Search, Filter, MoreHorizontal, Eye, Edit, Copy, Power,
  BarChart3, PieChart, LineChart, Building2, MessageSquare, Trash2,
  CheckCircle, Clock, XCircle, Image, Upload
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { hu } from "date-fns/locale";

interface Project {
  id: string;
  name: string;
  slug: string;
  region_name: string;
  villages: string[];
  description: string | null;
  settings?: Record<string, unknown>;
  is_active: boolean;
  branding?: Record<string, unknown>;
}

interface ProjectMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  points?: number;
  active_programs?: number;
}

interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points_base: number;
  is_active: boolean;
  is_continuous: boolean;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  location: string | null;
  project_id: string;
  participant_count?: number;
  completion_rate?: number;
  sponsor_name?: string;
}

interface Sponsorship {
  id: string;
  challenge_id: string;
  sponsor_organization_id: string | null;
  credit_cost: number;
  status: string;
  start_date: string;
  end_date: string | null;
  organization_name?: string;
  program_title?: string;
}

interface DashboardStats {
  activeMembers: number;
  membersTrend: number;
  runningPrograms: number;
  completionRate: number;
  sponsorRevenue: number;
}

interface ActivityData {
  date: string;
  completions: number;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d'];

export default function ProjectAdminPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // State
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");
  const [programView, setProgramView] = useState<"cards" | "list">("cards");
  const [programFilter, setProgramFilter] = useState("all");
  const [analyticsRange, setAnalyticsRange] = useState("30");
  const [settingsSubTab, setSettingsSubTab] = useState("analytics");
  const [programsRefreshKey, setProgramsRefreshKey] = useState(0);
  
  // Modals
  const [showProgramCreator, setShowProgramCreator] = useState(false);
  const [showProgramEditor, setShowProgramEditor] = useState<string | null>(null);
  const [showProgramDetail, setShowProgramDetail] = useState<Program | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showMemberRemove, setShowMemberRemove] = useState<ProjectMember | null>(null);
  
  // Form State
  const [projectName, setProjectName] = useState("");
  const [regionName, setRegionName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageTarget, setMessageTarget] = useState("all");
  const [sendEmail, setSendEmail] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);

  // Load project data
  useEffect(() => {
    if (projectId && user) {
      loadAllData();
    }
  }, [projectId, user]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadProject(),
      loadMembers(),
      loadPrograms(),
      loadSponsorships(),
      loadStats(),
      loadActivityData(),
    ]);
    setLoading(false);
  };

  const loadProject = async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    
    if (error) {
      toast({ title: t('project_admin.error'), description: error.message, variant: "destructive" });
      return;
    }
    
    setProject(data as Project);
    setProjectName(data.name);
    setRegionName(data.region_name);
    setProjectDescription(data.description || "");
    setIsPublic((data.settings as Record<string, unknown>)?.allowPublicView as boolean ?? true);
  };

  const loadMembers = async () => {
    if (!projectId) return;
    
    const { data: membersData, error } = await supabase
      .from("project_members")
      .select("id, user_id, role, created_at")
      .eq("project_id", projectId);
    
    if (error) return;
    
    if (!membersData?.length) {
      setMembers([]);
      return;
    }
    
    const userIds = membersData.map(m => m.user_id);
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, avatar_url")
      .in("id", userIds);
    
    const { data: completionsData } = await supabase
      .from("challenge_completions")
      .select("user_id, points_earned")
      .eq("project_id", projectId)
      .in("user_id", userIds);
    
    const pointsMap: Record<string, number> = {};
    completionsData?.forEach(c => {
      pointsMap[c.user_id] = (pointsMap[c.user_id] || 0) + c.points_earned;
    });
    
    const combined = membersData.map(member => {
      const profile = profilesData?.find(p => p.id === member.user_id);
      return {
        ...member,
        profile: profile || { id: member.user_id, email: "", first_name: "", last_name: "", avatar_url: null },
        points: pointsMap[member.user_id] || 0,
        active_programs: 0,
      };
    });
    
    setMembers(combined);
  };

  const loadPrograms = async () => {
    if (!projectId) return;

    console.log('[ProjectAdminPage] loadPrograms: projectId=', projectId);

    const { data, error } = await supabase
      .from("challenge_definitions")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    console.log('[ProjectAdminPage] loadPrograms: rows=', data);
    console.log('[ProjectAdminPage] loadPrograms: error=', error);

    if (error) return;
    
    const programIds = data?.map(p => p.id) || [];
    const { data: completions } = await supabase
      .from("challenge_completions")
      .select("challenge_id, user_id, validation_status")
      .in("challenge_id", programIds);
    
    const { data: sponsorshipsData } = await supabase
      .from("challenge_sponsorships")
      .select("challenge_id, sponsor_organization_id, status")
      .in("challenge_id", programIds)
      .eq("status", "active");
    
    const orgIds = sponsorshipsData?.map(s => s.sponsor_organization_id).filter(Boolean) as string[] || [];
    const { data: orgsData } = orgIds.length > 0 ? await supabase
      .from("organizations")
      .select("id, name")
      .in("id", orgIds) : { data: [] };
    
    const programsWithStats = data?.map(program => {
      const programCompletions = completions?.filter(c => c.challenge_id === program.id) || [];
      const uniqueParticipants = new Set(programCompletions.map(c => c.user_id)).size;
      const approvedCompletions = programCompletions.filter(c => c.validation_status === 'approved').length;
      
      const sponsorship = sponsorshipsData?.find(s => s.challenge_id === program.id);
      const org = orgsData?.find(o => o.id === sponsorship?.sponsor_organization_id);
      
      return {
        ...program,
        participant_count: uniqueParticipants,
        completion_rate: uniqueParticipants > 0 ? Math.round((approvedCompletions / uniqueParticipants) * 100) : 0,
        sponsor_name: org?.name,
      };
    }) || [];
    
    setPrograms(programsWithStats as Program[]);
  };

  const loadSponsorships = async () => {
    if (!projectId) return;
    
    const { data, error } = await supabase
      .from("challenge_sponsorships")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    
    if (error) return;
    
    const orgIds = data?.map(s => s.sponsor_organization_id).filter(Boolean) as string[] || [];
    const challengeIds = data?.map(s => s.challenge_id) || [];
    
    const [orgsRes, programsRes] = await Promise.all([
      orgIds.length > 0 ? supabase.from("organizations").select("id, name").in("id", orgIds) : { data: [] },
      challengeIds.length > 0 ? supabase.from("challenge_definitions").select("id, title").in("id", challengeIds) : { data: [] },
    ]);
    
    const enriched = data?.map(s => ({
      ...s,
      organization_name: orgsRes.data?.find(o => o.id === s.sponsor_organization_id)?.name || "N/A",
      program_title: programsRes.data?.find(p => p.id === s.challenge_id)?.title || s.challenge_id,
    })) || [];
    
    setSponsorships(enriched as Sponsorship[]);
  };

  const loadStats = async () => {
    if (!projectId) return;
    
    const { count: totalMembers } = await supabase
      .from("project_members")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);
    
    const { count: activePrograms } = await supabase
      .from("challenge_definitions")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("is_active", true);
    
    const { data: completions } = await supabase
      .from("challenge_completions")
      .select("validation_status")
      .eq("project_id", projectId);
    
    const totalCompletions = completions?.length || 0;
    const approvedCompletions = completions?.filter(c => c.validation_status === 'approved').length || 0;
    const completionRate = totalCompletions > 0 ? Math.round((approvedCompletions / totalCompletions) * 100) : 0;
    
    const { data: sponsorData } = await supabase
      .from("challenge_sponsorships")
      .select("credit_cost")
      .eq("project_id", projectId)
      .eq("status", "active");
    
    const sponsorRevenue = sponsorData?.reduce((sum, s) => sum + (s.credit_cost || 0), 0) || 0;
    
    setStats({
      activeMembers: totalMembers || 0,
      membersTrend: 5,
      runningPrograms: activePrograms || 0,
      completionRate,
      sponsorRevenue,
    });
  };

  const loadActivityData = async () => {
    if (!projectId) return;
    
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    const { data } = await supabase
      .from("challenge_completions")
      .select("completion_date")
      .eq("project_id", projectId)
      .gte("completion_date", thirtyDaysAgo.toISOString().split('T')[0]);
    
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
    const activityMap: Record<string, number> = {};
    
    days.forEach(day => {
      activityMap[format(day, 'yyyy-MM-dd')] = 0;
    });
    
    data?.forEach(c => {
      const date = c.completion_date;
      if (activityMap[date] !== undefined) {
        activityMap[date]++;
      }
    });
    
    const chartData = Object.entries(activityMap).map(([date, completions]) => ({
      date: format(new Date(date), 'MM/dd'),
      completions,
    }));
    
    setActivityData(chartData);
  };

  // Actions
  const removeMember = async (member: ProjectMember) => {
    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("id", member.id);
    
    if (error) {
      toast({ title: t('project_admin.error'), description: error.message, variant: "destructive" });
      return;
    }
    
    await supabase
      .from("profiles")
      .update({ project_id: null })
      .eq("id", member.user_id);
    
    toast({ title: t('project_admin.success'), description: t('project_admin.member_removed') });
    setShowMemberRemove(null);
    loadMembers();
  };

  const toggleProgramActive = async (program: Program) => {
    const { error } = await supabase
      .from("challenge_definitions")
      .update({ is_active: !program.is_active })
      .eq("id", program.id);
    
    if (error) {
      toast({ title: t('project_admin.error'), description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: t('project_admin.success'), description: program.is_active ? "Program deaktiválva" : "Program aktiválva" });
    loadPrograms();
  };

  const duplicateProgram = async (program: Program) => {
    const newId = `${program.id}-copy-${Date.now()}`;
    const { error } = await supabase
      .from("challenge_definitions")
      .insert({
        id: newId,
        title: `${program.title} (másolat)`,
        description: program.description,
        category: program.category,
        difficulty: program.difficulty,
        points_base: program.points_base,
        is_active: false,
        is_continuous: program.is_continuous,
        project_id: program.project_id,
        base_impact: {},
      });
    
    if (error) {
      toast({ title: t('project_admin.error'), description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: t('project_admin.success'), description: "Program duplikálva" });
    loadPrograms();
  };

  const saveSettings = async () => {
    if (!project) return;
    
    const { error } = await supabase
      .from("projects")
      .update({
        name: projectName,
        region_name: regionName,
        description: projectDescription || null,
        settings: { ...(project.settings || {}), allowPublicView: isPublic },
      })
      .eq("id", project.id);
    
    if (error) {
      toast({ title: t('project_admin.error'), description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: t('project_admin.success'), description: t('project_admin.settings_updated') });
    loadProject();
  };

  const deactivateProject = async () => {
    if (!project) return;
    
    const { error } = await supabase
      .from("projects")
      .update({ is_active: false })
      .eq("id", project.id);
    
    if (error) {
      toast({ title: t('project_admin.error'), description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: t('project_admin.success'), description: "Projekt deaktiválva" });
    navigate("/super-admin");
  };

  const sendMessage = async () => {
    if (!messageTitle || !messageContent || !project) return;
    
    let targetUserIds: string[] = [];
    
    if (messageTarget === "all") {
      targetUserIds = members.map(m => m.user_id);
    } else if (messageTarget === "active") {
      targetUserIds = members.map(m => m.user_id);
    }
    
    if (sendNotification) {
      const notifications = targetUserIds.map(userId => ({
        user_id: userId,
        title: messageTitle,
        message: messageContent,
        type: "admin",
        action_url: `/dashboard`,
      }));
      
      const { error } = await supabase.from("notifications").insert(notifications);
      
      if (error) {
        toast({ title: t('project_admin.error'), description: error.message, variant: "destructive" });
        return;
      }
    }
    
    toast({ title: t('project_admin.success'), description: `Üzenet elküldve ${targetUserIds.length} tagnak` });
    setShowMessageModal(false);
    setMessageTitle("");
    setMessageContent("");
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${project?.slug}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link másolva!", description: "A meghívó link a vágólapra került" });
  };

  // Filtered data
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = memberSearch === "" || 
        `${m.profile.first_name} ${m.profile.last_name}`.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.profile.email.toLowerCase().includes(memberSearch.toLowerCase());
      
      if (memberFilter === "active") {
        return matchesSearch && (m.points || 0) > 0;
      }
      if (memberFilter === "inactive") {
        return matchesSearch && (m.points || 0) === 0;
      }
      return matchesSearch;
    });
  }, [members, memberSearch, memberFilter]);

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      if (programFilter === "active") return p.is_active;
      if (programFilter === "completed") return !p.is_active && p.end_date && new Date(p.end_date) < new Date();
      if (programFilter === "planned") return !p.is_active && (!p.start_date || new Date(p.start_date) > new Date());
      return true;
    });
  }, [programs, programFilter, programsRefreshKey]);

  const topMembers = useMemo(() => {
    return [...members].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 10);
  }, [members]);

  const programsByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    programs.forEach(p => {
      const cat = p.category || "other";
      categoryMap[cat] = (categoryMap[cat] || 0) + (p.participant_count || 0);
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [programs]);

  const isCurrentUserAdmin = members.some(m => m.user_id === user?.id && m.role === "admin");

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
            <div className="grid grid-cols-4 gap-4 mt-8">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Projekt nem található</CardTitle>
              <CardDescription>A keresett projekt nem létezik vagy nincs hozzáférésed.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-14 sm:mt-16">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{project.name}</h1>
            <Badge variant={project.is_active ? "default" : "secondary"}>
              {project.is_active ? "Aktív" : "Inaktív"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{project.region_name}</p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-auto mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Irányítópult</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Közösség</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Programok</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 text-xs sm:text-sm">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Riportok</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card/30 backdrop-blur border-border/50">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Aktív tagok
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">{stats?.activeMembers || 0}</span>
                    {(stats?.membersTrend || 0) > 0 ? (
                      <span className="text-green-500 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +{stats?.membersTrend}%
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center text-sm">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        {stats?.membersTrend}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur border-border/50">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Futó programok
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-3xl font-bold">{stats?.runningPrograms || 0}</span>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur border-border/50">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Teljesítési ráta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-3xl font-bold">{stats?.completionRate || 0}%</span>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur border-border/50">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Szponzori kredit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-3xl font-bold">{stats?.sponsorRevenue || 0}</span>
                </CardContent>
              </Card>
            </div>

            {/* Middle Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Action Items */}
              <Card className="bg-card/30 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    Teendők
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {programs.filter(p => p.end_date && new Date(p.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && p.is_active).length > 0 ? (
                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <span>Programok hamarosan lejárnak</span>
                      </div>
                      <Badge variant="secondary">
                        {programs.filter(p => p.end_date && new Date(p.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && p.is_active).length}
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Nincs sürgős teendő</p>
                  )}
                </CardContent>
              </Card>

              {/* Activity Chart */}
              <Card className="bg-card/30 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Aktivitás (30 nap)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData.slice(-14)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey="completions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card/30 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Gyors műveletek</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button variant="outline" onClick={() => setShowProgramCreator(true)} className="h-auto py-4 flex-col gap-2">
                    <Plus className="h-5 w-5" />
                    <span>Új program</span>
                  </Button>
                  <Button variant="outline" onClick={() => setShowMessageModal(true)} className="h-auto py-4 flex-col gap-2">
                    <Send className="h-5 w-5" />
                    <span>Üzenet küldése</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Download className="h-5 w-5" />
                    <span>Riport letöltés</span>
                  </Button>
                  <Button variant="outline" onClick={copyInviteLink} className="h-auto py-4 flex-col gap-2">
                    <Link2 className="h-5 w-5" />
                    <span>Meghívó link</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Community */}
          <TabsContent value="community" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Keresés név vagy email alapján..." 
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={memberFilter} onValueChange={setMemberFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Mind</SelectItem>
                    <SelectItem value="active">Aktív (30 nap)</SelectItem>
                    <SelectItem value="inactive">Inaktív</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card/30 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Tagok ({filteredMembers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tag</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden sm:table-cell">Csatlakozott</th>
                          <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Pontok</th>
                          <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Műveletek</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.map((member) => (
                          <tr key={member.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.profile.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {member.profile.first_name?.[0]}{member.profile.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">
                                    {member.profile.first_name} {member.profile.last_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{member.profile.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm text-muted-foreground hidden sm:table-cell">
                              {format(new Date(member.created_at), 'yyyy. MM. dd.')}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Badge variant="secondary">{member.points || 0} pont</Badge>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/profile/${member.user_id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Profil megtekintése
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Send className="h-4 w-4 mr-2" />
                                    Üzenet küldése
                                  </DropdownMenuItem>
                                  {isCurrentUserAdmin && member.user_id !== user?.id && (
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => setShowMemberRemove(member)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eltávolítás
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredMembers.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Nincs találat</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Top 10 tag</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topMembers.map((member, index) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <span className="w-6 text-center font-bold text-muted-foreground">
                          {index + 1}.
                        </span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.profile.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {member.profile.first_name?.[0]}{member.profile.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.profile.first_name} {member.profile.last_name}
                          </p>
                        </div>
                        <Badge variant="outline">{member.points || 0}</Badge>
                      </div>
                    ))}
                    {topMembers.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">Még nincs adat</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: Programs */}
          <TabsContent value="programs" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-3">
                <div className="flex border rounded-lg overflow-hidden">
                  <Button 
                    variant={programView === "cards" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setProgramView("cards")}
                    className="rounded-none"
                  >
                    Kártyák
                  </Button>
                  <Button 
                    variant={programView === "list" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setProgramView("list")}
                    className="rounded-none"
                  >
                    Lista
                  </Button>
                </div>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Mind</SelectItem>
                    <SelectItem value="active">Aktív</SelectItem>
                    <SelectItem value="completed">Befejezett</SelectItem>
                    <SelectItem value="planned">Tervezett</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowProgramCreator(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Új program
              </Button>
            </div>

            {programView === "cards" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrograms.map((program) => (
                  <Card 
                    key={program.id} 
                    className="bg-card/30 backdrop-blur border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setShowProgramDetail(program)}
                  >
                    {program.image_url && (
                      <div className="h-32 overflow-hidden rounded-t-lg">
                        <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base line-clamp-2">{program.title}</CardTitle>
                        <Badge variant={program.is_active ? "default" : "secondary"}>
                          {program.is_active ? "Aktív" : "Inaktív"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{program.participant_count || 0} résztvevő</span>
                        <span>{program.completion_rate || 0}% teljesítés</span>
                      </div>
                      {program.sponsor_name && (
                        <Badge variant="outline" className="mt-2">
                          <Building2 className="h-3 w-3 mr-1" />
                          {program.sponsor_name}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/30 backdrop-blur border-border/50">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Név</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Típus</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Kezdés</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Befejezés</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Résztvevők</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Státusz</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Műveletek</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPrograms.map((program) => (
                          <tr key={program.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="py-3 px-4">
                              <p className="font-medium text-sm">{program.title}</p>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {program.is_continuous ? "Folyamatos" : "Esemény"}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                              {program.start_date ? format(new Date(program.start_date), 'yyyy.MM.dd') : '-'}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                              {program.end_date ? format(new Date(program.end_date), 'yyyy.MM.dd') : '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Badge variant="secondary">{program.participant_count || 0}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant={program.is_active ? "default" : "secondary"}>
                                {program.is_active ? "Aktív" : "Inaktív"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setShowProgramEditor(program.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Szerkesztés
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => duplicateProgram(program)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplikálás
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleProgramActive(program)}>
                                    <Power className="h-4 w-4 mr-2" />
                                    {program.is_active ? "Deaktiválás" : "Aktiválás"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredPrograms.length === 0 && (
              <Card className="bg-card/30 backdrop-blur border-border/50">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Még nincs program</p>
                  <Button onClick={() => setShowProgramCreator(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Első program létrehozása
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 4: Reports & Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Tabs value={settingsSubTab} onValueChange={setSettingsSubTab}>
              <TabsList>
                <TabsTrigger value="analytics">Analitika</TabsTrigger>
                <TabsTrigger value="sponsors">Szponzorok</TabsTrigger>
                <TabsTrigger value="messages">Üzenetek</TabsTrigger>
                <TabsTrigger value="settings">Beállítások</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-6 mt-6">
                <div className="flex gap-2">
                  {["7", "30", "90", "365"].map((days) => (
                    <Button 
                      key={days}
                      variant={analyticsRange === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAnalyticsRange(days)}
                    >
                      {days === "365" ? "12 hónap" : `${days} nap`}
                    </Button>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="bg-card/30 backdrop-blur border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <LineChart className="h-5 w-5" />
                        Tag növekedés
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                            <Line type="monotone" dataKey="completions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/30 backdrop-blur border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Aktivitás eloszlás
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={programsByCategory}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {programsByCategory.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sponsors" className="mt-6">
                <Card className="bg-card/30 backdrop-blur border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Szponzorálások</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border/50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Szervezet</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Kredit</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Időszak</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Státusz</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sponsorships.map((s) => (
                            <tr key={s.id} className="border-b border-border/30 hover:bg-muted/20">
                              <td className="py-3 px-4 font-medium text-sm">{s.organization_name}</td>
                              <td className="py-3 px-4 text-sm">{s.program_title}</td>
                              <td className="py-3 px-4 text-right">
                                <Badge variant="secondary">{s.credit_cost || 0}</Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                                {format(new Date(s.start_date), 'yyyy.MM.dd')} - {s.end_date ? format(new Date(s.end_date), 'yyyy.MM.dd') : 'Folyamatos'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant={s.status === "active" ? "default" : "secondary"}>
                                  {s.status === "active" ? "Aktív" : "Inaktív"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {sponsorships.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Még nincs szponzorálás</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="mt-6 space-y-6">
                <Card className="bg-card/30 backdrop-blur border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Központi üzenet küldése</CardTitle>
                    <CardDescription>Küldj értesítést a projekt tagjainak</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Üzenet címe</Label>
                      <Input 
                        value={messageTitle}
                        onChange={(e) => setMessageTitle(e.target.value)}
                        placeholder="Üzenet címe..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Üzenet tartalma</Label>
                      <Textarea 
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Írd meg az üzenetet..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Címzettek</Label>
                      <Select value={messageTarget} onValueChange={setMessageTarget}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Minden tag</SelectItem>
                          <SelectItem value="active">Aktív tagok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <Switch checked={sendNotification} onCheckedChange={setSendNotification} />
                        <Label>App értesítés</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
                        <Label>Email</Label>
                      </div>
                    </div>
                    <Button onClick={sendMessage} disabled={!messageTitle || !messageContent}>
                      <Send className="h-4 w-4 mr-2" />
                      Küldés
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6 space-y-6">
                <Card className="bg-card/30 backdrop-blur border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Projekt beállítások</CardTitle>
                    <CardDescription>A projekt alapvető információi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Projekt neve *</Label>
                        <Input 
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Régió</Label>
                        <Input 
                          value={regionName}
                          onChange={(e) => setRegionName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Leírás</Label>
                      <Textarea 
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label>Publikus projekt</Label>
                    </div>
                    <Button onClick={saveSettings}>
                      Mentés
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive">Veszélyzóna</CardTitle>
                    <CardDescription>Visszafordíthatatlan műveletek</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          Projekt deaktiválása
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Biztosan deaktiválod a projektet?</AlertDialogTitle>
                          <AlertDialogDescription>
                            A projekt és minden adata megmarad, de a felhasználók nem férhetnek hozzá.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Mégsem</AlertDialogCancel>
                          <AlertDialogAction onClick={deactivateProject}>
                            Deaktiválás
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      {/* Program Creator Modal */}
      <Dialog open={showProgramCreator} onOpenChange={setShowProgramCreator}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Új program létrehozása</DialogTitle>
          </DialogHeader>
          <ProgramCreator 
            defaultProjectId={project?.id || null}
            onSuccess={() => {
              setShowProgramCreator(false);
              loadPrograms();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Program Editor Modal */}
      <Dialog open={!!showProgramEditor} onOpenChange={(open) => {
        if (!open) setShowProgramEditor(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Program szerkesztése</DialogTitle>
          </DialogHeader>
          {showProgramEditor && (
            <ProgramEditor 
              programId={showProgramEditor}
              onSuccess={async () => {
                // Close modal first
                setShowProgramEditor(null);
                // Clear programs to force re-render
                setPrograms([]);
                // Reload from database
                await loadPrograms();
                // Increment refresh key to force useMemo recalculation
                setProgramsRefreshKey(prev => prev + 1);
                toast({ title: t('project_admin.success'), description: t('project_admin.program_updated') });
              }}
              onCancel={() => setShowProgramEditor(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Program Detail Modal */}
      <Dialog open={!!showProgramDetail} onOpenChange={() => setShowProgramDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{showProgramDetail?.title}</DialogTitle>
          </DialogHeader>
          {showProgramDetail && (
            <div className="space-y-4">
              {showProgramDetail.image_url && (
                <img 
                  src={showProgramDetail.image_url} 
                  alt={showProgramDetail.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <p className="text-muted-foreground">{showProgramDetail.description}</p>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Résztvevők</p>
                  <p className="font-semibold">{showProgramDetail.participant_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teljesítési ráta</p>
                  <p className="font-semibold">{showProgramDetail.completion_rate || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pontok</p>
                  <p className="font-semibold">{showProgramDetail.points_base}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  setShowProgramDetail(null);
                  setShowProgramEditor(showProgramDetail.id);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Szerkesztés
                </Button>
                <Button variant="outline" onClick={() => toggleProgramActive(showProgramDetail)}>
                  <Power className="h-4 w-4 mr-2" />
                  {showProgramDetail.is_active ? "Deaktiválás" : "Aktiválás"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Member Remove Confirmation */}
      <AlertDialog open={!!showMemberRemove} onOpenChange={() => setShowMemberRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tag eltávolítása</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan eltávolítod {showMemberRemove?.profile.first_name} {showMemberRemove?.profile.last_name} tagot a projektből?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégsem</AlertDialogCancel>
            <AlertDialogAction onClick={() => showMemberRemove && removeMember(showMemberRemove)}>
              Eltávolítás
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Üzenet küldése</DialogTitle>
            <DialogDescription>Küldj értesítést a projekt tagjainak</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Üzenet címe</Label>
              <Input 
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="Üzenet címe..."
              />
            </div>
            <div className="space-y-2">
              <Label>Üzenet tartalma</Label>
              <Textarea 
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Írd meg az üzenetet..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Címzettek</Label>
              <Select value={messageTarget} onValueChange={setMessageTarget}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Minden tag</SelectItem>
                  <SelectItem value="active">Aktív tagok</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageModal(false)}>
              Mégsem
            </Button>
            <Button onClick={sendMessage} disabled={!messageTitle || !messageContent}>
              <Send className="h-4 w-4 mr-2" />
              Küldés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
