import Navigation from "@/components/Navigation";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your sustainability progress and impact</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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