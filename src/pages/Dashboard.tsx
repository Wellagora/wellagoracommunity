import { Link, Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Edit3, Building2 } from "lucide-react";
import SponsorDashboardView from "@/components/dashboard/SponsorDashboardView";

// Loading skeleton for dashboard
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>
      
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl lg:col-span-2" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, profile, loading, activeView } = useAuth();
  const { t } = useLanguage();

  // Show loading skeleton while auth is loading
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show Sponsor Dashboard for sponsor view
  if (activeView === 'sponsor') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <SponsorDashboardView />
        </div>
      </div>
    );
  }

  // Default member view
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your sustainability progress and impact</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg">{t('organization.my_profile')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">
                    {profile?.first_name} {profile?.last_name}
                  </h3>
                  <p className="text-sm text-primary capitalize">
                    {profile?.user_role === 'citizen' ? t('organization.role_citizen') : 
                     profile?.user_role === 'business' ? t('organization.role_business') :
                     profile?.user_role === 'government' ? t('organization.role_government') :
                     profile?.user_role === 'ngo' ? t('organization.role_ngo') : profile?.user_role}
                  </p>
                  {profile?.organization && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Building2 className="w-3 h-3 mr-1" />
                      {profile.organization}
                    </div>
                  )}
                </div>
              </div>
              <Link to="/profile" className="block">
                <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                  <Edit3 className="w-4 h-4 mr-2" />
                  {t('organization.edit_profile')}
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Impact Overview */}
          <div className="lg:col-span-2 bg-card rounded-2xl shadow-sm border border-border p-6">
            <h2 className="text-xl font-bold text-card-foreground mb-4">Impact Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-success/10 p-4 rounded-xl border border-success/20">
                <h3 className="font-semibold text-success mb-2">Carbon Saved</h3>
                <p className="text-2xl font-bold text-success">2.4 tons</p>
              </div>
              <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                <h3 className="font-semibold text-primary mb-2">Challenges Completed</h3>
                <p className="text-2xl font-bold text-primary">12</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h2 className="text-xl font-bold text-card-foreground mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level</span>
                <span className="font-semibold text-foreground">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points</span>
                <span className="font-semibold text-foreground">1,250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Streak</span>
                <span className="font-semibold text-foreground">15 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-card rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-xl font-bold text-card-foreground mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                <span className="text-success">🌱</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Completed "Switch to LED Bulbs" challenge</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary">🚲</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Started "Bike to Work Week" challenge</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
