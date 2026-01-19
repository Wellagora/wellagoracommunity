import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  region_name: string | null;
  is_active: boolean;
  user_count?: number;
}

interface HungaryMapProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
}

// Hungarian cities with approximate SVG coordinates (normalized 0-100)
const CITY_COORDINATES: Record<string, { x: number; y: number }> = {
  'Budapest': { x: 55, y: 42 },
  'Győr': { x: 35, y: 32 },
  'Veszprém': { x: 42, y: 50 },
  'Balaton-felvidék': { x: 40, y: 55 },
  'Káli-medence': { x: 42, y: 53 },
  'Szeged': { x: 65, y: 75 },
  'Debrecen': { x: 78, y: 38 },
  'Pécs': { x: 45, y: 72 },
  'Miskolc': { x: 72, y: 28 },
  'Nyíregyháza': { x: 80, y: 30 },
  'Kecskemét': { x: 60, y: 58 },
  'Székesfehérvár': { x: 48, y: 48 },
  'Szombathely': { x: 22, y: 40 },
  'Eger': { x: 68, y: 32 },
  'Őrség': { x: 20, y: 52 },
  'Sopron': { x: 18, y: 32 },
  'Zalaegerszeg': { x: 28, y: 55 },
  'Kaposvár': { x: 38, y: 65 },
  'Békéscsaba': { x: 75, y: 58 },
  'Szolnok': { x: 65, y: 45 },
};

export const HungaryMap = ({ projects, onProjectClick }: HungaryMapProps) => {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  // Map projects to coordinates
  const projectsWithCoords = projects.map(project => {
    const region = project.region_name || '';
    // Try to find matching coordinates
    const coords = CITY_COORDINATES[region] || 
      Object.entries(CITY_COORDINATES).find(([key]) => 
        region.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(region.toLowerCase())
      )?.[1] ||
      { x: 50 + Math.random() * 20 - 10, y: 50 + Math.random() * 20 - 10 };
    
    return { ...project, coords };
  });

  return (
    <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl border border-border overflow-hidden">
      {/* SVG Hungary Map Outline */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Simplified Hungary outline */}
        <path
          d="M 15 30 
             Q 20 25, 30 28 
             L 45 25 
             Q 55 22, 65 25 
             L 80 28 
             Q 88 30, 90 35 
             L 92 45 
             Q 90 55, 85 60 
             L 78 68 
             Q 70 75, 60 78 
             L 48 80 
             Q 35 78, 25 72 
             L 18 62 
             Q 12 50, 15 40 
             Z"
          fill="hsl(var(--muted))"
          fillOpacity="0.3"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />
        
        {/* Lake Balaton */}
        <ellipse
          cx="40"
          cy="54"
          rx="8"
          ry="2"
          fill="hsl(210 100% 70%)"
          fillOpacity="0.4"
        />
        
        {/* Grid lines for reference */}
        <g stroke="hsl(var(--border))" strokeWidth="0.1" strokeOpacity="0.3">
          {[20, 40, 60, 80].map(x => (
            <line key={`v${x}`} x1={x} y1="20" x2={x} y2="85" />
          ))}
          {[30, 45, 60, 75].map(y => (
            <line key={`h${y}`} x1="10" y1={y} x2="95" y2={y} />
          ))}
        </g>
      </svg>

      {/* Project Markers */}
      {projectsWithCoords.map((project) => (
        <div
          key={project.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
          style={{
            left: `${project.coords.x}%`,
            top: `${project.coords.y}%`,
          }}
          onMouseEnter={() => setHoveredProject(project.id)}
          onMouseLeave={() => setHoveredProject(null)}
          onClick={() => onProjectClick(project.id)}
        >
          {/* Pulse ring for active projects */}
          {project.is_active && (
            <div className="absolute inset-0 w-8 h-8 -m-2 rounded-full bg-emerald-500/30 animate-ping" />
          )}
          
          {/* Main marker */}
          <div
            className={cn(
              "relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
              project.is_active 
                ? "bg-emerald-500 hover:bg-emerald-600 hover:scale-125" 
                : "bg-gray-400 hover:bg-gray-500 hover:scale-110",
              hoveredProject === project.id && "scale-125 ring-4 ring-primary/30"
            )}
          >
            <MapPin className="w-4 h-4 text-white" />
          </div>

          {/* Hover tooltip */}
          {hoveredProject === project.id && (
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-xl z-20 whitespace-nowrap border border-border animate-in fade-in zoom-in-95 duration-200">
              <p className="font-semibold text-sm">{project.name}</p>
              <p className="text-xs text-muted-foreground">{project.region_name}</p>
              <p className="text-xs text-muted-foreground">{project.user_count || 0} résztvevő</p>
            </div>
          )}
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Aktív projekt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Inaktív</span>
          </div>
        </div>
      </div>

      {/* Total projects badge */}
      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
        <p className="text-sm font-medium">{projects.length} projekt</p>
      </div>
    </div>
  );
};
