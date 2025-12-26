import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Sprout } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import StakeholderFilters from '@/components/matching/StakeholderFilters';
import ModernRegionalVisualization from '@/components/matching/ModernRegionalVisualization';
import { ProfileGridSkeleton, MapSkeleton } from '@/components/ui/skeletons';
import type { StakeholderProfile } from '@/hooks/useRegionalHub';

interface RegionalStakeholderListProps {
  stakeholders: StakeholderProfile[];
  loading: boolean;
  selectedTypes: string[];
  searchQuery: string;
  regionName: string;
  onTypeToggle: (type: string) => void;
  onSearchChange: (query: string) => void;
  onContactClick: (name: string, userId: string) => void;
  onStakeholderClick: (stakeholder: StakeholderProfile) => void;
}

export const RegionalStakeholderList = ({
  stakeholders,
  loading,
  selectedTypes,
  searchQuery,
  regionName,
  onTypeToggle,
  onSearchChange,
  onContactClick,
  onStakeholderClick,
}: RegionalStakeholderListProps) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-6">
        <StakeholderFilters
          selectedTypes={selectedTypes}
          onTypeToggle={onTypeToggle}
          selectedRegion={regionName}
          onRegionChange={() => {}}
          regions={[]}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          totalCount={0}
        />
        <MapSkeleton />
        <ProfileGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StakeholderFilters
        selectedTypes={selectedTypes}
        onTypeToggle={onTypeToggle}
        selectedRegion={regionName}
        onRegionChange={() => {}}
        regions={[]}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        totalCount={stakeholders.length}
      />

      {stakeholders.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">{t('regional.no_stakeholders')}</h3>
          <p className="text-muted-foreground">{t('regional.no_stakeholders_desc')}</p>
        </Card>
      ) : (
        <>
          <ModernRegionalVisualization
            stakeholders={stakeholders.map(p => ({
              id: p.id,
              name: p.name,
              type: p.type,
              organization: p.organization,
              location: p.location,
              region: p.region,
              city: p.city,
              district: p.city,
              latitude: p.latitude,
              longitude: p.longitude,
              bio: p.description,
              sustainability_goals: p.sustainabilityGoals,
              avatar: p.avatar,
              impactScore: p.impactScore
            }))}
            onStakeholderClick={(stakeholder) => {
              const original = stakeholders.find(s => s.id === stakeholder.id);
              if (original) onStakeholderClick(original);
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stakeholders.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {profile.avatar.startsWith('http') ? (
                        <img 
                          src={profile.avatar} 
                          alt={profile.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="text-4xl">👤</div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="text-4xl">{profile.avatar}</div>
                      )}
                      <div>
                        <CardTitle className="text-base">{profile.name}</CardTitle>
                        {profile.organization && (
                          <p className="text-xs text-muted-foreground">{profile.organization}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={profile.isRegistered ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>
                      {profile.isRegistered ? t('regional.registered_badge') : t('regional.potential_badge')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{profile.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {profile.sustainabilityGoals.slice(0, 2).map((goal, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        <Sprout className="w-3 h-3 mr-1" />
                        {goal}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    onClick={() => {
                      if (profile.isRegistered) {
                        onContactClick(profile.name, profile.id);
                      }
                    }}
                  >
                    {profile.isRegistered ? t('regional.contact') : t('regional.send_invite')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
