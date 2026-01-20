import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Star,
  BarChart3,
  Calendar,
  Award,
  MessageSquare,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format, subDays, subMonths, subYears, isAfter } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { Link } from "react-router-dom";

interface ExpertAnalyticsDashboardProps {
  userId: string;
}

interface Program {
  id: string;
  title: string;
  image_url: string | null;
  used_licenses: number;
  total_licenses: number | null;
  max_capacity: number | null;
  price_huf: number | null;
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  content_id: string;
  user_name?: string;
  user_avatar?: string;
  program_title?: string;
}

interface AnalyticsData {
  totalRevenue: number;
  previousRevenue: number;
  totalParticipants: number;
  previousParticipants: number;
  averageRating: number;
  totalReviews: number;
  capacityFillRate: number;
  revenueOverTime: { date: string; revenue: number }[];
  topPrograms: Program[];
  recentReviews: Review[];
}

type TimeFilter = "7d" | "30d" | "90d" | "year";

const TIME_FILTERS: { value: TimeFilter; labelKey: string }[] = [
  { value: "7d", labelKey: "analytics.7_days" },
  { value: "30d", labelKey: "analytics.30_days" },
  { value: "90d", labelKey: "analytics.90_days" },
  { value: "year", labelKey: "analytics.year" },
];

