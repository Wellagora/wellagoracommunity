import { useState } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import PointsSystem from "@/components/gamification/PointsSystem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Building2, 
  Landmark, 
  Users,
  BarChart3,
  Trophy
} from "lucide-react";

type UserRole = "citizen" | "business" | "government" | "ngo";

const DashboardPage = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>("citizen");

  const roles = [
    { 
      value: "citizen" as UserRole, 
      label: "Citizen", 
      icon: User, 
      color: "bg-primary",
      description: "Individual sustainability tracking"
    },
    { 
      value: "business" as UserRole, 
      label: "Business", 
      icon: Building2, 
      color: "bg-accent",
      description: "Corporate sustainability dashboard"
    },
    { 
      value: "government" as UserRole, 
      label: "Government", 
      icon: Landmark, 
      color: "bg-warning",
      description: "Policy and city-wide metrics"
    },
    { 
      value: "ngo" as UserRole, 
      label: "NGO", 
      icon: Users, 
      color: "bg-success",
      description: "Community impact tracking"
    }
  ];

  const getCurrentRoleData = () => {
    return roles.find(role => role.value === currentRole);
  };

  const roleData = getCurrentRoleData();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Role Selector */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Dashboard Type</h2>
                <p className="text-muted-foreground">Switch between different role perspectives</p>
              </div>
              <Badge className={`${roleData?.color} text-white`}>
                {roleData?.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <Button
                    key={role.value}
                    variant={currentRole === role.value ? "default" : "outline"}
                    onClick={() => setCurrentRole(role.value)}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <IconComponent className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">{role.label}</div>
                      <div className="text-xs opacity-70">{role.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Rewards & Points</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <Dashboard userRole={currentRole} />
          </TabsContent>

          <TabsContent value="rewards">
            {currentRole === "citizen" || currentRole === "business" ? (
              <PointsSystem />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Rewards System</h3>
                  <p className="text-muted-foreground mb-4">
                    Points and rewards system for {roleData?.label.toLowerCase()} accounts
                  </p>
                  <Badge className="bg-accent text-accent-foreground">Coming Soon</Badge>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;