import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Calendar, Building2, Users, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NearbyStakeholder {
  id: string;
  name: string;
  type: string;
  distance_km: number;
  avatar_url?: string;
}

interface NearbyEvent {
  id: string;
  title: string;
  start_date: string;
  location_name?: string;
  distance_km?: number;
}

export const NearbyWidget = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stakeholders, setStakeholders] = useState<NearbyStakeholder[]>([]);
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const requestLocation = () => {
    setLoading(true);
    setLocationError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          // Geolocation error
          setLocationError(t('nearby.location_denied') || 'Helymeghatározás nem engedélyezett');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError(t('nearby.location_not_supported') || 'Helymeghatározás nem támogatott');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    requestLocation();
  }, [user]);

  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyData = async () => {
      setLoading(true);
      try {
        // Fetch nearby stakeholders using RPC
        const { data: stakeholderData, error: stakeholderError } = await supabase
          .rpc('find_nearby_stakeholders', {
            p_latitude: userLocation.lat,
            p_longitude: userLocation.lng,
            p_radius_meters: 50000, // 50km in meters
            p_limit: 3
          });

        if (!stakeholderError && stakeholderData) {
          setStakeholders(stakeholderData.map((s: any) => ({
            id: s.id,
            name: s.organization || `${s.first_name} ${s.last_name}`,
            type: s.user_role,
            distance_km: (s.distance_meters || 0) / 1000,
            avatar_url: s.avatar_url
          })));
        }

        // Fetch nearby events (using simple query for now)
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('id, title, start_date, location_name')
          .gte('start_date', new Date().toISOString())
          .eq('is_public', true)
          .eq('status', 'published')
          .order('start_date', { ascending: true })
          .limit(3);

        if (!eventError && eventData) {
          setEvents(eventData);
        }
      } catch (error) {
        console.error('Error fetching nearby data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyData();
  }, [userLocation]);

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'business':
        return <Building2 className="w-3 h-3" />;
      case 'ngo':
      case 'government':
        return <Users className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#00E5FF]" />
          <span className="text-foreground">{t('nearby.title') || 'Keresés a közelemben'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#00E5FF]" />
          </div>
        ) : locationError ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="p-3 rounded-full bg-[#00E5FF]/10">
              <AlertCircle className="w-8 h-8 text-[#00E5FF]" />
            </div>
            <p className="text-sm text-[#B0C4DE]">{locationError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={requestLocation}
              className="border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('nearby.retry') || 'Próbáld újra'}
            </Button>
          </div>
        ) : (
          <>
            {/* Nearby Partners */}
            {stakeholders.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[#B0C4DE] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#00E5FF]" />
                  {t('nearby.partners') || 'Közeli partnerek'}
                </h4>
                <div className="space-y-2">
                  {stakeholders.map((stakeholder) => (
                    <div
                      key={stakeholder.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-[#0A1930]/50 hover:bg-[#0A1930]/80 transition-colors cursor-pointer border border-border/20"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={stakeholder.avatar_url} />
                        <AvatarFallback className="bg-[#00E5FF]/20 text-[#00E5FF] text-xs">
                          {stakeholder.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {stakeholder.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs py-0 border-[#00E5FF]/30 text-[#B0C4DE]">
                            {getRoleIcon(stakeholder.type)}
                            <span className="ml-1">{t(`roles.${stakeholder.type}`) || stakeholder.type}</span>
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-[#00E5FF]">
                        <MapPin className="w-3 h-3" />
                        {formatDistance(stakeholder.distance_km)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Events */}
            {events.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[#B0C4DE] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00E5FF]" />
                  {t('nearby.events') || 'Közelgő események'}
                </h4>
                <div className="space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-[#0A1930]/50 hover:bg-[#0A1930]/80 transition-colors cursor-pointer border border-border/20"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/20 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-[#00E5FF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-[#B0C4DE]">
                          {new Date(event.start_date).toLocaleDateString('hu-HU', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {event.location_name && (
                        <div className="flex items-center gap-1 text-xs text-[#B0C4DE]">
                          <MapPin className="w-3 h-3 text-[#00E5FF]" />
                          <span className="truncate max-w-[60px]">{event.location_name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stakeholders.length === 0 && events.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-[#B0C4DE]">
                  {t('nearby.no_results') || 'Nincs közeli partner vagy esemény'}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NearbyWidget;