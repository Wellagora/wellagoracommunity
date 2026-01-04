import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Region {
  id: string;
  name: string;
  currency: 'HUF' | 'EUR';
  locale: string;
  country_code: string | null;
  is_active: boolean;
}

interface RegionContextType {
  currentRegion: Region;
  availableRegions: Region[];
  setCurrentRegion: (region: Region) => void;
  formatPrice: (price: number) => string;
  currency: 'HUF' | 'EUR';
  isLoading: boolean;
}

// Default region (Káli-medence)
const defaultRegion: Region = {
  id: 'kali-medence',
  name: 'Káli-medence',
  currency: 'HUF',
  locale: 'hu',
  country_code: 'HU',
  is_active: true,
};

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [currentRegion, setCurrentRegionState] = useState<Region>(defaultRegion);
  const [availableRegions, setAvailableRegions] = useState<Region[]>([defaultRegion]);
  const [isLoading, setIsLoading] = useState(true);

  // Load regions from database
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Error loading regions:', error);
          return;
        }

        if (data && data.length > 0) {
          const regions: Region[] = data.map(r => ({
            id: r.id,
            name: r.name,
            currency: (r.currency as 'HUF' | 'EUR') || 'HUF',
            locale: r.locale || 'hu',
            country_code: r.country_code,
            is_active: r.is_active ?? true,
          }));
          setAvailableRegions(regions);

          // Load saved region from localStorage or use first active
          const savedRegionId = localStorage.getItem('currentRegionId');
          const savedRegion = regions.find(r => r.id === savedRegionId);
          if (savedRegion) {
            setCurrentRegionState(savedRegion);
          } else {
            setCurrentRegionState(regions[0]);
          }
        }
      } catch (error) {
        console.error('Error loading regions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRegions();
  }, []);

  const setCurrentRegion = (region: Region) => {
    setCurrentRegionState(region);
    localStorage.setItem('currentRegionId', region.id);
  };

  // Format price based on region currency
  const formatPrice = (price: number): string => {
    if (currentRegion.currency === 'EUR') {
      return `${price.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
    }
    return `${price.toLocaleString('hu-HU')} Ft`;
  };

  return (
    <RegionContext.Provider
      value={{
        currentRegion,
        availableRegions,
        setCurrentRegion,
        formatPrice,
        currency: currentRegion.currency,
        isLoading,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}
