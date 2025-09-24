import Navigation from "@/components/Navigation";

const Community = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Hub</h1>
          <p className="text-gray-600">Connect, share, and collaborate with sustainability champions worldwide</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Community Forum */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Discussions</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-emerald-600">SC</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Best practices for office energy reduction</h3>
                      <p className="text-sm text-gray-500 mb-2">Started by Sarah Chen • Business</p>
                      <p className="text-gray-600 text-sm">Looking for practical tips to reduce our office energy consumption by 30%...</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-xs text-gray-500">12 replies</span>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">MR</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Community garden project success!</h3>
                      <p className="text-sm text-gray-500 mb-2">Started by Mike Rodriguez • Municipal</p>
                      <p className="text-gray-600 text-sm">Our city just completed the largest community garden project, wanted to share...</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-xs text-gray-500">8 replies</span>
                        <span className="text-xs text-gray-500">5 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-purple-600">EJ</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Sustainable transport alternatives</h3>
                      <p className="text-sm text-gray-500 mb-2">Started by Emma Johnson • Citizen</p>
                      <p className="text-gray-600 text-sm">Exploring different ways to reduce car dependency in rural areas...</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-xs text-gray-500">15 replies</span>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Stories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Success Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                  <h3 className="font-semibold text-emerald-900 mb-2">Zero Waste Office Achievement</h3>
                  <p className="text-sm text-emerald-700 mb-3">TechCorp reduced office waste by 95% in 6 months</p>
                  <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">Business</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <h3 className="font-semibold text-blue-900 mb-2">Community Solar Initiative</h3>
                  <p className="text-sm text-blue-700 mb-3">GreenFuture NGO powered 200 homes with solar</p>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">NGO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Community Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Members</span>
                  <span className="font-semibold">12,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Challenges Completed</span>
                  <span className="font-semibold">45,293</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CO2 Saved (tons)</span>
                  <span className="font-semibold">2,156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cities Participating</span>
                  <span className="font-semibold">89</span>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Contributors</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🥇</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Lisa Wang</p>
                    <p className="text-xs text-gray-500">2,450 points</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🥈</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">David Kim</p>
                    <p className="text-xs text-gray-500">2,180 points</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🥉</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Team EcoTech</p>
                    <p className="text-xs text-gray-500">1,920 points</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Start New Discussion
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Share Success Story
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Find Local Groups
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;