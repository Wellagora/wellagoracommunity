import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Users, MapPin } from "lucide-react";

interface Stakeholder {
  id: string;
  name: string;
  type: 'citizen' | 'business' | 'government' | 'ngo';
  organization?: string;
  location: string;
  region: string;
  city?: string;
  district?: string;
  latitude: number;
  longitude: number;
  bio?: string;
  sustainability_goals?: string[];
  avatar?: string;
}

interface RegionalStakeholderMapProps {
  stakeholders: Stakeholder[];
  onStakeholderClick?: (stakeholder: Stakeholder) => void;
  center?: [number, number];
  zoom?: number;
}

const RegionalStakeholderMap = ({ 
  stakeholders, 
  onStakeholderClick,
  center = [19.0402, 47.4979], // Budapest
  zoom = 10
}: RegionalStakeholderMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  const getStakeholderColor = (type: string) => {
    switch (type) {
      case 'citizen': return '#10b981'; // green
      case 'business': return '#3b82f6'; // blue
      case 'government': return '#ef4444'; // red
      case 'ngo': return '#f59e0b'; // yellow
      default: return '#6b7280';
    }
  };

  const getStakeholderIcon = (type: string) => {
    switch (type) {
      case 'citizen': return '👤';
      case 'business': return '🏢';
      case 'government': return '🏛️';
      case 'ngo': return '🌱';
      default: return '📍';
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [mapboxToken, center, zoom]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each stakeholder
    stakeholders.forEach((stakeholder) => {
      if (!stakeholder.latitude || !stakeholder.longitude) return;

      const el = document.createElement('div');
      el.className = 'stakeholder-marker';
      el.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${getStakeholderColor(stakeholder.type)};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
          transition: transform 0.2s;
        ">
          ${getStakeholderIcon(stakeholder.type)}
        </div>
      `;
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      el.addEventListener('click', () => {
        setSelectedStakeholder(stakeholder);
        onStakeholderClick?.(stakeholder);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([stakeholder.longitude, stakeholder.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit map to markers
    if (stakeholders.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      stakeholders.forEach(s => {
        if (s.latitude && s.longitude) {
          bounds.extend([s.longitude, s.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [stakeholders, onStakeholderClick]);

  if (!mapboxToken) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Mapbox API kulcs szükséges</h3>
          <p className="text-sm text-muted-foreground">
            A térkép megjelenítéséhez add meg a Mapbox public token-t:
          </p>
          <input
            type="text"
            placeholder="pk.eyJ1..."
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Token beszerzése: <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
      
      {/* Legend */}
      <Card className="absolute top-4 left-4 p-3 bg-card/95 backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span>Magánszemély</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>Cég</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span>Önkormányzat</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span>Civil szervezet</span>
          </div>
        </div>
      </Card>

      {/* Selected Stakeholder Card */}
      {selectedStakeholder && (
        <Card className="absolute bottom-4 left-4 right-4 p-4 bg-card/95 backdrop-blur-sm max-w-md">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedStakeholder.avatar || getStakeholderIcon(selectedStakeholder.type)}</div>
                <div>
                  <h4 className="font-semibold text-foreground">{selectedStakeholder.name}</h4>
                  {selectedStakeholder.organization && (
                    <p className="text-xs text-muted-foreground">{selectedStakeholder.organization}</p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedStakeholder(null)}>✕</Button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{selectedStakeholder.city || selectedStakeholder.location}</span>
            </div>
            
            {selectedStakeholder.bio && (
              <p className="text-sm text-foreground line-clamp-2">{selectedStakeholder.bio}</p>
            )}
            
            {selectedStakeholder.sustainability_goals && selectedStakeholder.sustainability_goals.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedStakeholder.sustainability_goals.slice(0, 3).map((goal, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{goal}</Badge>
                ))}
              </div>
            )}
            
            <Button className="w-full" size="sm">Kapcsolatfelvétel</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RegionalStakeholderMap;
