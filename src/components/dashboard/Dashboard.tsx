import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Leaf, 
  Zap, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  Building,
  TreePine,
  Recycle,
  Car,
  Home
} from "lucide-react";

type UserRole = "citizen" | "business" | "government" | "ngo";

interface DashboardProps {
  userRole: UserRole;
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Mock data - will be replaced with real data from Supabase
  const citizenData = {
    personalStats: {
      co2Reduced: 156.8,
      pointsEarned: 2847,
      challengesCompleted: 8,
      streakDays: 23
    },
    monthlyProgress: [
      { month: "Jan", co2: 45.2, points: 650 },
      { month: "Feb", co2: 52.1, points: 780 },
      { month: "Mar", co2: 59.5, points: 890 },
    ],
    categoryBreakdown: [
      { name: "Energy", value: 35, color: "#FEF08A" },
      { name: "Transport", value: 28, color: "#A7F3D0" },
      { name: "Waste", value: 22, color: "#BFDBFE" },
      { name: "Food", value: 15, color: "#DDD6FE" }
    ],
    activeChallenges: [
      {
        id: "1",
        title: "Green Energy Switch",
        progress: 65,
        dueDate: "Mar 30",
        category: "energy"
      },
      {
        id: "2", 
        title: "Sustainable Transport Week",
        progress: 40,
        dueDate: "Mar 25",
        category: "transport"
      }
    ]
  };

  const businessData = {
    companyStats: {
      employeesEngaged: 847,
      co2Reduced: 2456.7,
      costsReduced: 18500,
      sustainabilityScore: 78
    },
    departmentProgress: [
      { department: "HR", score: 85, employees: 45 },
      { department: "IT", score: 72, employees: 120 },
      { department: "Marketing", score: 68, employees: 35 },
      { department: "Operations", score: 81, employees: 200 },
    ],
    initiatives: [
      {
        id: "1",
        title: "Office Energy Optimization",
        participants: 245,
        savings: 12500,
        status: "active"
      },
      {
        id: "2",
        title: "Remote Work Fridays",
        participants: 180,
        savings: 6000,
        status: "planning"
      }
    ]
  };

  const renderCitizenDashboard = () => (
    <div className="space-y-6">
      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">CO₂ Reduced</p>
                <p className="text-2xl font-bold">{citizenData.personalStats.co2Reduced}kg</p>
              </div>
              <Leaf className="w-8 h-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Points Earned</p>
                <p className="text-2xl font-bold">{citizenData.personalStats.pointsEarned.toLocaleString()}</p>
              </div>
              <Award className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Challenges Completed</p>
                <p className="text-2xl font-bold">{citizenData.personalStats.challengesCompleted}</p>
              </div>
              <Target className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Current Streak</p>
                <p className="text-2xl font-bold">{citizenData.personalStats.streakDays} days</p>
              </div>
              <Zap className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attractive Progress Chart */}
        <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Monthly Progress</span>
            </CardTitle>
            <CardDescription>Your sustainability impact journey</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={citizenData.monthlyProgress}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="co2" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  fill="url(#progressGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Impact by Category</CardTitle>
            <CardDescription>Where you're making the biggest difference</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={citizenData.categoryBreakdown}
                  cx="50%"
                  cy="50%" 
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                >
                  {citizenData.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>Active Challenges</CardTitle>
          <CardDescription>Your current sustainability challenges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {citizenData.activeChallenges.map((challenge) => (
            <div key={challenge.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{challenge.title}</h4>
                <div className="flex items-center space-x-4 mt-2">
                  <Progress value={challenge.progress} className="flex-1" />
                  <span className="text-sm text-muted-foreground">{challenge.progress}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Due: {challenge.dueDate}</p>
              </div>
              <Button variant="outline" size="sm">Continue</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderBusinessDashboard = () => (
    <div className="space-y-6">
      {/* Business Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary text-primary-foreground border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Employees Engaged</p>
                <p className="text-2xl font-bold">{businessData.companyStats.employeesEngaged}</p>
              </div>
              <Users className="w-8 h-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">CO₂ Reduced</p>
                <p className="text-2xl font-bold">{businessData.companyStats.co2Reduced}kg</p>
              </div>
              <TreePine className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Costs Reduced</p>
                <p className="text-2xl font-bold">${businessData.companyStats.costsReduced.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Sustainability Score</p>
                <p className="text-2xl font-bold">{businessData.companyStats.sustainabilityScore}/100</p>
              </div>
              <Award className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Sustainability scores by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={businessData.departmentProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Company Initiatives */}
        <Card>
          <CardHeader>
            <CardTitle>Active Initiatives</CardTitle>
            <CardDescription>Company-wide sustainability programs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {businessData.initiatives.map((initiative) => (
              <div key={initiative.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{initiative.title}</h4>
                  <p className="text-sm text-muted-foreground">{initiative.participants} participants</p>
                  <p className="text-sm text-success">${initiative.savings.toLocaleString()} saved</p>
                </div>
                <Badge variant={initiative.status === "active" ? "default" : "secondary"}>
                  {initiative.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderGovernmentDashboard = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Government Dashboard</h3>
          <p className="text-muted-foreground mb-4">
            Policy impact tracking, city-wide metrics, and community engagement analytics
          </p>
          <Badge className="bg-accent text-accent-foreground">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );

  const renderNGODashboard = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">NGO Dashboard</h3>
          <p className="text-muted-foreground mb-4">
            Community outreach metrics, volunteer coordination, and impact measurement
          </p>
          <Badge className="bg-success text-success-foreground">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );

  const getDashboardContent = () => {
    switch (userRole) {
      case "citizen":
        return renderCitizenDashboard();
      case "business":
        return renderBusinessDashboard();
      case "government":
        return renderGovernmentDashboard();
      case "ngo":
        return renderNGODashboard();
      default:
        return renderCitizenDashboard();
    }
  };

  const getRoleExplanation = () => {
    switch (userRole) {
      case "citizen":
        return {
          title: "Personal Dashboard",
          description: "Track your individual sustainability impact and progress",
          badge: "Your Personal View",
          badgeColor: "bg-primary"
        };
      case "business":
        return {
          title: "Business Dashboard", 
          description: "See how businesses in your area are contributing to sustainability",
          badge: "Business Perspective",
          badgeColor: "bg-accent"
        };
      case "government":
        return {
          title: "Government Dashboard",
          description: "Municipal and policy-level sustainability initiatives",
          badge: "Government View",
          badgeColor: "bg-warning"
        };
      case "ngo":
        return {
          title: "NGO Dashboard", 
          description: "Community organizations working for environmental change",
          badge: "NGO Perspective",
          badgeColor: "bg-success"
        };
      default:
        return {
          title: "Dashboard",
          description: "Sustainability tracking and progress",
          badge: "Default View",
          badgeColor: "bg-muted"
        };
    }
  };

  const roleInfo = getRoleExplanation();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">
            {roleInfo.title}
          </h1>
          <Badge className={`${roleInfo.badgeColor} text-white px-4 py-2`}>
            {roleInfo.badge}
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          {roleInfo.description}
        </p>
      </div>

      {/* Time Period Selector */}
      {(userRole === "citizen" || userRole === "business") && (
        <div className="flex space-x-2 mb-6">
          <Button
            variant={selectedPeriod === "week" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("week")}
            size="sm"
          >
            Week
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("month")}
            size="sm"
          >
            Month
          </Button>
          <Button
            variant={selectedPeriod === "year" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("year")}
            size="sm"
          >
            Year
          </Button>
        </div>
      )}

      {getDashboardContent()}
    </div>
  );
};

export default Dashboard;