import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

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
  center = [47.4979, 19.0402], // Budapest (lat, lng for Leaflet)
  zoom = 10
}: RegionalStakeholderMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
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
    if (!mapContainer.current || map.current) return;

    // Initialize Leaflet map with OpenStreetMap
    map.current = L.map(mapContainer.current).setView(center, zoom);

    // Add OpenStreetMap tile layer (free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each stakeholder
    stakeholders.forEach((stakeholder) => {
      if (!stakeholder.latitude || !stakeholder.longitude) return;

      // Create custom icon
      const iconHtml = `
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

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'stakeholder-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([stakeholder.latitude, stakeholder.longitude], {
        icon: customIcon,
      }).addTo(map.current!);

      marker.on('click', () => {
        setSelectedStakeholder(stakeholder);
        onStakeholderClick?.(stakeholder);
      });

      markersRef.current.push(marker);
    });

    // Fit map to markers
    if (stakeholders.length > 0) {
      const bounds = L.latLngBounds(
        stakeholders
          .filter(s => s.latitude && s.longitude)
          .map(s => [s.latitude, s.longitude] as [number, number])
      );
      map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [stakeholders, onStakeholderClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" style={{ minHeight: '500px' }} />
      
      {/* Legend */}
      <Card className="absolute top-4 left-4 p-3 bg-card/95 backdrop-blur-sm z-[1000]">
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
        <Card className="absolute bottom-4 left-4 right-4 p-4 bg-card/95 backdrop-blur-sm max-w-md z-[1000]">
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
