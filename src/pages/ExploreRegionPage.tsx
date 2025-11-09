import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Search,
  Building2,
  User,
  Landmark,
  Heart,
  MapPin,
  Globe,
  Loader2
} from 'lucide-react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  public_display_name: string | null;
  user_role: 'citizen' | 'business' | 'government' | 'ngo';
  organization: string | null;
  organization_id: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website_url: string | null;
  sustainability_goals: string[] | null;
  is_public_profile: boolean;
}

interface Organization {
  id: string;
  name: string;
  type: 'business' | 'government' | 'ngo';
  logo_url: string | null;
  description: string | null;
  location: string | null;
  website_url: string | null;
  is_public: boolean;
}

const ExploreRegionPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { currentProject, isLoading: projectLoading } = useProject();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<'all' | 'citizen' | 'business' | 'government' | 'ngo'>('all');

  useEffect(() => {
    fetchData();
  }, [currentProject]);

  const fetchData = async () => {
    if (!currentProject) return;

    setLoading(true);
    try {
      // Fetch public profiles for current project
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public_profile', true)
        .eq('project_id', currentProject.id);

      if (!profilesError && profilesData) {
        setProfiles(profilesData as Profile[]);
      }

      // Fetch public organizations for current project
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_public', true)
        .eq('project_id', currentProject.id);

      if (!orgsError && orgsData) {
        setOrganizations(orgsData as Organization[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByType = (item: Profile | Organization) => {
    if (selectedType === 'all') return true;
    
    if ('user_role' in item) {
      return item.user_role === selectedType;
    } else {
      return item.type === selectedType;
    }
  };

  const filterBySearch = (item: Profile | Organization) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    if ('user_role' in item) {
      // Profile
      const name = item.public_display_name || `${item.first_name} ${item.last_name}`;
      return name.toLowerCase().includes(query) ||
             item.organization?.toLowerCase().includes(query) ||
             item.bio?.toLowerCase().includes(query);
    } else {
      // Organization
      return item.name.toLowerCase().includes(query) ||
             item.description?.toLowerCase().includes(query);
    }
  };

  const filteredProfiles = profiles.filter(filterByType).filter(filterBySearch);
  const filteredOrganizations = organizations.filter(filterByType).filter(filterBySearch);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'citizen': return <User className="w-4 h-4" />;
      case 'business': return <Building2 className="w-4 h-4" />;
      case 'government': return <Landmark className="w-4 h-4" />;
      case 'ngo': return <Heart className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'citizen': return 'Állampolgár';
      case 'business': return 'Vállalkozás';
      case 'government': return 'Önkormányzat';
      case 'ngo': return 'Civil szervezet';
      default: return type;
    }
  };

  if (projectLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Nincs kiválasztott projekt</h2>
          <Button onClick={() => navigate('/projects')}>
            Projektek megtekintése
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-6 sm:pb-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="w-8 h-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Fedezd Fel a Régiót
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ismerd meg a {currentProject.region_name} fenntarthatósági közösségének tagjait
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="max-w-4xl mx-auto mb-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Keresés név, szervezet vagy leírás alapján..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              <Users className="w-4 h-4 mr-2" />
              Összes
            </Button>
            <Button
              variant={selectedType === 'citizen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('citizen')}
            >
              <User className="w-4 h-4 mr-2" />
              Állampolgárok
            </Button>
            <Button
              variant={selectedType === 'business' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('business')}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Vállalkozások
            </Button>
            <Button
              variant={selectedType === 'government' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('government')}
            >
              <Landmark className="w-4 h-4 mr-2" />
              Önkormányzatok
            </Button>
            <Button
              variant={selectedType === 'ngo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('ngo')}
            >
              <Heart className="w-4 h-4 mr-2" />
              Civil szervezetek
            </Button>
          </div>

          {/* Results count */}
          <div className="text-center text-sm text-muted-foreground">
            {filteredProfiles.length + filteredOrganizations.length} találat
          </div>
        </motion.div>

        {/* Results grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Profile cards */}
          {filteredProfiles.map((profile) => (
            <Card 
              key={profile.id} 
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
              onClick={() => navigate(`/profile?userId=${profile.id}`)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile.first_name[0]}{profile.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {profile.public_display_name || `${profile.first_name} ${profile.last_name}`}
                    </CardTitle>
                    {profile.organization && (
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.organization}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="w-fit">
                  {getTypeIcon(profile.user_role)}
                  <span className="ml-1">{getTypeLabel(profile.user_role)}</span>
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {profile.bio}
                  </p>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </div>
                )}
                {profile.sustainability_goals && profile.sustainability_goals.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {profile.sustainability_goals.slice(0, 2).map((goal, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Organization cards */}
          {filteredOrganizations.map((org) => (
            <Card 
              key={org.id} 
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
              onClick={() => navigate(`/organization/${org.id}`)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={org.logo_url || undefined} />
                    <AvatarFallback>
                      <Building2 className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {org.name}
                    </CardTitle>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit">
                  {getTypeIcon(org.type)}
                  <span className="ml-1">{getTypeLabel(org.type)}</span>
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {org.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {org.description}
                  </p>
                )}
                {org.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {org.location}
                  </div>
                )}
                {org.website_url && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Globe className="w-3 h-3" />
                    <span className="truncate">{org.website_url.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Empty state */}
        {filteredProfiles.length === 0 && filteredOrganizations.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nincs találat</h3>
            <p className="text-muted-foreground">
              Próbálj meg más keresési feltételeket használni.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExploreRegionPage;
