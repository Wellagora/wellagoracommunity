import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Trophy, 
  Target,
  Leaf,
  Recycle,
  Car,
  Utensils,
  UsersIcon,
  Lightbulb,
  Droplets,
  TreePine,
  RotateCcw,
  DollarSign,
  Star,
  Loader2
} from "lucide-react";
import { challenges, Challenge } from "@/data/challenges";

const ChallengesPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>(challenges);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Filter challenges based on search and filters
  useEffect(() => {
    let filtered = challenges;

    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(challenge => challenge.category === selectedCategory);
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(challenge => challenge.difficulty === selectedDifficulty);
    }

    setFilteredChallenges(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const getCategoryIcon = (category: Challenge['category']) => {
    switch (category) {
      case "energy": return <Lightbulb className="w-5 h-5" />;
      case "transport": return <Car className="w-5 h-5" />;
      case "food": return <Utensils className="w-5 h-5" />;
      case "waste": return <Recycle className="w-5 h-5" />;
      case "community": return <UsersIcon className="w-5 h-5" />;
      case "innovation": return <Target className="w-5 h-5" />;
      case "water": return <Droplets className="w-5 h-5" />;
      case "biodiversity": return <TreePine className="w-5 h-5" />;
      case "circular-economy": return <RotateCcw className="w-5 h-5" />;
      case "green-finance": return <DollarSign className="w-5 h-5" />;
      default: return <Leaf className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 border-green-200";
      case "intermediate": return "bg-blue-100 text-blue-800 border-blue-200";
      case "advanced": return "bg-orange-100 text-orange-800 border-orange-200";
      case "expert": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: Challenge['category']) => {
    switch (category) {
      case "energy": return "bg-yellow-100 text-yellow-800";
      case "transport": return "bg-blue-100 text-blue-800";
      case "food": return "bg-green-100 text-green-800";
      case "waste": return "bg-purple-100 text-purple-800";
      case "community": return "bg-pink-100 text-pink-800";
      case "innovation": return "bg-indigo-100 text-indigo-800";
      case "water": return "bg-cyan-100 text-cyan-800";
      case "biodiversity": return "bg-emerald-100 text-emerald-800";
      case "circular-economy": return "bg-teal-100 text-teal-800";
      case "green-finance": return "bg-lime-100 text-lime-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-white">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Sustainability{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Challenges
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Join thousands of sustainability champions in taking action for our planet. 
            Complete challenges, earn points, and make a real environmental impact.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-2xl font-bold text-white">{challenges.length}</div>
              <div className="text-slate-300">Active Challenges</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-2xl font-bold text-white">
                {challenges.reduce((sum, c) => sum + c.participants, 0).toLocaleString()}
              </div>
              <div className="text-slate-300">Total Participants</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-2xl font-bold text-white">
                {Math.round(challenges.reduce((sum, c) => sum + c.completionRate, 0) / challenges.length)}%
              </div>
              <div className="text-slate-300">Avg Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-slate-400"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="waste">Waste</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="innovation">Innovation</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="biodiversity">Biodiversity</SelectItem>
                <SelectItem value="circular-economy">Circular Economy</SelectItem>
                <SelectItem value="green-finance">Green Finance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full lg:w-48 bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredChallenges.map((challenge) => (
            <Card key={challenge.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(challenge.category)}`}>
                    {getCategoryIcon(challenge.category)}
                  </div>
                  <Badge className={`${getDifficultyColor(challenge.difficulty)} text-xs font-medium`}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                
                <CardTitle className="text-white text-lg leading-tight mb-2">
                  {challenge.title}
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm leading-relaxed">
                  {challenge.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Challenge Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Clock className="w-4 h-4" />
                    <span>{challenge.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Trophy className="w-4 h-4" />
                    <span>{challenge.pointsReward} pts</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participants.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Target className="w-4 h-4" />
                    <span>{challenge.completionRate}% success</span>
                  </div>
                </div>

                {/* Environmental Impact */}
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="text-xs text-slate-400 mb-1">Environmental Impact</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">🌱 {challenge.impact.co2Saved}kg CO₂ saved</span>
                    <span className="text-green-400">🌳 {challenge.impact.treesEquivalent} trees equiv.</span>
                  </div>
                </div>

                {/* Participants Preview */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {challenge.participants_preview.slice(0, 3).map((participant) => (
                      <Avatar key={participant.id} className="w-6 h-6 border-2 border-white/20">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="text-xs">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {challenge.participants > 3 && (
                      <div className="w-6 h-6 rounded-full bg-white/20 border-2 border-white/20 flex items-center justify-center">
                        <span className="text-xs text-white">+</span>
                      </div>
                    )}
                  </div>
                  
                  {challenge.sponsor && (
                    <div className="text-xs text-slate-400">
                      Sponsored by {challenge.sponsor.name}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => navigate(`/challenges/${challenge.id}`)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold"
                >
                  Join Challenge
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No challenges found</h3>
            <p className="text-slate-300">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;