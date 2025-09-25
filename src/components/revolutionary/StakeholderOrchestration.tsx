import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, X, Users, TrendingUp, Zap, Building, Leaf, Shield } from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  type: 'municipality' | 'business' | 'ngo' | 'citizen';
  avatar: string;
  compatibility: number;
  expertise: string[];
  description: string;
  impactPotential: number;
  location: string;
  projects: number;
  co2Impact: number;
}

interface Partnership {
  id: string;
  stakeholders: Stakeholder[];
  compatibility: number;
  predictedImpact: number;
  description: string;
}

const StakeholderOrchestration: React.FC = () => {
  const [currentStakeholder, setCurrentStakeholder] = useState(0);
  const [matches, setMatches] = useState<Partnership[]>([]);
  const [showPartnershipBuilder, setShowPartnershipBuilder] = useState(false);
  const [selectedForBuilder, setSelectedForBuilder] = useState<Stakeholder[]>([]);

  const mockStakeholders: Stakeholder[] = [
    {
      id: 'municipality-vienna',
      name: 'Vienna Municipality',
      type: 'municipality',
      avatar: '/placeholder-avatar.jpg',
      compatibility: 94,
      expertise: ['Policy Making', 'Urban Planning', 'Green Infrastructure'],
      description: 'Leading Vienna\'s carbon neutrality initiative by 2040',
      impactPotential: 87,
      location: 'Vienna, Austria',
      projects: 15,
      co2Impact: 12500
    },
    {
      id: 'greentech-solutions',
      name: 'GreenTech Solutions',
      type: 'business',
      avatar: '/placeholder-avatar.jpg',
      compatibility: 92,
      expertise: ['Solar Energy', 'Smart Buildings', 'IoT Solutions'],
      description: 'Innovative clean technology solutions for smart cities',
      impactPotential: 85,
      location: 'Vienna, Austria',
      projects: 8,
      co2Impact: 8900
    },
    {
      id: 'climate-action-ngo',
      name: 'Climate Action Network',
      type: 'ngo',
      avatar: '/placeholder-avatar.jpg',
      compatibility: 89,
      expertise: ['Community Engagement', 'Education', 'Advocacy'],
      description: 'Mobilizing communities for climate action and awareness',
      impactPotential: 78,
      location: 'Vienna, Austria',
      projects: 22,
      co2Impact: 5600
    },
    {
      id: 'eco-citizens-group',
      name: 'Eco Citizens Group',
      type: 'citizen',
      avatar: '/placeholder-avatar.jpg',
      compatibility: 86,
      expertise: ['Local Initiatives', 'Grassroots Organizing', 'Lifestyle Changes'],
      description: 'Local citizen group driving sustainable lifestyle changes',
      impactPotential: 72,
      location: 'Vienna, Austria',
      projects: 12,
      co2Impact: 3200
    }
  ];

  const getStakeholderIcon = (type: Stakeholder['type']) => {
    switch (type) {
      case 'municipality': return <Building className="w-4 h-4" />;
      case 'business': return <TrendingUp className="w-4 h-4" />;
      case 'ngo': return <Leaf className="w-4 h-4" />;
      case 'citizen': return <Users className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const stakeholder = mockStakeholders[currentStakeholder];
    
    if (direction === 'right') {
      // Create a match/partnership
      const partnership: Partnership = {
        id: `partnership-${Date.now()}`,
        stakeholders: [stakeholder],
        compatibility: stakeholder.compatibility,
        predictedImpact: stakeholder.impactPotential,
        description: `High synergy partnership with ${stakeholder.name}`
      };
      setMatches(prev => [...prev, partnership]);
    }

    // Move to next stakeholder
    setCurrentStakeholder(prev => (prev + 1) % mockStakeholders.length);
  };

  const calculatePartnershipScore = (stakeholders: Stakeholder[]) => {
    if (stakeholders.length < 2) return 0;
    const avgCompatibility = stakeholders.reduce((sum, s) => sum + s.compatibility, 0) / stakeholders.length;
    const typeBonus = new Set(stakeholders.map(s => s.type)).size * 10; // Bonus for diversity
    return Math.min(100, Math.round(avgCompatibility + typeBonus));
  };

  const current = mockStakeholders[currentStakeholder];

  return (
    <div className="w-full space-y-6">
      {/* AI Suggestions Header */}
      <motion.div 
        className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl border border-primary/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-bold text-primary">AI-Powered Stakeholder Orchestration</h2>
        </div>
        <p className="text-muted-foreground">
          Discover perfect partnership opportunities with AI-driven compatibility matching
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tinder-style Swiper */}
        <Card className="p-6 min-h-[500px] relative">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Partnership Discovery
          </h3>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              className="absolute inset-6 top-16"
              initial={{ x: 300, opacity: 0, rotateY: 15 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              exit={{ x: -300, opacity: 0, rotateY: -15 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="p-6 h-full bg-gradient-to-br from-card to-muted/30 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={current.avatar} alt={current.name} />
                    <AvatarFallback>{current.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg">{current.name}</h4>
                      <Badge variant="outline" className="capitalize">
                        {getStakeholderIcon(current.type)}
                        {current.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{current.location}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{current.compatibility}%</div>
                    <div className="text-xs text-muted-foreground">Match</div>
                  </div>
                </div>

                <p className="text-sm mb-4">{current.description}</p>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Expertise</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {current.expertise.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Impact Potential</label>
                    <Progress value={current.impactPotential} className="mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-bold text-primary">{current.projects}</div>
                    <div className="text-muted-foreground">Projects</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-bold text-success">{current.co2Impact}kg</div>
                    <div className="text-muted-foreground">CO₂ Impact</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Swipe buttons */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
            <motion.button
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
            <motion.button
              onClick={() => handleSwipe('right')}
              className="w-14 h-14 bg-success text-success-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="w-6 h-6" />
            </motion.button>
          </div>
        </Card>

        {/* Partnership Matches */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Partnership Matches ({matches.length})
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPartnershipBuilder(true)}
            >
              Partnership Builder
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {matches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border border-success/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{match.stakeholders[0]?.name}</h4>
                  <Badge variant="default" className="bg-success text-success-foreground">
                    {match.compatibility}% Match
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{match.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Predicted Impact: {match.predictedImpact}%
                  </span>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    Connect
                  </Button>
                </div>
              </motion.div>
            ))}
            {matches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Start swiping to discover partnership opportunities</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Partnership Builder Modal */}
      <AnimatePresence>
        {showPartnershipBuilder && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card p-6 rounded-xl border-2 border-primary/20 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary">Cross-Sector Partnership Builder</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowPartnershipBuilder(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Available stakeholders */}
                <div>
                  <h4 className="font-semibold mb-3">Available Stakeholders</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {mockStakeholders.map((stakeholder) => (
                      <motion.div
                        key={stakeholder.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedForBuilder.find(s => s.id === stakeholder.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/40'
                        }`}
                        onClick={() => {
                          setSelectedForBuilder(prev => 
                            prev.find(s => s.id === stakeholder.id)
                              ? prev.filter(s => s.id !== stakeholder.id)
                              : [...prev, stakeholder]
                          );
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{stakeholder.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{stakeholder.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {stakeholder.type}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {stakeholder.compatibility}%
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Partnership preview */}
                <div>
                  <h4 className="font-semibold mb-3">Partnership Preview</h4>
                  {selectedForBuilder.length >= 2 ? (
                    <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-primary">
                          {calculatePartnershipScore(selectedForBuilder)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Partnership Score</div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {selectedForBuilder.map((stakeholder) => (
                          <div key={stakeholder.id} className="flex items-center gap-2 text-sm">
                            {getStakeholderIcon(stakeholder.type)}
                            <span>{stakeholder.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="text-center p-2 bg-card rounded">
                          <div className="font-bold">
                            {selectedForBuilder.reduce((sum, s) => sum + s.projects, 0)}
                          </div>
                          <div className="text-muted-foreground">Total Projects</div>
                        </div>
                        <div className="text-center p-2 bg-card rounded">
                          <div className="font-bold">
                            {selectedForBuilder.reduce((sum, s) => sum + s.co2Impact, 0)}kg
                          </div>
                          <div className="text-muted-foreground">Combined CO₂</div>
                        </div>
                      </div>

                      <Button className="w-full mt-4">
                        Create Partnership
                      </Button>
                    </Card>
                  ) : (
                    <Card className="p-4 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Select 2+ stakeholders to preview partnership</p>
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StakeholderOrchestration;