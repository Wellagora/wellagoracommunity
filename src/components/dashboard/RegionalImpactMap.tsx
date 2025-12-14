import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Leaf, TrendingUp } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";

interface RegionData {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

const colors = ["bg-primary", "bg-success", "bg-accent", "bg-warning"];

export const RegionalImpactMap = () => {
  const { currentProject } = useProject();
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Generate regions from project villages
  const regions = useMemo(() => {
    if (!currentProject?.villages || currentProject.villages.length === 0) {
      return [];
    }

    // Position villages in a circular pattern
    const positions = [
      { x: 35, y: 35 },
      { x: 65, y: 35 },
      { x: 35, y: 65 },
      { x: 65, y: 65 },
    ];

    return currentProject.villages.slice(0, 4).map((village, index) => ({
      id: `${index + 1}`,
      name: village,
      x: positions[index]?.x || 50,
      y: positions[index]?.y || 50,
      color: colors[index % colors.length],
    }));
  }, [currentProject]);

  if (!currentProject || regions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-accent/5 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-semibold">Regional Impact Map</h3>
          <Badge variant="outline" className="gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            Live Data
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-background/50 to-muted/30 rounded-lg p-4 sm:p-8 h-64 sm:h-80 lg:h-96 border border-border/50">
              {/* Map Background Grid */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="border border-foreground/20"></div>
                  ))}
                </div>
              </div>

              {/* Region Markers */}
              {regions.map((region) => (
                <div
                  key={region.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setSelectedRegion(region)}
                >
                  {/* Pulse Effect */}
                  <div className={`absolute inset-0 ${region.color} opacity-30 rounded-full animate-ping`}></div>

                  {/* Main Marker */}
                  <div
                    className={`relative ${region.color} w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                      hoveredRegion === region.id ? "scale-150" : "scale-100"
                    } ${selectedRegion?.id === region.id ? "ring-4 ring-primary" : ""}`}
                  >
                    <MapPin className="w-4 h-4 text-white" />
                  </div>

                  {/* Hover Tooltip */}
                  {hoveredRegion === region.id && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground p-3 rounded-lg shadow-xl z-10 whitespace-nowrap animate-fade-in border border-border">
                      <p className="font-semibold">{region.name}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                {regions.map((region, i) => {
                  if (i === regions.length - 1) return null;
                  const next = regions[i + 1];
                  return (
                    <line
                      key={`line-${i}`}
                      x1={`${region.x}%`}
                      y1={`${region.y}%`}
                      x2={`${next.x}%`}
                      y2={`${next.y}%`}
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Region Details Panel */}
          <div className="space-y-4 mt-4 lg:mt-0">
            {selectedRegion ? (
              <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 animate-fade-in">
                <div>
                  <h4 className="font-semibold text-base sm:text-lg mb-1">{selectedRegion.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {selectedRegion.activeChallenges} Active Challenges
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm">Participants</span>
                    </div>
                    <span className="font-semibold">{selectedRegion.participants}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-success" />
                      <span className="text-sm">CO₂ Saved</span>
                    </div>
                    <span className="font-semibold">{selectedRegion.co2Saved}t</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-warning" />
                      <span className="text-sm">Growth</span>
                    </div>
                    <span className="font-semibold text-success">+12%</span>
                  </div>
                </div>

                <Button className="w-full" variant="default" onClick={() => setSelectedRegion(null)}>
                  View Details
                </Button>
              </div>
            ) : (
              <div className="bg-background/50 border border-border/50 border-dashed rounded-lg p-4 sm:p-8 text-center">
                <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-muted-foreground">Click on a region marker to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
