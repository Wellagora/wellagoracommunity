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
      { name: "Energia", value: 28, color: "#FEF08A", icon: "⚡" },
      { name: "Közlekedés", value: 22, color: "#A7F3D0", icon: "🚲" },
      { name: "Hulladék", value: 18, color: "#BFDBFE", icon: "♻️" },
      { name: "Élelmiszer", value: 15, color: "#DDD6FE", icon: "🥬" },
      { name: "Víz", value: 10, color: "#FECACA", icon: "💧" },
      { name: "Otthon", value: 7, color: "#C7D2FE", icon: "🏠" }
    ],
    forestGrowth: {
      trees: 12,
      shrubs: 8,
      flowers: 15,
      totalCo2Absorbed: 156.8,
      monthlyGrowth: 2.3
    },
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
        {/* Forest Growth Visualization */}
        <Card className="bg-gradient-to-br from-success/5 via-card to-primary/5 border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TreePine className="w-5 h-5 text-success" />
              <span>Az Erdőm Növekedése</span>
            </CardTitle>
            <CardDescription>Fenntartható tevékenységeid virtuális erdőként</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Forest Visualization */}
              <div className="bg-gradient-to-b from-blue-100 to-green-200 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6 min-h-[200px] relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-300 to-transparent dark:from-green-800/40"></div>
                
                {/* Trees */}
                <div className="flex items-end justify-center space-x-2 h-40 relative z-10">
                  {Array.from({ length: citizenData.forestGrowth.trees }, (_, i) => (
                    <div key={`tree-${i}`} className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="text-2xl mb-1">🌲</div>
                    </div>
                  ))}
                  {Array.from({ length: citizenData.forestGrowth.shrubs }, (_, i) => (
                    <div key={`shrub-${i}`} className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${(i + 12) * 0.1}s` }}>
                      <div className="text-lg mb-1">🌿</div>
                    </div>
                  ))}
                  {Array.from({ length: Math.min(citizenData.forestGrowth.flowers, 8) }, (_, i) => (
                    <div key={`flower-${i}`} className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${(i + 20) * 0.1}s` }}>
                      <div className="text-sm mb-1">🌸</div>
                    </div>
                  ))}
                </div>
                
                {/* Growth Stats */}
                <div className="absolute top-4 right-4 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-lg p-3 space-y-1">
                  <div className="text-xs text-muted-foreground">Ez a hónap</div>
                  <div className="text-sm font-semibold text-success">+{citizenData.forestGrowth.monthlyGrowth} új növény</div>
                </div>
              </div>
              
              {/* Forest Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <div className="text-2xl mb-1">🌲</div>
                  <div className="font-semibold text-foreground">{citizenData.forestGrowth.trees}</div>
                  <div className="text-xs text-muted-foreground">Fa</div>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl mb-1">🌿</div>
                  <div className="font-semibold text-foreground">{citizenData.forestGrowth.shrubs}</div>
                  <div className="text-xs text-muted-foreground">Cserje</div>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl mb-1">🌸</div>
                  <div className="font-semibold text-foreground">{citizenData.forestGrowth.flowers}</div>
                  <div className="text-xs text-muted-foreground">Virág</div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Az erdőd összesen</div>
                <div className="text-lg font-bold text-success">{citizenData.forestGrowth.totalCo2Absorbed} kg CO₂</div>
                <div className="text-xs text-muted-foreground">elnyelését jelképezi</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Hatás Kategóriák Szerint</CardTitle>
            <CardDescription>Hol teszed a legnagyobb hatást</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Category List with Progress Bars */}
              {citizenData.categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="text-2xl">{category.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-foreground">{category.name}</span>
                      <span className="text-sm font-semibold text-foreground">{category.value}%</span>
                    </div>
                    <Progress value={category.value} className="h-2" />
                  </div>
                </div>
              ))}
              
              {/* Mini Pie Chart */}
              <div className="mt-6 flex justify-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={citizenData.categoryBreakdown}
                      cx="50%"
                      cy="50%" 
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {citizenData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
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
          title: "Személyes Dashboard",
          description: "Saját fenntarthatósági hatásod és fejlődésed nyomon követése",
          badge: "Személyes Nézet",
          badgeColor: "bg-primary",
          explanation: "Ez a te személyes dashboard-od, ahol láthatod saját környezetvédelmi tevékenységeidet és eredményeidet."
        };
      case "business":
        return {
          title: "Vállalati Dashboard", 
          description: "Hogyan járulnak hozzá a vállalkozások a fenntarthatósághoz a területeden",
          badge: "Vállalati Perspektíva",
          badgeColor: "bg-accent",
          explanation: "Itt láthatod, milyen fenntarthatósági kezdeményezések zajlanak a vállalati szektorban, és hogyan kapcsolódhatsz be mint magánszemély."
        };
      case "government":
        return {
          title: "Önkormányzati Dashboard",
          description: "Városi és politikai szintű fenntarthatósági kezdeményezések",
          badge: "Önkormányzati Nézet",
          badgeColor: "bg-warning",
          explanation: "Betekintés az önkormányzati környezetvédelmi programokba és azt, hogyan tudsz te mint állampolgár részt venni ezekben."
        };
      case "ngo":
        return {
          title: "NGO Dashboard", 
          description: "Környezetvédelmi civil szervezetek munkája",
          badge: "Civil Szervezetek",
          badgeColor: "bg-success",
          explanation: "Fedezd fel a civil szervezetek környezetvédelmi projektjeit és csatlakozz önkéntesként vagy támogatóként."
        };
      default:
        return {
          title: "Dashboard",
          description: "Fenntarthatóság követés és fejlődés",
          badge: "Alapértelmezett Nézet",
          badgeColor: "bg-muted",
          explanation: ""
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
        <p className="text-muted-foreground text-lg mb-4">
          {roleInfo.description}
        </p>
        
        {/* Role Explanation Card */}
        <Card className="bg-gradient-to-r from-card to-muted/20 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-success rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">🌍 Ökoszisztéma Nézet Koncepció</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  <strong>Miért ezt a nézetet látod?</strong> {roleInfo.explanation}
                </p>
                
                {/* Interactive Role Connections */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      {userRole === "citizen" ? "Te vagy itt" : "Magánszemélyek"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      {userRole === "business" ? "Te vagy itt" : "Vállalkozások"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      {userRole === "government" ? "Te vagy itt" : "Önkormányzat"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      {userRole === "ngo" ? "Te vagy itt" : "Civil szervezetek"}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-success/10 rounded-lg">
                  <div className="text-xs font-medium text-foreground mb-1">💡 Hasznos tudni:</div>
                  <div className="text-xs text-muted-foreground">
                    A különböző szerepeket kiválasztva láthatod, hogyan kapcsolódik össze a fenntarthatósági ökoszisztéma minden eleme.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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