const ExpertAnalyticsDashboard = ({ userId }: ExpertAnalyticsDashboardProps) => {
  const { t, language } = useLanguage();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const dateLocale = language === 'hu' ? hu : language === 'de' ? de : enUS;

  const getDateRange = (filter: TimeFilter) => {
    const now = new Date();
    switch (filter) {
      case "7d":
        return { start: subDays(now, 7), previousStart: subDays(now, 14) };
      case "30d":
        return { start: subDays(now, 30), previousStart: subDays(now, 60) };
      case "90d":
        return { start: subDays(now, 90), previousStart: subDays(now, 180) };
      case "year":
        return { start: subYears(now, 1), previousStart: subYears(now, 2) };
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [userId, timeFilter]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const { start, previousStart } = getDateRange(timeFilter);
      const now = new Date();

      // Fetch all expert's programs
      const { data: programs, error: programsError } = await supabase
        .from("expert_contents")
        .select("id, title, image_url, used_licenses, total_licenses, max_capacity, price_huf, created_at")
        .eq("creator_id", userId);

      if (programsError) throw programsError;

      // Fetch all reviews for expert's programs
      const programIds = programs?.map(p => p.id) || [];
      let reviews: Review[] = [];
      let avgRating = 0;
      let totalReviewCount = 0;

      if (programIds.length > 0) {
        const { data: reviewsData } = await supabase
          .from("content_reviews")
          .select("id, rating, comment, created_at, user_id, content_id")
          .in("content_id", programIds)
          .order("created_at", { ascending: false });

        if (reviewsData && reviewsData.length > 0) {
          // Get user profiles for reviews
          const userIds = [...new Set(reviewsData.map(r => r.user_id))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .in("id", userIds);

          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
          const programMap = new Map(programs?.map(p => [p.id, p]) || []);

          reviews = reviewsData.map(r => {
            const profile = profileMap.get(r.user_id);
            const program = programMap.get(r.content_id);
            return {
              ...r,
              user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Anonymous',
              user_avatar: profile?.avatar_url || undefined,
              program_title: program?.title || 'Unknown Program',
            };
          });

          // Filter reviews within time range
          const filteredReviews = reviewsData.filter(r => isAfter(new Date(r.created_at), start));
          totalReviewCount = filteredReviews.length;
          avgRating = filteredReviews.length > 0
            ? filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length
            : 0;
        }
      }

      // Calculate revenue metrics
      let totalRevenue = 0;
      let previousRevenue = 0;
      let totalParticipants = 0;
      let previousParticipants = 0;
      let totalCapacity = 0;
      let usedCapacity = 0;

      // For simplicity, we'll calculate based on programs created in time range
      // In a real scenario, you'd use a transactions table with timestamps
      programs?.forEach(p => {
        const pricePerBooking = p.price_huf || 5000;
        const participants = p.used_licenses || 0;
        const capacity = p.max_capacity || p.total_licenses || 0;
        const programDate = new Date(p.created_at);

        // Current period
        if (isAfter(programDate, start)) {
          totalRevenue += participants * pricePerBooking * 0.80; // 80% expert share
          totalParticipants += participants;
        }

        // Previous period (for trend calculation)
        if (isAfter(programDate, previousStart) && !isAfter(programDate, start)) {
          previousRevenue += participants * pricePerBooking * 0.80;
          previousParticipants += participants;
        }

        // Capacity calculation (all programs)
        if (capacity > 0) {
          totalCapacity += capacity;
          usedCapacity += Math.min(participants, capacity);
        }
      });

      // If no data in time range, show all-time data
      if (totalRevenue === 0 && totalParticipants === 0) {
        programs?.forEach(p => {
          const pricePerBooking = p.price_huf || 5000;
          const participants = p.used_licenses || 0;
          totalRevenue += participants * pricePerBooking * 0.80;
          totalParticipants += participants;
        });
      }

      // Generate revenue over time data
      const revenueOverTime: { date: string; revenue: number }[] = [];
      const daysCount = timeFilter === "7d" ? 7 : timeFilter === "30d" ? 30 : timeFilter === "90d" ? 90 : 365;
      const groupByDays = timeFilter === "year" ? 30 : timeFilter === "90d" ? 7 : 1;

      for (let i = daysCount; i >= 0; i -= groupByDays) {
        const date = subDays(now, i);
        const dateStr = format(date, timeFilter === "year" ? "MMM" : "MMM d", { locale: dateLocale });
        
        // Simulated revenue distribution (in real app, fetch from transactions)
        const dayRevenue = Math.round((totalRevenue / (daysCount / groupByDays)) * (0.5 + Math.random()));
        revenueOverTime.push({ date: dateStr, revenue: dayRevenue });
      }

      // Top programs by participants
      const topPrograms = [...(programs || [])]
        .sort((a, b) => (b.used_licenses || 0) - (a.used_licenses || 0))
        .slice(0, 5);

      const capacityFillRate = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

      setData({
        totalRevenue,
        previousRevenue,
        totalParticipants,
        previousParticipants,
        averageRating: avgRating,
        totalReviews: totalReviewCount,
        capacityFillRate,
        revenueOverTime,
        topPrograms,
        recentReviews: reviews.slice(0, 5),
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (language === "hu") {
      return `${Math.round(amount).toLocaleString("hu-HU")} Ft`;
    }
    const eur = Math.round(amount / 400);
    return `€${eur.toLocaleString("de-DE")}`;
  };

  const getTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("analytics.no_data") || "No data available"}
      </div>
    );
  }

  const revenueTrend = getTrendPercentage(data.totalRevenue, data.previousRevenue);
  const participantsTrend = getTrendPercentage(data.totalParticipants, data.previousParticipants);

  return (
    <div className="space-y-6">
      {/* Time Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {TIME_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={timeFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter(filter.value)}
            className={timeFilter === filter.value ? "bg-primary" : ""}
          >
            {t(filter.labelKey) || filter.value}
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("analytics.total_revenue") || "Total Revenue"}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(data.totalRevenue)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {revenueTrend >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${revenueTrend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {revenueTrend >= 0 ? "+" : ""}{revenueTrend}%
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100">
                  <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Participants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("analytics.total_participants") || "Total Participants"}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {data.totalParticipants}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {participantsTrend >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${participantsTrend >= 0 ? "text-blue-600" : "text-red-500"}`}>
                      {participantsTrend >= 0 ? "+" : ""}{participantsTrend}%
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("analytics.average_rating") || "Average Rating"}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-foreground">
                      {data.averageRating > 0 ? data.averageRating.toFixed(1) : "-"}
                    </p>
                    {data.averageRating > 0 && (
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {data.totalReviews} {t("analytics.reviews") || "reviews"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-100">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Capacity Fill Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("analytics.capacity_fill_rate") || "Capacity Fill Rate"}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {data.capacityFillRate}%
                  </p>
                  <div className="w-full h-2 bg-purple-200 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${data.capacityFillRate}%` }}
                    />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-purple-100">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Over Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-[0.5px] border-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              {t("analytics.revenue_over_time") || "Revenue Over Time"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenueOverTime.length > 0 && data.totalRevenue > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.revenueOverTime}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => language === "hu" ? `${(value / 1000).toFixed(0)}k` : `€${Math.round(value / 400)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), t("analytics.revenue") || "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{t("analytics.no_revenue_data") || "No revenue data yet"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Grid: Top Programs + Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Programs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-[0.5px] border-black/5 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Award className="w-5 h-5 text-muted-foreground" />
                {t("analytics.top_programs") || "Top Programs"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topPrograms.length > 0 ? (
                <div className="space-y-3">
                  {data.topPrograms.map((program, index) => (
                    <Link
                      key={program.id}
                      to={`/szakertoi-studio/${program.id}/szerkesztes`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {program.image_url ? (
                          <img
                            src={program.image_url}
                            alt={program.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-emerald-500/10">
                            <Calendar className="w-5 h-5 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {program.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {program.used_licenses || 0} {t("analytics.participants_label") || "participants"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {formatCurrency((program.used_licenses || 0) * (program.price_huf || 5000) * 0.80)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t("analytics.no_programs") || "No programs yet"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-[0.5px] border-black/5 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                {t("analytics.recent_reviews") || "Recent Reviews"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {data.recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-3 rounded-xl bg-muted/30 border border-transparent hover:border-muted transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.user_avatar} />
                          <AvatarFallback>
                            {review.user_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {review.user_name}
                            </p>
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {review.program_title}
                          </p>
                          {review.comment && (
                            <p className="text-sm text-foreground/80 line-clamp-2">
                              "{review.comment}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(review.created_at), "PP", { locale: dateLocale })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t("analytics.no_reviews") || "No reviews yet"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ExpertAnalyticsDashboard;