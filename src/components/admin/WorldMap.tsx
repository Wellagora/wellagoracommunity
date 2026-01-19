import { useState, useMemo } from 'react';
import { MapPin, ZoomIn, ZoomOut, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  name: string;
  region_name: string | null;
  country_code?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
  user_count?: number;
  currency_code?: string | null;
}

interface WorldMapProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
}

// Country coordinates and names
const COUNTRY_DATA: Record<string, { name: string; lat: number; lng: number }> = {
  'HU': { name: 'Hungary', lat: 47.16, lng: 19.50 },
  'DE': { name: 'Germany', lat: 51.16, lng: 10.45 },
  'AT': { name: 'Austria', lat: 47.52, lng: 14.55 },
  'US': { name: 'United States', lat: 37.09, lng: -95.71 },
  'GB': { name: 'United Kingdom', lat: 55.38, lng: -3.44 },
  'FR': { name: 'France', lat: 46.23, lng: 2.21 },
  'ES': { name: 'Spain', lat: 40.46, lng: -3.75 },
  'IT': { name: 'Italy', lat: 41.87, lng: 12.57 },
  'CH': { name: 'Switzerland', lat: 46.82, lng: 8.23 },
  'NL': { name: 'Netherlands', lat: 52.13, lng: 5.29 },
  'BE': { name: 'Belgium', lat: 50.50, lng: 4.47 },
  'PL': { name: 'Poland', lat: 51.92, lng: 19.15 },
  'CZ': { name: 'Czech Republic', lat: 49.82, lng: 15.47 },
  'SK': { name: 'Slovakia', lat: 48.67, lng: 19.70 },
  'RO': { name: 'Romania', lat: 45.94, lng: 24.97 },
  'UA': { name: 'Ukraine', lat: 48.38, lng: 31.17 },
  'SE': { name: 'Sweden', lat: 60.13, lng: 18.64 },
  'NO': { name: 'Norway', lat: 60.47, lng: 8.47 },
  'FI': { name: 'Finland', lat: 61.92, lng: 25.75 },
  'DK': { name: 'Denmark', lat: 56.26, lng: 9.50 },
  'PT': { name: 'Portugal', lat: 39.40, lng: -8.22 },
  'GR': { name: 'Greece', lat: 39.07, lng: 21.82 },
  'AU': { name: 'Australia', lat: -25.27, lng: 133.78 },
  'CA': { name: 'Canada', lat: 56.13, lng: -106.35 },
  'JP': { name: 'Japan', lat: 36.20, lng: 138.25 },
  'BR': { name: 'Brazil', lat: -14.24, lng: -51.93 },
  'IN': { name: 'India', lat: 20.59, lng: 78.96 },
  'CN': { name: 'China', lat: 35.86, lng: 104.20 },
};

// Currency symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  'HUF': 'Ft',
  'EUR': '€',
  'USD': '$',
  'GBP': '£',
  'CHF': 'Fr',
};

