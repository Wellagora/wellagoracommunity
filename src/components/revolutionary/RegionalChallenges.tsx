import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  Sword, 
  Shield, 
  Users, 
  Building, 
  Leaf, 
  Zap,
  Crown,
  Star,
  Target,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Guild {
  id: string;
  name: string;
  type: 'business' | 'ngo' | 'citizen' | 'municipality';
  members: number;
  totalScore: number;
  avatar: string;
  color: string;
}

interface RegionalChallenge {
  id: string;
  name: string;
  description: string;
  goal: string;
  progress: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Boss';
  timeRemaining: string;
  reward: string;
  participants: number;
  co2Target: number;
  currentCo2: number;
  leaderboard: Guild[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlocked: boolean;
}

const RegionalChallenges: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<RegionalChallenge | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'upcoming'>('active');

  const mockGuilds: Guild[] = [
    {
      id: 'eco-businesses',
      name: 'Eco Businesses Alliance',
      type: 'business',
      members: 156,
      totalScore: 24650,
      avatar: '/placeholder-avatar.jpg',
      color: '#FB923C'
    },
    {
      id: 'green-warriors',
      name: 'Green Warriors NGO',
      type: 'ngo', 
      members: 89,
      totalScore: 18900,
      avatar: '/placeholder-avatar.jpg',
      color: '#10B981'
    },
    {
      id: 'citizen-champions',
      name: 'Citizen Champions',
      type: 'citizen',
      members: 342,
      totalScore: 16750,
      avatar: '/placeholder-avatar.jpg',
      color: '#8B5CF6'
    },
    {
      id: 'municipal-leaders',
      name: 'Municipal Leaders',
      type: 'municipality',
      members: 12,
      totalScore: 15200,
      avatar: '/placeholder-avatar.jpg',
      color: '#2563EB'
    }
  ];

  const mockChallenges: RegionalChallenge[] = [
    {
      id: 'vienna-co2-boss',
      name: 'Vienna CO₂ Boss Battle',
      description: 'Unite all stakeholders to reduce Vienna\'s CO₂ emissions by 15% this quarter',
      goal: 'Reduce 50,000kg CO₂ collectively across all sectors',
      progress: 67,
      difficulty: 'Boss',
      timeRemaining: '45 days',
      reward: '🏆 Regional Championship Badge + €50,000 Green Fund',
      participants: 599,
      co2Target: 50000,
      currentCo2: 33500,
      leaderboard: mockGuilds
    },
    {
      id: 'energy-efficiency',
      name: 'Smart Building Energy Challenge',
      description: 'Transform buildings into smart, energy-efficient spaces',
      goal: 'Achieve 30% energy reduction in participating buildings',
      progress: 42,
      difficulty: 'Hard',
      timeRemaining: '28 days', 
      reward: '⚡ Smart Building Certification',
      participants: 234,
      co2Target: 15000,
      currentCo2: 6300,
      leaderboard: mockGuilds.filter(g => g.type === 'business' || g.type === 'municipality')
    },
    {
      id: 'waste-warriors',
      name: 'Zero Waste District Initiative',
      description: 'Achieve zero waste in selected Vienna districts',
      goal: 'Reduce waste by 80% in target areas',
      progress: 78,
      difficulty: 'Medium',
      timeRemaining: '12 days',
      reward: '♻️ Circular Economy Pioneer Badge',
      participants: 187,
      co2Target: 8000,
      currentCo2: 6240,
      leaderboard: mockGuilds.filter(g => g.type === 'citizen' || g.type === 'ngo')
    }
  ];

