import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import SponsorshipDashboard from '@/components/business/SponsorshipDashboard';
import SponsorshipPackageSelector from '@/components/business/SponsorshipPackageSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Target, 
  Users, 
  Leaf, 
  TrendingUp,
  Award,
  Building2,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';

const BusinessSponsorshipPage = () => {
  const { user, profile } = useAuth();
  const { createCheckout, packageTiers } = useSubscription();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboard' | 'marketplace'>('overview');

  // Mock sponsored challenges data
  const sponsoredChallenges = [
    {
      id: '1',
      title: 'Műanyagmentes Munkahely',
      sponsor: 'GreenTech Solutions Kft.',
      participants: 234,
      co2Saved: 1250,
      status: 'active',
      creditsUsed: 15000,
      endDate: '2024-12-15'
    },
    {
      id: '2', 
      title: 'Zöld Közlekedési Kihívás',
      sponsor: 'EcoTransport Ltd.',
      participants: 567,
      co2Saved: 2340,
      status: 'active',
      creditsUsed: 25000,
      endDate: '2024-11-30'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Card>
            <CardContent className="p-8">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">Üzleti Szponzoráció</h2>
              <p className="text-muted-foreground mb-6">
                Jelentkezz be vállalati szponzorációs lehetőségek eléréséhez
              </p>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-success">
                Bejelentkezés
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (profile?.user_role !== 'business') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Alert>
            <Building2 className="h-4 w-4" />
            <AlertDescription>
              Ez a funkció csak vállalati felhasználók számára érhető el. 
              Váltsd át a profil típusodat vállalkozásra a beállításokban.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                Üzleti Szponzoráció Platform
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Szponzorálj fenntarthatósági kihívásokat és építsd a márka tudatosságodat
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-primary to-success text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Business Premium
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1 mb-6 sm:mb-8 bg-card/50 p-2 sm:p-1 rounded-lg">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="flex-1 text-xs sm:text-sm"
          >
            Áttekintés
          </Button>
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('dashboard')}
            className="flex-1 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Szponzorációs Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Button>
          <Button
            variant={activeTab === 'marketplace' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('marketplace')}
            className="flex-1 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Kihívás Marketplace</span>
            <span className="sm:hidden">Marketplace</span>
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Business Model Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Üzleti Modell: Szponzorációs Rendszer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Hogyan működik?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Szponzorációs csomag vásárlása</p>
                          <p className="text-sm text-muted-foreground">Válassz a Bronz, Ezüst vagy Arany csomagok közül</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Kreditek elosztása</p>
                          <p className="text-sm text-muted-foreground">Oszd el kreditjeidet különböző kihívások között</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Láthatóság és hatás</p>
                          <p className="text-sm text-muted-foreground">Márkád megjelenik a szponzorált kihívásoknál</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">4</span>
                        </div>
                        <div>
                          <p className="font-medium">Valós idejű jelentések</p>
                          <p className="text-sm text-muted-foreground">Kövesd nyomon a hatást és a befektetés megtérülését</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-primary/5 to-success/5 p-6 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-lg mb-4">Miért érdemes?</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-sm">Brand awareness növelés</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm">Célzott közösség elérése</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Leaf className="w-4 h-4 text-success" />
                        <span className="text-sm">Mérhető környezeti hatás</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="text-sm">ESG célok teljesítése</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Sponsorships */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Aktív Szponzorációk
                  </span>
                  <Badge variant="secondary">{sponsoredChallenges.length} aktív</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sponsoredChallenges.map((challenge) => (
                    <div key={challenge.id} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-success rounded-full flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{challenge.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {challenge.participants} résztvevő • {challenge.co2Saved} kg CO₂ megtakarítás
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">{challenge.creditsUsed.toLocaleString()} kredit</div>
                        <div className="text-xs text-muted-foreground">Lejárat: {challenge.endDate}</div>
                        <Badge className="bg-success/20 text-success">Aktív</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button onClick={() => setActiveTab('marketplace')} className="bg-gradient-to-r from-primary to-success">
                    <Plus className="w-4 h-4 mr-2" />
                    Új Kihívás Szponzorálása
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <SponsorshipDashboard companyId={profile?.organization_id || 'company-1'} />
        )}

        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            {/* Sponsorship Packages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Szponzorációs Csomagok
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Válassz szponzorációs csomagot a kihívások támogatásához.
                </p>
                <SponsorshipPackageSelector />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Kihívás Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Válassz a rendelkezésre álló kihívások közül, vagy hozz létre saját kihívást szponzorálásra.
                </p>
                
                {/* Available Challenges */}
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'Városi Kerékpározás Kihívás',
                      description: 'Ösztönözd a fenntartható közlekedést a városban',
                      category: 'Közlekedés',
                      estimatedParticipants: 500,
                      requiredCredits: 20000,
                      potentialImpact: '1,200 kg CO₂'
                    },
                    {
                      title: 'Zéró Hulladék Iroda',
                      description: 'Segíts irodáknak elérni a zero waste célt',
                      category: 'Hulladék',
                      estimatedParticipants: 300,
                      requiredCredits: 15000,
                      potentialImpact: '800 kg CO₂'
                    },
                    {
                      title: 'Helyi Élelmiszer Kihívás',
                      description: 'Támogasd a helyi termelőket és csökkentsd a szállítási lábnyomot',
                      category: 'Élelmiszer',
                      estimatedParticipants: 700,
                      requiredCredits: 25000,
                      potentialImpact: '1,500 kg CO₂'
                    }
                  ].map((challenge, index) => (
                    <Card key={index} className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                            <p className="text-muted-foreground text-sm mb-3">{challenge.description}</p>
                            <Badge variant="outline">{challenge.category}</Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Becsült résztvevők:</span>
                              <span className="font-medium">{challenge.estimatedParticipants.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Szükséges kreditek:</span>
                              <span className="font-medium">{challenge.requiredCredits.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Potenciális hatás:</span>
                              <span className="font-medium text-success">{challenge.potentialImpact}</span>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              // Mock sponsorship initiation - show available packages
                              const packageKeys = Object.keys(packageTiers);
                              const randomPackage = packageKeys[Math.floor(Math.random() * packageKeys.length)];
                              const tier = packageTiers[randomPackage as keyof typeof packageTiers];
                              if (confirm(`Szponzorálás a ${tier.name} csomaggal (${tier.priceHuf.toLocaleString()} HUF / ${tier.priceEur} EUR)?`)) {
                                createCheckout(tier.price_id);
                              }
                            }}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Szponzorálás Indítása
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Card className="bg-gradient-to-r from-accent/10 to-secondary/10 border-accent/20">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3">Saját Kihívás Létrehozása</h3>
                      <p className="text-muted-foreground mb-4">
                        Hozz létre testreszabott kihívást a vállalati céloknak megfelelően
                      </p>
                      <Button className="bg-gradient-to-r from-accent to-secondary">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Egyedi Kihívás Tervezése
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessSponsorshipPage;