import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Building2, Users, MapPin, Target, Search } from "lucide-react";

interface StakeholderFiltersProps {
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  regions: { id: string; name: string; count?: number }[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
}

const StakeholderFilters = ({
  selectedTypes,
  onTypeToggle,
  selectedRegion,
  onRegionChange,
  regions,
  searchQuery,
  onSearchChange,
  totalCount,
}: StakeholderFiltersProps) => {
  const stakeholderTypes = [
    { id: 'citizen', name: 'Magánszemély', icon: User, color: 'bg-success' },
    { id: 'business', name: 'Cég', icon: Building2, color: 'bg-primary' },
    { id: 'government', name: 'Önkormányzat', icon: MapPin, color: 'bg-destructive' },
    { id: 'ngo', name: 'Civil szervezet', icon: Users, color: 'bg-warning' },
  ];

  return (
    <Card className="p-4 sm:p-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Keresés név vagy szervezet alapján..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stakeholder Types */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Stakeholder típus
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stakeholderTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedTypes.includes(type.id);
            return (
              <Button
                key={type.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onTypeToggle(type.id)}
                className={`justify-start ${isSelected ? type.color : ''}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {type.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Regions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Régió
        </h3>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <Button
              key={region.id}
              variant={selectedRegion === region.id ? "default" : "outline"}
              size="sm"
              onClick={() => onRegionChange(region.id)}
            >
              {region.name}
              {region.count !== undefined && (
                <Badge variant="secondary" className="ml-2">
                  {region.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalCount}</span> stakeholder található
        </p>
      </div>
    </Card>
  );
};

export default StakeholderFilters;
