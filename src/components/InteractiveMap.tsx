import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MapPin, 
  Users, 
  Leaf, 
  Building2, 
  Heart,
  User,
  Plus,
  Star,
  Globe,
  ArrowRight
} from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  type: 'citizen' | 'business' | 'government' | 'ngo';
  location: { lat: number; lng: number };
  city: string;
  verified: boolean;
  sustainabilityScore: number;
  activeProjects: number;
  impact: {
    co2Saved: number;
    partnersConnected: number;
  };
}

const InteractiveMap = () => {
  const { user } = useAuth();
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [mapView, setMapView] = useState<'registered' | 'motivation'>('registered');

  // Mock registered stakeholders
  const registeredStakeholders: Stakeholder[] = [
    {
      id: '1',
      name: 'GreenTech Solutions Kft.',
      type: 'business',
      location: { lat: 47.4979, lng: 19.0402 },
      city: 'Budapest',
      verified: true,
      sustainabilityScore: 92,
      activeProjects: 5,
      impact: { co2Saved: 1250, partnersConnected: 12 }
    },
    {
      id: '2',
      name: 'Pécs Zöld Város',
      type: 'government',
      location: { lat: 46.0727, lng: 18.2328 },
      city: 'Pécs',
      verified: true,
      sustainabilityScore: 87,
      activeProjects: 8,
      impact: { co2Saved: 2340, partnersConnected: 25 }
    },
    {
      id: '3',
      name: 'Magyar Természetvédő Szövetség',
      type: 'ngo',
      location: { lat: 47.5316, lng: 21.6273 },
      city: 'Debrecen',
      verified: true,
      sustainabilityScore: 95,
      activeProjects: 12,
      impact: { co2Saved: 890, partnersConnected: 18 }
    },
    {
      id: '4',
      name: 'Kovács János',
      type: 'citizen',
      location: { lat: 46.2530, lng: 20.1414 },
      city: 'Szeged',
      verified: true,
      sustainabilityScore: 78,
      activeProjects: 3,
      impact: { co2Saved: 156, partnersConnected: 7 }
    }
  ];

  // Mock non-registered stakeholders for motivation
  const nonRegisteredStakeholders = [
    { name: 'Siemens Magyarország', type: 'business', city: 'Budapest', potential: 'Magas' },
    { name: 'Györ Város Önkormányzata', type: 'government', city: 'Győr', potential: 'Közepes' },
    { name: 'Greenpeace Magyarország', type: 'ngo', city: 'Budapest', potential: 'Magas' },
    { name: 'Local Heroes Kft.', type: 'business', city: 'Miskolc', potential: 'Közepes' }
  ];

  const getStakeholderIcon = (type: string) => {
    switch (type) {
      case 'citizen': return <User className="w-4 h-4" />;
      case 'business': return <Building2 className="w-4 h-4" />;
      case 'government': return <MapPin className="w-4 h-4" />;
      case 'ngo': return <Heart className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getStakeholderColor = (type: string) => {
    switch (type) {
      case 'citizen': return 'from-emerald-400 to-green-600';
      case 'business': return 'from-blue-400 to-indigo-600';
      case 'government': return 'from-orange-400 to-red-500';
      case 'ngo': return 'from-purple-400 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'citizen': return 'Állampolgár';
      case 'business': return 'Vállalkozás';
      case 'government': return 'Önkormányzat';
      case 'ngo': return 'Civil Szervezet';
      default: return 'Stakeholder';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-primary" />
              <span>Interaktív Stakeholder Térkép</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={mapView === 'registered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapView('registered')}
              >
                Regisztrált Partnerek
              </Button>
              <Button
                variant={mapView === 'motivation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapView('motivation')}
              >
                Potenciális Partnerek
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mapView === 'registered' ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-success/10 p-6 rounded-lg border border-primary/20">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Magyarország Fenntartható Térképe
                  </h3>
                  <p className="text-muted-foreground">
                    {registeredStakeholders.length} aktív stakeholder országszerte
                  </p>
                </div>
                
                {/* Simplified Map Visualization */}
                <div className="relative bg-card/30 rounded-lg p-8 border-2 border-dashed border-border min-h-[400px]">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center space-y-4">
                      <MapPin className="w-16 h-16 mx-auto text-primary opacity-50" />
                      <p className="text-lg font-medium">Magyarország Interaktív Térkép</p>
                      <p className="text-sm">Kattints a stakeholder-ekre a részletekért</p>
                    </div>
                  </div>
                  
                  {/* Stakeholder Pins */}
                  {registeredStakeholders.map((stakeholder, index) => (
                    <button
                      key={stakeholder.id}
                      onClick={() => setSelectedStakeholder(stakeholder)}
                      className={`absolute animate-pulse hover:animate-none transform hover:scale-110 transition-all duration-300 ${
                        index === 0 ? 'top-1/4 left-1/2' : 
                        index === 1 ? 'bottom-1/3 left-1/4' : 
                        index === 2 ? 'top-1/3 right-1/4' : 'bottom-1/4 right-1/3'
                      }`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${getStakeholderColor(stakeholder.type)} rounded-full flex items-center justify-center shadow-lg border-2 border-background`}>
                        {getStakeholderIcon(stakeholder.type)}
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-border whitespace-nowrap">
                        {stakeholder.city}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stakeholder List */}
              <div className="grid md:grid-cols-2 gap-4">
                {registeredStakeholders.map((stakeholder) => (
                  <Card 
                    key={stakeholder.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedStakeholder?.id === stakeholder.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedStakeholder(stakeholder)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${getStakeholderColor(stakeholder.type)} rounded-full flex items-center justify-center`}>
                            {getStakeholderIcon(stakeholder.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-foreground">{stakeholder.name}</h4>
                              {stakeholder.verified && (
                                <Badge variant="secondary" className="bg-success/20 text-success">
                                  <Star className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{getTypeLabel(stakeholder.type)} • {stakeholder.city}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs">
                              <span className="flex items-center space-x-1">
                                <Leaf className="w-3 h-3 text-success" />
                                <span>{stakeholder.impact.co2Saved} kg CO₂</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Users className="w-3 h-3 text-primary" />
                                <span>{stakeholder.impact.partnersConnected} partner</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{stakeholder.sustainabilityScore}</div>
                          <div className="text-xs text-muted-foreground">Fenntart. pontszám</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Motivation Section */}
              <div className="bg-gradient-to-r from-warning/10 to-accent/10 p-6 rounded-lg border border-warning/20">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Csatlakozz a Térképhez!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Még nem regisztrált stakeholderek a területeden - ez a te lehetőséged a vezetésre!
                  </p>
                  {!user && (
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary mb-3">
                        🚀 Regisztrálj most és jelenj meg az interaktív térképen!
                      </p>
                      <Button className="bg-gradient-to-r from-primary to-success">
                        Regisztráció és Térképre Kerülés
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Non-registered Stakeholders */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-warning" />
                    Potenciális Partnerek (Még nem regisztráltak)
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {nonRegisteredStakeholders.map((stakeholder, index) => (
                      <Card key={index} className="bg-muted/30 border-dashed border-warning/40">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center border-2 border-dashed border-muted-foreground">
                                {getStakeholderIcon(stakeholder.type)}
                              </div>
                              <div>
                                <h5 className="font-medium text-muted-foreground">{stakeholder.name}</h5>
                                <p className="text-sm text-muted-foreground">{getTypeLabel(stakeholder.type)} • {stakeholder.city}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="border-warning text-warning">
                              {stakeholder.potential} potenciál
                            </Badge>
                          </div>
                          <div className="mt-3 pt-3 border-t border-dashed border-muted-foreground/20">
                            <p className="text-xs text-muted-foreground mb-2">
                              Ez a szervezet még nem csatlakozott a platformhoz
                            </p>
                            <Button size="sm" variant="outline" className="w-full border-warning text-warning hover:bg-warning/10">
                              <Plus className="w-3 h-3 mr-1" />
                              Hívd meg a csatlakozásra
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Benefits of Registration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Star className="w-5 h-5 mr-2" />
                    Miért érdemes regisztrálni?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">Láthatóság</h4>
                      <p className="text-sm text-muted-foreground">Megjelenés az országos térképen</p>
                    </div>
                    <div className="text-center p-4 bg-success/5 rounded-lg">
                      <Users className="w-8 h-8 text-success mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">Kapcsolatok</h4>
                      <p className="text-sm text-muted-foreground">Partnerek megtalálása közelben</p>
                    </div>
                    <div className="text-center p-4 bg-accent/5 rounded-lg">
                      <Leaf className="w-8 h-8 text-accent mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">Hatás</h4>
                      <p className="text-sm text-muted-foreground">Fenntartható projektek együtt</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Stakeholder Details */}
      {selectedStakeholder && mapView === 'registered' && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${getStakeholderColor(selectedStakeholder.type)} rounded-full flex items-center justify-center`}>
                {getStakeholderIcon(selectedStakeholder.type)}
              </div>
              <div>
                <h3>{selectedStakeholder.name}</h3>
                <p className="text-sm text-muted-foreground">{getTypeLabel(selectedStakeholder.type)} • {selectedStakeholder.city}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Fenntarthatósági Profil</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Fenntarthatósági pontszám</span>
                    <span className="font-semibold text-primary">{selectedStakeholder.sustainabilityScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Aktív projektek</span>
                    <span className="font-medium">{selectedStakeholder.activeProjects}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Hatás Métrikus</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Leaf className="w-4 h-4 mr-1 text-success" />
                      CO₂ megtakarítás
                    </span>
                    <span className="font-semibold text-success">{selectedStakeholder.impact.co2Saved} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Users className="w-4 h-4 mr-1 text-primary" />
                      Kapcsolt partnerek
                    </span>
                    <span className="font-semibold">{selectedStakeholder.impact.partnersConnected}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Lehetőségek</h4>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Kapcsolat felvétel
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    Együttműködés ajánlása
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveMap;