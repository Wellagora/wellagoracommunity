import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  ArrowLeft,
  Search,
  UserCheck,
  UserX,
  Calendar,
  Ticket,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { toast } from "sonner";

interface Participant {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
  voucher_code: string | null;
  status: string;
  event_date: string | null;
  created_at: string;
  is_no_show: boolean;
  redeemed_at: string | null;
  source: "voucher" | "transaction";
}

const ProgramParticipantsPage = () => {
  const { id: programId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "no_show" | "redeemed">("all");

  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  // Fetch program details
  const { data: program, isLoading: programLoading } = useQuery({
    queryKey: ["program-detail", programId],
    queryFn: async () => {
      if (!programId) throw new Error("No program ID");
      const { data, error } = await supabase
        .from("expert_contents")
        .select("id, title, image_url, max_capacity, used_licenses, total_licenses, content_type, is_published")
        .eq("id", programId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!programId,
  });

  // Fetch participants from vouchers + transactions
  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ["program-participants", programId],
    queryFn: async () => {
      if (!programId) throw new Error("No program ID");
      const result: Participant[] = [];

      // 1. Fetch voucher-based participants
      const { data: vouchers, error: vError } = await supabase
        .from("vouchers")
        .select("id, user_id, code, status, event_date, created_at, is_no_show, redeemed_at")
        .eq("content_id", programId)
        .order("created_at", { ascending: false });

      if (vError) throw vError;

      // 2. Fetch transaction-based participants (who bought directly)
      const { data: transactions, error: tError } = await supabase
        .from("transactions")
        .select("id, buyer_id, created_at, status")
        .eq("content_id", programId)
        .eq("status", "completed");

      if (tError) throw tError;

      // Collect all user IDs
      const userIds = new Set<string>();
      vouchers?.forEach((v) => userIds.add(v.user_id));
      transactions?.forEach((t) => {
        if (t.buyer_id) userIds.add(t.buyer_id);
      });

      // Fetch profiles
      let profileMap = new Map<string, { first_name: string | null; last_name: string | null; avatar_url: string | null; email: string | null }>();
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_url, email")
          .in("id", Array.from(userIds));

        profiles?.forEach((p) => {
          profileMap.set(p.id, { first_name: p.first_name, last_name: p.last_name, avatar_url: p.avatar_url, email: p.email });
        });
      }

      // Map vouchers to participants
      const voucherUserIds = new Set<string>();
      vouchers?.forEach((v) => {
        voucherUserIds.add(v.user_id);
        const profile = profileMap.get(v.user_id);
        result.push({
          id: v.id,
          user_id: v.user_id,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          avatar_url: profile?.avatar_url || null,
          email: profile?.email || null,
          voucher_code: v.code,
          status: v.status || "active",
          event_date: v.event_date,
          created_at: v.created_at || "",
          is_no_show: v.is_no_show || false,
          redeemed_at: v.redeemed_at,
          source: "voucher",
        });
      });

      // Map transactions to participants (only if not already in vouchers)
      transactions?.forEach((tx) => {
        if (tx.buyer_id && !voucherUserIds.has(tx.buyer_id)) {
          const profile = profileMap.get(tx.buyer_id);
          result.push({
            id: tx.id,
            user_id: tx.buyer_id,
            first_name: profile?.first_name || null,
            last_name: profile?.last_name || null,
            avatar_url: profile?.avatar_url || null,
            email: profile?.email || null,
            voucher_code: null,
            status: "active",
            event_date: null,
            created_at: tx.created_at,
            is_no_show: false,
            redeemed_at: null,
            source: "transaction",
          });
        }
      });

      return result;
    },
    enabled: !!programId,
  });

  // Mark attendance mutation
  const attendanceMutation = useMutation({
    mutationFn: async ({ participantId, isNoShow }: { participantId: string; isNoShow: boolean }) => {
      const { error } = await supabase
        .from("vouchers")
        .update({
          is_no_show: isNoShow,
          no_show_at: isNoShow ? new Date().toISOString() : null,
          redeemed_at: !isNoShow ? new Date().toISOString() : null,
        })
        .eq("id", participantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-participants", programId] });
      toast.success(t("participants.attendance_updated") || "Jelenlét frissítve");
    },
    onError: () => {
      toast.error(t("participants.attendance_error") || "Hiba a jelenlét frissítésekor");
    },
  });

  // Filter participants
  const filteredParticipants = (participants || []).filter((p) => {
    // Search filter
    if (searchQuery) {
      const name = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
      const email = (p.email || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      if (!name.includes(query) && !email.includes(query) && !(p.voucher_code || "").toLowerCase().includes(query)) {
        return false;
      }
    }
    // Status filter
    if (statusFilter === "active" && (p.is_no_show || p.redeemed_at)) return false;
    if (statusFilter === "no_show" && !p.is_no_show) return false;
    if (statusFilter === "redeemed" && !p.redeemed_at) return false;
    return true;
  });

  // Stats
  const totalParticipants = participants?.length || 0;
  const attendedCount = participants?.filter((p) => p.redeemed_at && !p.is_no_show).length || 0;
  const noShowCount = participants?.filter((p) => p.is_no_show).length || 0;
  const capacity = program?.max_capacity || program?.total_licenses || 0;
  const fillRate = capacity > 0 ? Math.round((totalParticipants / capacity) * 100) : 0;

  // Export CSV
  const handleExportCSV = () => {
    if (!participants || participants.length === 0) return;
    const headers = ["Név", "Email", "Voucher kód", "Státusz", "Regisztráció", "Jelenlét"];
    const rows = participants.map((p) => [
      `${p.first_name || ""} ${p.last_name || ""}`.trim(),
      p.email || "",
      p.voucher_code || "-",
      p.is_no_show ? "No-show" : p.redeemed_at ? "Megjelent" : "Regisztrált",
      p.created_at ? format(new Date(p.created_at), "yyyy-MM-dd") : "",
      p.redeemed_at ? format(new Date(p.redeemed_at), "yyyy-MM-dd HH:mm") : "-",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants-${programId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("participants.exported") || "CSV exportálva");
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${(firstName || "?")[0]}${(lastName || "")[0] || ""}`.toUpperCase();
  };

  const getStatusBadge = (p: Participant) => {
    if (p.is_no_show) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          No-show
        </Badge>
      );
    }
    if (p.redeemed_at) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {t("participants.attended") || "Megjelent"}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="w-3 h-3" />
        {t("participants.registered") || "Regisztrált"}
      </Badge>
    );
  };

  const isLoading = programLoading || participantsLoading;

  return (
    <DashboardLayout
      title={program?.title || t("participants.title") || "Résztvevők"}
      subtitle={t("participants.subtitle") || "Résztvevők kezelése"}
      icon={Users}
      iconColor="text-indigo-600"
      backUrl="/expert-studio"
    >
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-2">
        <ArrowLeft className="w-4 h-4" />
        {t("common.back") || "Vissza"}
      </Button>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                <p className="text-2xl font-bold">{totalParticipants}</p>
                <p className="text-xs text-muted-foreground">{t("participants.total") || "Összesen"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <UserCheck className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <p className="text-2xl font-bold">{attendedCount}</p>
                <p className="text-xs text-muted-foreground">{t("participants.attended") || "Megjelent"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <UserX className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{noShowCount}</p>
                <p className="text-xs text-muted-foreground">No-show</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Ticket className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">{fillRate}%</p>
                <p className="text-xs text-muted-foreground">{t("participants.fill_rate") || "Kapacitás"}</p>
                {capacity > 0 && (
                  <Progress value={Math.min(fillRate, 100)} className="mt-2 h-1.5" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Participants List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t("participants.list") || "Résztvevők listája"}
                  </CardTitle>
                  <CardDescription>
                    {totalParticipants} {t("participants.registered_total") || "regisztrált résztvevő"}
                    {capacity > 0 && ` / ${capacity} ${t("participants.capacity") || "hely"}`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={totalParticipants === 0} className="gap-2">
                    <Download className="w-4 h-4" />
                    CSV
                  </Button>
                </div>
              </div>

              {/* Search + Filter */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("participants.search_placeholder") || "Keresés név, email vagy voucher kód alapján..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      {statusFilter === "all" && (t("participants.filter_all") || "Mind")}
                      {statusFilter === "active" && (t("participants.filter_registered") || "Regisztrált")}
                      {statusFilter === "redeemed" && (t("participants.filter_attended") || "Megjelent")}
                      {statusFilter === "no_show" && "No-show"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      {t("participants.filter_all") || "Mind"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                      {t("participants.filter_registered") || "Regisztrált"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("redeemed")}>
                      {t("participants.filter_attended") || "Megjelent"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("no_show")}>
                      No-show
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              {filteredParticipants.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery
                      ? t("participants.no_results") || "Nincs találat"
                      : t("participants.no_participants") || "Még nincs résztvevő"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? t("participants.try_different_search") || "Próbálj más keresőkifejezést"
                      : t("participants.no_participants_hint") || "A jelentkezők itt fognak megjelenni"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      {/* Avatar */}
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        {participant.avatar_url && <AvatarImage src={participant.avatar_url} />}
                        <AvatarFallback className="text-xs">
                          {getInitials(participant.first_name, participant.last_name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name & Email */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {participant.first_name || ""} {participant.last_name || ""}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {participant.email || "—"}
                        </p>
                      </div>

                      {/* Voucher code */}
                      {participant.voucher_code && (
                        <div className="hidden sm:block">
                          <Badge variant="outline" className="text-xs font-mono">
                            <Ticket className="w-3 h-3 mr-1" />
                            {participant.voucher_code}
                          </Badge>
                        </div>
                      )}

                      {/* Date */}
                      <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {participant.created_at
                          ? format(new Date(participant.created_at), "MMM d, yyyy", { locale: dateLocale })
                          : "—"}
                      </div>

                      {/* Status badge */}
                      {getStatusBadge(participant)}

                      {/* Attendance actions (only for voucher-based participants) */}
                      {participant.source === "voucher" && (
                        <div className="flex gap-1">
                          <Button
                            variant={participant.redeemed_at && !participant.is_no_show ? "default" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            title={t("participants.mark_attended") || "Megjelent"}
                            onClick={() =>
                              attendanceMutation.mutate({
                                participantId: participant.id,
                                isNoShow: false,
                              })
                            }
                            disabled={attendanceMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </Button>
                          <Button
                            variant={participant.is_no_show ? "destructive" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            title={t("participants.mark_no_show") || "No-show"}
                            onClick={() =>
                              attendanceMutation.mutate({
                                participantId: participant.id,
                                isNoShow: true,
                              })
                            }
                            disabled={attendanceMutation.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProgramParticipantsPage;
