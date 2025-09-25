import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { 
  Shield, 
  Sword, 
  Crown, 
  Users, 
  Trophy,
  Flame,
  Star,
  ChevronUp,
  Target
} from "lucide-react";

interface Guild {
  id: string;
  name: string;
  type: 'business' | 'ngo' | 'citizen' | 'government';
  level: number;
  members: number;
  score: number;
  leader: string;
  color: string;
  icon: any;
}

const GuildSystem = () => {
  const [selectedGuild, setSelectedGuild] = useState<string | null>('business-titans');

  const guilds: Guild[] = [
    {
      id: 'business-titans',
      name: 'Business Titans',
      type: 'business',
      level: 15,
      members: 1240,
      score: 15670,
      leader: 'EcoTech Corp',
      color: 'from-primary to-primary-glow',
      icon: Shield
    },
    {
      id: 'eco-warriors',
      name: 'Eco Warriors',
      type: 'ngo',
      level: 12,
      members: 890,
      score: 12450,
      leader: 'Green Future NGO',
      color: 'from-success to-success-light',
      icon: Sword
    },
    {
      id: 'citizen-champions',
      name: 'Citizen Champions',
      type: 'citizen',
      level: 18,
      members: 3200,
      score: 18930,
      leader: 'Alex Green',
      color: 'from-accent to-accent-light',
      icon: Crown
    }
  ];

  const getGuildRank = (score: number) => {
    if (score > 15000) return { rank: 'Diamond', icon: Crown, color: 'text-primary' };
    if (score > 10000) return { rank: 'Gold', icon: Trophy, color: 'text-warning' };
    if (score > 5000) return { rank: 'Silver', icon: Star, color: 'text-muted-foreground' };
    return { rank: 'Bronze', icon: Shield, color: 'text-destructive' };
  };

  const userGuild = guilds.find(g => g.id === 'business-titans');

  return (
    <div className="space-y-4">
      {/* User's Guild Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/30"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">Your Guild</span>
          </div>
          <Badge className="bg-primary/20 text-primary">Level {userGuild?.level}</Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">{userGuild?.name}</span>
            <span className="text-muted-foreground">{userGuild?.members} members</span>
          </div>
          <Progress value={75} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>15,670 XP</span>
            <span>Next level: 18,000 XP</span>
          </div>
        </div>
      </motion.div>

      {/* Guild Leaderboard */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground mb-3">Guild Leaderboard</h4>
        {guilds.map((guild, index) => {
          const Icon = guild.icon;
          const rank = getGuildRank(guild.score);
          const RankIcon = rank.icon;
          
          return (
            <motion.div
              key={guild.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedGuild(selectedGuild === guild.id ? null : guild.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedGuild === guild.id 
                  ? 'border-primary/50 bg-primary/5' 
                  : 'border-border/30 hover:border-border/50 hover:bg-card/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                    <RankIcon className={`w-4 h-4 ${rank.color}`} />
                  </div>
                  
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${guild.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-foreground">{guild.name}</div>
                    <div className="text-xs text-muted-foreground">{guild.members} members</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">{guild.score.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </div>
              </div>
              
              {selectedGuild === guild.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-border/30"
                >
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Leader:</span>
                      <p className="font-medium text-foreground">{guild.leader}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium text-foreground capitalize">{guild.type}</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Target className="w-3 h-3 mr-2" />
                    View Guild Challenges
                  </Button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 bg-gradient-to-r from-warning/10 to-destructive/10 rounded-xl border border-warning/30"
      >
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-warning" />
          <span className="font-semibold text-warning">Weekly Guild War</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">CO₂ Reduction Challenge</span>
            <span className="text-muted-foreground">3 days left</span>
          </div>
          <Progress value={68} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>680kg saved</span>
            <span>Goal: 1,000kg</span>
          </div>
        </div>
        
        <Button variant="secondary" size="sm" className="w-full mt-3">
          <ChevronUp className="w-3 h-3 mr-2" />
          Boost Your Guild
        </Button>
      </motion.div>
    </div>
  );
};

export default GuildSystem;