export const WorldMap = ({ projects, onProjectClick }: WorldMapProps) => {
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = world, 2 = continent, 3 = country
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Group projects by country for clustering
  const projectsByCountry = useMemo(() => {
    const grouped: Record<string, Project[]> = {};
    projects.forEach(project => {
      const country = project.country_code || 'HU';
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(project);
    });
    return grouped;
  }, [projects]);

  // Convert lat/lng to SVG coordinates (simple Mercator projection)
  const latLngToSvg = (lat: number, lng: number) => {
    // Normalize to 0-100 range
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  // Get projects to display based on zoom level
  const displayItems = useMemo(() => {
    if (zoomLevel === 1) {
      // Show country clusters
      return Object.entries(projectsByCountry).map(([country, countryProjects]) => {
        const coords = COUNTRY_DATA[country] || { lat: 47, lng: 19 };
        const pos = latLngToSvg(coords.lat, coords.lng);
        const activeCount = countryProjects.filter(p => p.is_active).length;
        return {
          type: 'cluster' as const,
          id: country,
          name: COUNTRY_DATA[country]?.name || country,
          projects: countryProjects,
          x: pos.x,
          y: pos.y,
          count: countryProjects.length,
          activeCount,
        };
      });
    } else if (zoomLevel === 2 && selectedCountry) {
      // Show individual projects in selected country
      return (projectsByCountry[selectedCountry] || []).map(project => {
        const lat = project.latitude || COUNTRY_DATA[project.country_code || 'HU']?.lat || 47;
        const lng = project.longitude || COUNTRY_DATA[project.country_code || 'HU']?.lng || 19;
        const pos = latLngToSvg(lat, lng);
        return {
          type: 'project' as const,
          ...project,
          x: pos.x,
          y: pos.y,
        };
      });
    }
    
    // Show all projects
    return projects.map(project => {
      const lat = project.latitude || COUNTRY_DATA[project.country_code || 'HU']?.lat || 47;
      const lng = project.longitude || COUNTRY_DATA[project.country_code || 'HU']?.lng || 19;
      const pos = latLngToSvg(lat, lng);
      return {
        type: 'project' as const,
        ...project,
        x: pos.x,
        y: pos.y,
      };
    });
  }, [projects, projectsByCountry, zoomLevel, selectedCountry]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      if (prev <= 1) {
        setSelectedCountry(null);
      }
      return Math.max(prev - 1, 1);
    });
  };

  const handleClusterClick = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setZoomLevel(2);
  };

  return (
    <div className="relative w-full aspect-[2/1] bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20 rounded-xl border border-border overflow-hidden">
      {/* SVG World Map Background */}
      <svg
        viewBox="0 0 100 50"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Simplified continents */}
        <g fill="hsl(var(--muted))" fillOpacity="0.4" stroke="hsl(var(--border))" strokeWidth="0.2">
          {/* North America */}
          <path d="M 5 10 Q 15 8, 25 12 L 28 18 Q 25 25, 20 28 L 12 25 Q 5 20, 5 10 Z" />
          {/* South America */}
          <path d="M 20 30 Q 25 28, 28 32 L 30 42 Q 28 48, 22 45 L 18 38 Q 18 32, 20 30 Z" />
          {/* Europe */}
          <path d="M 45 10 Q 52 8, 58 12 L 55 18 Q 50 20, 45 18 L 42 14 Q 43 10, 45 10 Z" />
          {/* Africa */}
          <path d="M 45 22 Q 55 20, 58 28 L 55 42 Q 48 45, 42 38 L 40 28 Q 42 22, 45 22 Z" />
          {/* Asia */}
          <path d="M 58 8 Q 75 5, 88 12 L 90 25 Q 85 32, 75 30 L 65 25 Q 58 18, 58 8 Z" />
          {/* Australia */}
          <path d="M 78 35 Q 88 32, 92 38 L 90 44 Q 82 46, 78 42 L 76 38 Q 76 35, 78 35 Z" />
        </g>
        
        {/* Grid lines */}
        <g stroke="hsl(var(--border))" strokeWidth="0.1" strokeOpacity="0.3">
          {[0, 25, 50, 75, 100].map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="50" />
          ))}
          {[0, 12.5, 25, 37.5, 50].map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} />
          ))}
        </g>
      </svg>

      {/* Markers */}
      {displayItems.map((item) => (
        <div
          key={item.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
          style={{
            left: `${item.x}%`,
            top: `${item.y * 2}%`, // Adjust for aspect ratio
          }}
          onMouseEnter={() => setHoveredProject(item.id)}
          onMouseLeave={() => setHoveredProject(null)}
          onClick={() => {
            if (item.type === 'cluster') {
              handleClusterClick(item.id);
            } else {
              onProjectClick(item.id);
            }
          }}
        >
          {item.type === 'cluster' ? (
            // Cluster marker
            <>
              <div className="absolute inset-0 w-12 h-12 -m-4 rounded-full bg-primary/20 animate-pulse" />
              <div
                className={cn(
                  "relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
                  "bg-gradient-to-br from-emerald-500 to-blue-500 hover:scale-110",
                  hoveredProject === item.id && "scale-125 ring-4 ring-primary/30"
                )}
              >
                <span className="text-white font-bold text-sm">{item.count}</span>
              </div>
              {hoveredProject === item.id && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-xl z-20 whitespace-nowrap border border-border animate-in fade-in zoom-in-95 duration-200">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.count} projekt</p>
                  <p className="text-xs text-emerald-600">{item.activeCount} aktív</p>
                </div>
              )}
            </>
          ) : (
            // Project marker
            <>
              {'is_active' in item && item.is_active && (
                <div className="absolute inset-0 w-8 h-8 -m-2 rounded-full bg-emerald-500/30 animate-ping" />
              )}
              <div
                className={cn(
                  "relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
                  'is_active' in item && item.is_active
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-gray-400 hover:bg-gray-500",
                  "hover:scale-125",
                  hoveredProject === item.id && "scale-125 ring-4 ring-primary/30"
                )}
              >
                <MapPin className="w-4 h-4 text-white" />
              </div>
              {hoveredProject === item.id && 'name' in item && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-xl z-20 whitespace-nowrap border border-border animate-in fade-in zoom-in-95 duration-200">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.city || item.region_name}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span>{item.user_count || 0} résztvevő</span>
                    {item.currency_code && (
                      <Badge variant="outline" className="text-[10px] px-1">
                        {CURRENCY_SYMBOLS[item.currency_code] || item.currency_code}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoomLevel >= 3}
          className="bg-background/80 backdrop-blur-sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoomLevel <= 1}
          className="bg-background/80 backdrop-blur-sm"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Aktív</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Inaktív</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">N</span>
            </div>
            <span>Klaszter</span>
          </div>
        </div>
      </div>

      {/* Zoom level & country indicator */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
        <div className="flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {zoomLevel === 1 && 'Világ nézet'}
            {zoomLevel === 2 && selectedCountry && COUNTRY_DATA[selectedCountry]?.name}
            {zoomLevel === 3 && 'Részletes nézet'}
          </span>
          <Badge variant="outline">{projects.length} projekt</Badge>
        </div>
      </div>
    </div>
  );
};