  const mockAchievements: Achievement[] = [
    {
      id: 'first-victory',
      name: 'First Victory',
      description: 'Complete your first regional challenge',
      icon: '🎯',
      rarity: 'Common',
      unlocked: true
    },
    {
      id: 'team-player',
      name: 'Team Player',
      description: 'Participate in 5 collaborative challenges',
      icon: '🤝',
      rarity: 'Rare',
      unlocked: true
    },
    {
      id: 'boss-slayer',
      name: 'Boss Slayer',
      description: 'Defeat a regional boss challenge',
      icon: '⚔️',
      rarity: 'Epic',
      unlocked: false
    },
    {
      id: 'carbon-crusher',
      name: 'Carbon Crusher',
      description: 'Save 100,000kg of CO₂ across all challenges',
      icon: '🌱',
      rarity: 'Legendary',
      unlocked: false
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success text-success-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Hard': return 'bg-destructive text-destructive-foreground';
      case 'Boss': return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getGuildIcon = (type: Guild['type']) => {
    switch (type) {
      case 'business': return <Building className="w-4 h-4" />;
      case 'ngo': return <Leaf className="w-4 h-4" />;
      case 'citizen': return <Users className="w-4 h-4" />;
      case 'municipality': return <Shield className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Guild System */}
      <motion.div 
        className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl border border-primary/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sword className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-bold text-primary">Regional Sustainability Battles</h2>
            </div>
            <p className="text-muted-foreground">
              City-wide challenges uniting all stakeholders for maximum impact
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowAchievements(true)}
            className="flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Achievements
          </Button>
        </div>

        {/* Guild Leaderboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mockGuilds.map((guild, index) => (
            <motion.div
              key={guild.id}
              className="p-3 bg-card/80 backdrop-blur-sm rounded-lg border border-border hover:border-primary/40 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: guild.color + '20' }}>
                  {getGuildIcon(guild.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{guild.name}</div>
                  <div className="text-xs text-muted-foreground">{guild.members} members</div>
                </div>
                {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
              </div>
              <div className="text-sm font-bold" style={{ color: guild.color }}>
                {guild.totalScore.toLocaleString()} pts
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Challenge Tabs */}
      <div className="flex gap-2 mb-6">
        {(['active', 'completed', 'upcoming'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab} {tab === 'active' ? `(${mockChallenges.length})` : ''}
          </Button>
        ))}
      </div>

      {/* Challenge Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockChallenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-glow hover:-translate-y-1 ${
              challenge.difficulty === 'Boss' ? 'border-2 border-gradient-to-r from-purple-500 to-pink-500' : ''
            }`}
            onClick={() => setSelectedChallenge(challenge)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{challenge.name}</h3>
                    {challenge.difficulty === 'Boss' && (
                      <Crown className="w-5 h-5 text-yellow-500 animate-pulse" />
                    )}
                  </div>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty} Challenge
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{challenge.progress}%</div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {challenge.description}
              </p>

              <div className="space-y-3">
                <Progress value={challenge.progress} className="h-2" />
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{challenge.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{challenge.timeRemaining}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">CO₂ Progress:</span>
                    <span className="font-medium">{challenge.currentCo2.toLocaleString()} / {challenge.co2Target.toLocaleString()}kg</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant={challenge.difficulty === 'Boss' ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Join challenge logic
                  }}
                >
                  {challenge.difficulty === 'Boss' ? 'Join Boss Battle' : 'Join Challenge'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Challenge Detail Modal */}
      <AnimatePresence>
        {selectedChallenge && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedChallenge(null)}
          >
            <motion.div
              className="bg-card p-6 rounded-xl border-2 border-primary/20 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
                    {selectedChallenge.name}
                    {selectedChallenge.difficulty === 'Boss' && (
                      <Crown className="w-6 h-6 text-yellow-500" />
                    )}
                  </h2>
                  <Badge className={`mt-2 ${getDifficultyColor(selectedChallenge.difficulty)}`}>
                    {selectedChallenge.difficulty} Challenge
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedChallenge(null)}>
                  ✕
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Challenge Description</h3>
                    <p className="text-muted-foreground">{selectedChallenge.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Victory Conditions</h3>
                    <p className="text-muted-foreground">{selectedChallenge.goal}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Rewards</h3>
                    <p className="text-muted-foreground">{selectedChallenge.reward}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-3 text-center">
                      <div className="text-xl font-bold text-primary">{selectedChallenge.participants}</div>
                      <div className="text-sm text-muted-foreground">Participants</div>
                    </Card>
                    <Card className="p-3 text-center">
                      <div className="text-xl font-bold text-accent">{selectedChallenge.timeRemaining}</div>
                      <div className="text-sm text-muted-foreground">Remaining</div>
                    </Card>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Progress Tracking</h3>
                    <Progress value={selectedChallenge.progress} className="h-3 mb-2" />
                    <div className="text-sm text-muted-foreground">
                      {selectedChallenge.currentCo2.toLocaleString()} / {selectedChallenge.co2Target.toLocaleString()}kg CO₂
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Guild Leaderboard</h3>
                    <div className="space-y-2">
                      {selectedChallenge.leaderboard.map((guild, index) => (
                        <div
                          key={guild.id}
                          className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
                        >
                          <div className="text-sm font-bold w-6">#{index + 1}</div>
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: guild.color + '20' }}
                          >
                            {getGuildIcon(guild.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{guild.name}</div>
                            <div className="text-xs text-muted-foreground">{guild.members} members</div>
                          </div>
                          <div className="text-sm font-bold" style={{ color: guild.color }}>
                            {guild.totalScore.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button className="flex-1" size="lg">
                  Join Challenge
                </Button>
                <Button variant="outline" size="lg">
                  Share Challenge
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAchievements(false)}
          >
            <motion.div
              className="bg-card p-6 rounded-xl border-2 border-primary/20 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievements
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowAchievements(false)}>
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20' 
                        : 'bg-muted/30 border-border opacity-50'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <Badge 
                            variant={achievement.rarity === 'Legendary' ? 'default' : 'outline'}
                            className={
                              achievement.rarity === 'Legendary' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                              achievement.rarity === 'Epic' ? 'border-purple-500 text-purple-600' :
                              achievement.rarity === 'Rare' ? 'border-blue-500 text-blue-600' :
                              'border-gray-400 text-gray-600'
                            }
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && (
                        <div className="text-success">
                          <Star className="w-5 h-5 fill-current" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegionalChallenges;