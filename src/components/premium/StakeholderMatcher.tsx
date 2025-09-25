import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  X, 
  Star, 
  MapPin, 
  Building2, 
  Users, 
  TrendingUp,
  Award,
  Handshake,
  Zap,
  Target
} from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  type: 'municipality' | 'business' | 'ngo' | 'citizen';
  avatar: string;
  location: string;
  compatibility: number;
  expertise: string[];
  currentProjects: number;
  impact: string;
  description: string;
  achievements: string[];
}

const StakeholderMatcher = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);
  const [showMatch, setShowMatch] = useState(false);

  const stakeholders: Stakeholder[] = [
    {
      id: '1',
      name: 'Green Future Vienna',
      type: 'ngo',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
      location: 'Vienna Center',
      compatibility: 94,
      expertise: ['Renewable Energy', 'Community Outreach', 'Education'],
      currentProjects: 8,
      impact: '2.3K tons CO₂ saved',
      description: 'Leading NGO focused on renewable energy transition and community education programs.',
      achievements: ['Clean Energy Pioneer', 'Community Champion', 'Impact Multiplier']
    },
    {
      id: '2',
      name: 'EcoTech Solutions',
      type: 'business',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
      location: 'Leopoldstadt',
      compatibility: 87,
      expertise: ['Smart Grid', 'IoT Solutions', 'Energy Storage'],
      currentProjects: 12,
      impact: '5.1K tons CO₂ saved',
      description: 'Technology company specializing in smart energy solutions for sustainable cities.',
      achievements: ['Innovation Leader', 'Tech Pioneer', 'Sustainability Expert']
    },
    {
      id: '3',
      name: 'Vienna Climate Office',
      type: 'municipality',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      location: 'City Hall',
      compatibility: 91,
      expertise: ['Policy Making', 'Urban Planning', 'Public Infrastructure'],
      currentProjects: 15,
      impact: '8.7K tons CO₂ saved',
      description: 'Municipal department driving climate action through policy and infrastructure.',
      achievements: ['Policy Innovator', 'Urban Planner', 'Climate Leader']
    },
    {
      id: '4',
      name: 'Citizens for Climate',
      type: 'citizen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      location: 'Landstraße',
      compatibility: 82,
      expertise: ['Grassroots Organizing', 'Awareness Campaigns', 'Local Action'],
      currentProjects: 6,
      impact: '1.2K tons CO₂ saved',
      description: 'Community group organizing local climate action and awareness campaigns.',
      achievements: ['Community Organizer', 'Local Hero', 'Change Maker']
    }
  ];

  const currentStakeholder = stakeholders[currentIndex];

  const handleLike = () => {
    if (currentStakeholder.compatibility > 85) {
      setMatches([...matches, currentStakeholder.id]);
      setShowMatch(true);
      setTimeout(() => setShowMatch(false), 2000);
    }
    nextStakeholder();
  };

  const handlePass = () => {
    nextStakeholder();
  };

  const nextStakeholder = () => {
    if (currentIndex < stakeholders.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const getTypeColor = (type: Stakeholder['type']) => {
    switch (type) {
      case 'municipality': return 'bg-primary text-primary-foreground';
      case 'business': return 'bg-accent text-accent-foreground';
      case 'ngo': return 'bg-success text-success-foreground';
      case 'citizen': return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTypeIcon = (type: Stakeholder['type']) => {
    switch (type) {
      case 'municipality': return Building2;
      case 'business': return TrendingUp;
      case 'ngo': return Handshake;
      case 'citizen': return Users;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Stakeholder Matcher</h2>
        <p className="text-muted-foreground">Find perfect collaboration partners for your sustainability projects</p>
        
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{matches.length}</div>
            <div className="text-sm text-muted-foreground">Perfect Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{stakeholders.length}</div>
            <div className="text-sm text-muted-foreground">Total Partners</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">94%</div>
            <div className="text-sm text-muted-foreground">Avg Compatibility</div>
          </div>
        </div>
      </div>

      {/* Main Matching Interface */}
      <div className="relative flex items-center justify-center min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStakeholder.id}
            initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md"
          >
            <Card className="overflow-hidden shadow-premium border-2 bg-card/95 backdrop-blur-lg">
              <CardHeader className="relative pb-4">
                <div className="absolute top-4 right-4">
                  <motion.div
                    className="flex items-center space-x-1 bg-gradient-to-r from-primary to-accent text-white px-3 py-1 rounded-full text-sm font-medium"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="w-4 h-4" />
                    <span>{currentStakeholder.compatibility}% Match</span>
                  </motion.div>
                </div>
                
                <div className="text-center space-y-4">
                  <Avatar className="w-24 h-24 mx-auto border-4 border-background shadow-premium">
                    <AvatarImage src={currentStakeholder.avatar} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                      {currentStakeholder.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <CardTitle className="text-xl text-foreground">{currentStakeholder.name}</CardTitle>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <Badge className={getTypeColor(currentStakeholder.type)}>
                        {React.createElement(getTypeIcon(currentStakeholder.type), { className: "w-3 h-3 mr-1" })}
                        {currentStakeholder.type}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {currentStakeholder.location}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <p className="text-muted-foreground text-center">
                    {currentStakeholder.description}
                  </p>
                </div>

                {/* Compatibility Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Compatibility Score</span>
                    <span className="font-medium text-foreground">{currentStakeholder.compatibility}%</span>
                  </div>
                  <Progress 
                    value={currentStakeholder.compatibility} 
                    className="h-3"
                  />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-card/50 rounded-xl border border-border/50">
                    <div className="flex items-center justify-center mb-1">
                      <Target className="w-4 h-4 text-primary mr-1" />
                      <span className="font-bold text-foreground">{currentStakeholder.currentProjects}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Active Projects</div>
                  </div>
                  <div className="text-center p-3 bg-card/50 rounded-xl border border-border/50">
                    <div className="flex items-center justify-center mb-1">
                      <Zap className="w-4 h-4 text-success mr-1" />
                      <span className="font-bold text-foreground">{currentStakeholder.impact}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Total Impact</div>
                  </div>
                </div>

                {/* Expertise Tags */}
                <div>
                  <div className="text-sm font-medium text-foreground mb-2">Expertise</div>
                  <div className="flex flex-wrap gap-2">
                    {currentStakeholder.expertise.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <div className="text-sm font-medium text-foreground mb-2">Achievements</div>
                  <div className="flex flex-wrap gap-2">
                    {currentStakeholder.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center text-xs text-muted-foreground">
                        <Award className="w-3 h-3 mr-1" />
                        {achievement}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handlePass}
                      variant="outline"
                      className="w-full h-12 text-destructive border-destructive/50 hover:bg-destructive/10"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Pass
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleLike}
                      className="w-full h-12 bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Match
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Perfect Match Celebration */}
        <AnimatePresence>
          {showMatch && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-gradient-to-r from-primary to-success text-white px-8 py-4 rounded-full shadow-glow text-lg font-bold">
                🎉 Perfect Match! 🎉
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Match Statistics */}
      {matches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
            <div className="flex items-center justify-center space-x-4">
              <Handshake className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">{matches.length} Perfect Matches</div>
                <div className="text-muted-foreground">Ready to start collaborating!</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default StakeholderMatcher;