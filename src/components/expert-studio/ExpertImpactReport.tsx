import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  HandCoins,
  Gift,
  BarChart3,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface ImpactMetrics {
  extraReachPercentage: number;
  totalSponsorContribution: number;
  newSponsoredMembers: number;
  organicSales: number;
  sponsoredSales: number;
  topSponsor: { name: string; contribution: number } | null;
  monthlyTrend: { month: string; organic: number; sponsored: number }[];
}

interface ExpertImpactReportProps {
  userId: string;
}

const ExpertImpactReport = ({ userId }: ExpertImpactReportProps) => {
  const { t, language } = useLanguage();
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImpactData();
  }, [userId]);

  const loadImpactData = async () => {
    setLoading(true);
    try {
      // Get expert's content IDs
      const { data: contents } = await supabase
        .from("expert_contents")
        .select("id, title, price_huf")
        .eq("creator_id", userId);

      if (!contents || contents.length === 0) {
        setMetrics({
          extraReachPercentage: 0,
          totalSponsorContribution: 0,
          newSponsoredMembers: 0,
          organicSales: 0,
          sponsoredSales: 0,
          topSponsor: null,
          monthlyTrend: [],
        });
        setLoading(false);
        return;
      }

      const contentIds = contents.map((c) => c.id);

      // Fetch transactions for this expert's programs
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("creator_id", userId)
        .eq("status", "completed");

      // Fetch content access records to count unique members
      const { data: accessRecords } = await supabase
        .from("content_access")
        .select("user_id, access_type, sponsorship_id")
        .in("content_id", contentIds);

      // Calculate metrics
      const sponsoredTransactions = transactions?.filter(
        (t) => t.sponsor_payment_amount && t.sponsor_payment_amount > 0
      ) || [];
      const organicTransactions = transactions?.filter(
        (t) => !t.sponsor_payment_amount || t.sponsor_payment_amount === 0
      ) || [];

      const totalSponsorContribution = sponsoredTransactions.reduce(
        (sum, t) => sum + (t.sponsor_payment_amount || 0),
        0
      );

      const sponsoredSales = sponsoredTransactions.length;
      const organicSales = organicTransactions.length;
      const totalSales = sponsoredSales + organicSales;

      // Extra reach: what percentage of sales came through sponsorship
      const extraReachPercentage = totalSales > 0 
        ? Math.round((sponsoredSales / totalSales) * 100) 
        : 0;

      // Count unique sponsored members
      const sponsoredMembers = new Set(
        accessRecords
          ?.filter((a) => a.access_type === "sponsored" || a.sponsorship_id)
          .map((a) => a.user_id)
      );

      // Group by sponsor to find top sponsor
      const sponsorContributions: Record<string, number> = {};
      for (const tx of sponsoredTransactions) {
        if (tx.sponsor_id) {
          sponsorContributions[tx.sponsor_id] = 
            (sponsorContributions[tx.sponsor_id] || 0) + (tx.sponsor_payment_amount || 0);
        }
      }

      let topSponsor: { name: string; contribution: number } | null = null;
      const topSponsorId = Object.entries(sponsorContributions)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

      if (topSponsorId) {
        const { data: sponsorProfile } = await supabase
          .from("profiles")
          .select("first_name, last_name, organization")
          .eq("id", topSponsorId)
          .single();

        if (sponsorProfile) {
          topSponsor = {
            name: sponsorProfile.organization || 
              `${sponsorProfile.first_name || ""} ${sponsorProfile.last_name || ""}`.trim() ||
              "Szponzor",
            contribution: sponsorContributions[topSponsorId],
          };
        }
      }

      // Generate monthly trend data (last 6 months)
      const now = new Date();
      const monthlyTrend: { month: string; organic: number; sponsored: number }[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString(language === "hu" ? "hu-HU" : "en-US", {
          month: "short",
        });
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthSponsored = sponsoredTransactions.filter((t) => {
          const txDate = new Date(t.created_at);
          return txDate >= startOfMonth && txDate <= endOfMonth;
        }).length;

        const monthOrganic = organicTransactions.filter((t) => {
          const txDate = new Date(t.created_at);
          return txDate >= startOfMonth && txDate <= endOfMonth;
        }).length;

        monthlyTrend.push({
          month: monthName,
          organic: monthOrganic,
          sponsored: monthSponsored,
        });
      }

      setMetrics({
        extraReachPercentage,
        totalSponsorContribution,
        newSponsoredMembers: sponsoredMembers.size,
        organicSales,
        sponsoredSales,
        topSponsor,
        monthlyTrend,
      });
    } catch (error) {
      console.error("Error loading impact data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("hu-HU", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount) + " Ft";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nem sikerült betölteni az adatokat.
      </div>
    );
  }

  const pieData = [
    { name: "Organikus eladások", value: metrics.organicSales, color: "hsl(var(--primary))" },
    { name: "Szponzorált eladások", value: metrics.sponsoredSales, color: "hsl(142 76% 36%)" },
  ].filter((d) => d.value > 0);

  const COLORS = ["hsl(var(--primary))", "hsl(142 76% 36%)"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Hatásjelentés</h2>
          <p className="text-sm text-muted-foreground">
            A szponzori támogatások hatása az elérésedre
          </p>
        </div>
      </div>

      {/* Top Sponsor Message */}
      {metrics.topSponsor && metrics.extraReachPercentage > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <p className="text-emerald-800 font-medium">
              A <strong>{metrics.topSponsor.name}</strong> támogatása miatt{" "}
              <strong>{metrics.extraReachPercentage}%</strong>-kal több Taghoz jutottál el.
            </p>
          </div>
        </motion.div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Extra Reach */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-[0.5px] border-black/5 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Extra Elérés</p>
                  <p className="text-3xl font-bold text-foreground">
                    +{metrics.extraReachPercentage}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    szponzoráció által generált növekedés
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sponsor Contribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-[0.5px] border-black/5 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Szponzori Hozzájárulás</p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(metrics.totalSponsorContribution)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    összes szponzori támogatás
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10">
                  <HandCoins className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* New Sponsored Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-[0.5px] border-black/5 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Új Közösségi Tagok</p>
                  <p className="text-3xl font-bold text-foreground">
                    {metrics.newSponsoredMembers}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    szponzorált programokon keresztül
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-[0.5px] border-black/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                Havi eladások trendje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.monthlyTrend.some((m) => m.organic > 0 || m.sponsored > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={metrics.monthlyTrend} barGap={0}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar 
                      dataKey="organic" 
                      name="Organikus" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="sponsored" 
                      name="Szponzorált" 
                      fill="hsl(142 76% 36%)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Gift className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Még nincsenek eladási adatok</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart - Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-[0.5px] border-black/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Eladások megoszlása
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }: any) => 
                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value} db`, ""]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Gift className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Még nincsenek eladási adatok</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-[0.5px] border-black/5 shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.organicSales}</p>
                <p className="text-xs text-muted-foreground">Organikus eladás</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{metrics.sponsoredSales}</p>
                <p className="text-xs text-muted-foreground">Szponzorált eladás</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.organicSales + metrics.sponsoredSales}
                </p>
                <p className="text-xs text-muted-foreground">Összes eladás</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.newSponsoredMembers}
                </p>
                <p className="text-xs text-muted-foreground">Új Tag</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ExpertImpactReport;
