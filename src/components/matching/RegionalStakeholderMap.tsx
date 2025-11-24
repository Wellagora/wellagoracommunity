import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { toast } = useToast();
  const { t } = useLanguage();

  const getStakeholderColor = (type: string) => {
    switch (type) {
      case 'citizen': return 'rgba(16, 185, 129, 1)'; // emerald green
      case 'business': return 'rgba(59, 130, 246, 1)'; // bright blue
      case 'government': return 'rgba(239, 68, 68, 1)'; // vibrant red
      case 'ngo': return 'rgba(245, 158, 11, 1)'; // golden yellow
      default: return 'rgba(107, 114, 128, 1)';
    }
  };

  const getStakeholderIcon = (type: string) => {
    switch (type) {
      case 'citizen': 
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>`;
      case 'business': 
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
        </svg>`;
      case 'government': 
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1L2 6v2h20V6M2 19v2h20v-2M10 10v9h4v-9M5 10v9h2v-9M17 10v9h2v-9"/>
        </svg>`;
      case 'ngo': 
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>`;
      default: 
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>`;
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

      // Create custom icon with modern design
      const iconHtml = `
        <div class="stakeholder-marker-wrapper" style="
          position: relative;
          width: 72px;
          height: 72px;
        ">
          <div class="pulse-ring" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: ${getStakeholderColor(stakeholder.type)};
            opacity: 0.3;
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: ${getStakeholderColor(stakeholder.type)};
            border: 4px solid white;
            box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 0 0 2px ${getStakeholderColor(stakeholder.type)}40;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          " 
          onmouseover="this.style.transform='translate(-50%, -50%) scale(1.15)'"
          onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'">
            ${getStakeholderIcon(stakeholder.type)}
          </div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% {
              opacity: 0.3;
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              opacity: 0.1;
              transform: translate(-50%, -50%) scale(1.2);
            }
          }
        </style>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'stakeholder-marker-custom',
        iconSize: [72, 72],
        iconAnchor: [36, 36],
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
      <div ref={mapContainer} className="w-full h-full rounded-2xl shadow-2xl overflow-hidden border-2 border-primary/10" style={{ minHeight: '500px' }} />
      
      {/* Modern Legend with Glassmorphism */}
      <div className="absolute top-6 left-6 z-[1000]">
        <div className="bg-background/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 min-w-[200px]">
          <div className="space-y-3">
            <div className="flex items-center gap-3 group cursor-pointer hover:translate-x-1 transition-transform">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 1)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{t('explore.type_citizen')}</span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer hover:translate-x-1 transition-transform">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 1)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 7V3H2v18h20V7H12z"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{t('explore.type_business')}</span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer hover:translate-x-1 transition-transform">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 1)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L2 6v2h20V6M10 10v9h4v-9"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{t('explore.type_government')}</span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer hover:translate-x-1 transition-transform">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 1)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{t('explore.type_ngo')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Stakeholder Card - Modern Design */}
      {selectedStakeholder && (
        <div className="absolute bottom-6 left-6 right-6 z-[1000] max-w-md mx-auto">
          <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 transform transition-all duration-300 animate-in slide-in-from-bottom">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{selectedStakeholder.avatar || '📍'}</div>
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{selectedStakeholder.name}</h4>
                    {selectedStakeholder.organization && (
                      <p className="text-sm text-muted-foreground">{selectedStakeholder.organization}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedStakeholder(null)}
                  className="rounded-full hover:bg-destructive/20 hover:text-destructive"
                >
                  ✕
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <MapPin className="w-4 h-4" />
                <span>{selectedStakeholder.city || selectedStakeholder.location}</span>
              </div>
              
              {selectedStakeholder.bio && (
                <p className="text-sm text-foreground leading-relaxed">{selectedStakeholder.bio}</p>
              )}
              
              {selectedStakeholder.sustainability_goals && selectedStakeholder.sustainability_goals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedStakeholder.sustainability_goals.slice(0, 3).map((goal, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                      {goal}
                    </Badge>
                  ))}
                </div>
              )}
              
              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                onClick={() => {
                  toast({
                    title: t('explore.contact_initiated'),
                    description: t('explore.contact_initiated_desc').replace('{{name}}', selectedStakeholder.name),
                  });
                  setSelectedStakeholder(null);
                }}
              >
                {t('explore.contact')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionalStakeholderMap;
