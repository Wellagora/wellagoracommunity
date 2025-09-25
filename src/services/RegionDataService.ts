import { Region } from '@/components/dynamic/RegionSelector';

export interface StakeholderData {
  id: string;
  name: string;
  type: 'municipality' | 'business' | 'ngo' | 'citizen' | 'educational' | 'government';
  category: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  impactScore: number;
  challengesActive: number;
  co2Reduction: number;
  connections: string[];
  description: string;
  website?: string;
  contact?: string;
}

export interface ChallengeData {
  id: string;
  title: string;
  description: string;
  type: 'energy' | 'transport' | 'waste' | 'water' | 'biodiversity' | 'community';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  participants: number;
  co2Impact: number;
  duration: string;
  status: 'active' | 'completed' | 'upcoming';
  regionSpecific: boolean;
  requirements: string[];
}

export interface RegionMetrics {
  co2Reduction: number;
  co2Goal: number;
  energyEfficiency: number;
  wasteReduction: number;
  greenTransport: number;
  biodiversityIndex: number;
  communityEngagement: number;
  economicImpact: number;
}

export interface RegionalData {
  region: Region;
  stakeholders: StakeholderData[];
  challenges: ChallengeData[];
  metrics: RegionMetrics;
  demographics: {
    population: number;
    averageAge: number;
    educationLevel: number;
    incomeLevel: number;
  };
  infrastructure: {
    publicTransport: number;
    renewableEnergy: number;
    recyclingRate: number;
    greenSpaces: number;
  };
  realTimeData: {
    airQuality: number;
    energyConsumption: number;
    trafficDensity: number;
    temperature: number;
  };
}

class RegionDataService {
  private cache = new Map<string, RegionalData>();
  
  // Simulate API delay
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Fetch comprehensive regional data
   */
  async fetchRegionalData(region: Region): Promise<RegionalData> {
    // Check cache first
    if (this.cache.has(region.id)) {
      await this.delay(200); // Simulate faster cache retrieval
      return this.cache.get(region.id)!;
    }

    // Simulate API call
    await this.delay(1000 + Math.random() * 1000);

    const data = this.generateRegionalData(region);
    this.cache.set(region.id, data);
    return data;
  }

  /**
   * Generate region-specific stakeholders
   */
  private generateStakeholders(region: Region): StakeholderData[] {
    const stakeholders: StakeholderData[] = [];
    const baseCount = this.getStakeholderCountByRegionType(region.type);
    
    // Generate different types of stakeholders
    const types: StakeholderData['type'][] = ['municipality', 'business', 'ngo', 'citizen', 'educational', 'government'];
    
    for (let i = 0; i < baseCount; i++) {
      const type = types[i % types.length];
      const stakeholder = this.createStakeholder(region, type, i);
      stakeholders.push(stakeholder);
    }

    return stakeholders;
  }

  private createStakeholder(region: Region, type: StakeholderData['type'], index: number): StakeholderData {
    // Generate coordinates within region bounds
    const bounds = region.bounds || {
      north: region.coordinates.lat + 0.1,
      south: region.coordinates.lat - 0.1,
      east: region.coordinates.lng + 0.1,
      west: region.coordinates.lng - 0.1
    };

    const lat = bounds.south + Math.random() * (bounds.north - bounds.south);
    const lng = bounds.west + Math.random() * (bounds.east - bounds.west);

    const names = this.getStakeholderNames(type, region.language);
    const categories = this.getStakeholderCategories(type);

    return {
      id: `${region.id}-${type}-${index}`,
      name: names[index % names.length],
      type,
      category: categories[Math.floor(Math.random() * categories.length)],
      coordinates: { lat, lng },
      impactScore: 50 + Math.random() * 50,
      challengesActive: Math.floor(Math.random() * 15) + 1,
      co2Reduction: Math.floor(Math.random() * 5000) + 100,
      connections: [], // Will be populated based on proximity and compatibility
      description: this.generateStakeholderDescription(type, region.language),
      website: `https://${names[index % names.length].toLowerCase().replace(/\s+/g, '')}.${region.language}`,
      contact: `contact@${names[index % names.length].toLowerCase().replace(/\s+/g, '')}.${region.language}`
    };
  }

  private getStakeholderCountByRegionType(type: Region['type']): number {
    switch (type) {
      case 'country': return 50;
      case 'state': return 30;
      case 'city': return 20;
      case 'district': return 12;
      case 'municipality': return 8;
      default: return 10;
    }
  }

  private getStakeholderNames(type: StakeholderData['type'], language: string): string[] {
    const names: Record<string, Record<StakeholderData['type'], string[]>> = {
      de: {
        municipality: ['Bezirksamt Wien', 'Stadtgemeinde', 'Magistrat', 'Gemeindeverwaltung'],
        business: ['GreenTech Wien GmbH', 'Nachhaltige Energien AG', 'Öko Solutions', 'CleanCity Services'],
        ngo: ['Umwelt Austria', 'Grüne Zukunft Verein', 'Klimaschutz Initiative', 'Nachhaltig Leben'],
        citizen: ['Bürgerinitiative Klima', 'Nachbarschaftsgruppe', 'Lokale Gemeinschaft', 'Aktive Bürger'],
        educational: ['Universität Wien', 'Technische Hochschule', 'Nachhaltigkeits Institut', 'Forschungszentrum'],
        government: ['Umweltministerium', 'Energieagentur', 'Klimaschutz Behörde', 'Nachhaltigkeits Amt']
      },
      hu: {
        municipality: ['Önkormányzat', 'Polgármesteri Hivatal', 'Városi Tanács', 'Települési Kormány'],
        business: ['Zöld Technológia Kft', 'Fenntartható Energia Zrt', 'Öko Megoldások', 'Tiszta Város Szolg'],
        ngo: ['Környezetvédelmi Egyesület', 'Zöld Jövő Alapítvány', 'Klímavédő Szervezet', 'Fenntartható Élet'],
        citizen: ['Polgári Kezdeményezés', 'Szomszédsági Csoport', 'Helyi Közösség', 'Aktív Állampolgárok'],
        educational: ['Budapesti Egyetem', 'Műszaki Főiskola', 'Fenntarthatósági Intézet', 'Kutatóközpont'],
        government: ['Környezetvédelmi Minisztérium', 'Energiaügynökség', 'Klímavédelmi Hivatal', 'Fenntarthatósági Osztály']
      },
      en: {
        municipality: ['City Council', 'Municipal Office', 'Local Government', 'District Administration'],
        business: ['GreenTech Solutions Ltd', 'Sustainable Energy Corp', 'Eco Innovations', 'CleanCity Services'],
        ngo: ['Environmental Alliance', 'Green Future Foundation', 'Climate Action Group', 'Sustainable Living Org'],
        citizen: ['Citizens Climate Initiative', 'Neighborhood Group', 'Local Community', 'Active Citizens Network'],
        educational: ['University Research Center', 'Technical Institute', 'Sustainability Academy', 'Innovation Hub'],
        government: ['Environment Ministry', 'Energy Agency', 'Climate Protection Office', 'Sustainability Department']
      }
    };

    return names[language]?.[type] || names.en[type];
  }

  private getStakeholderCategories(type: StakeholderData['type']): string[] {
    const categories: Record<StakeholderData['type'], string[]> = {
      municipality: ['Urban Planning', 'Public Services', 'Infrastructure', 'Policy Making'],
      business: ['Clean Technology', 'Renewable Energy', 'Sustainable Products', 'Green Services'],
      ngo: ['Environmental Protection', 'Climate Action', 'Community Engagement', 'Education & Awareness'],
      citizen: ['Community Organizing', 'Local Advocacy', 'Sustainable Living', 'Volunteer Network'],
      educational: ['Research & Development', 'Education & Training', 'Innovation', 'Knowledge Transfer'],
      government: ['Policy Implementation', 'Regulation', 'Public Administration', 'Strategic Planning']
    };

    return categories[type];
  }

  private generateStakeholderDescription(type: StakeholderData['type'], language: string): string {
    const descriptions: Record<string, Record<StakeholderData['type'], string[]>> = {
      de: {
        municipality: ['Führend in nachhaltiger Stadtentwicklung', 'Umsetzung grüner Stadtprojekte', 'Förderung erneuerbarer Energien'],
        business: ['Innovative Lösungen für Klimaschutz', 'Nachhaltige Geschäftspraktiken', 'Grüne Technologie-Entwicklung'],
        ngo: ['Umweltschutz und Bildung', 'Gemeinschaftsbasierte Klimainitiativen', 'Förderung nachhaltiger Lebensstile'],
        citizen: ['Aktive Beteiligung an lokalen Projekten', 'Förderung des Umweltbewusstseins', 'Bürgerinitiativen für Nachhaltigkeit'],
        educational: ['Forschung zu Klimawandel', 'Bildung für nachhaltige Entwicklung', 'Innovation in grünen Technologien'],
        government: ['Umsetzung von Klimazielen', 'Entwicklung nachhaltiger Policies', 'Koordination regionaler Initiativen']
      },
      hu: {
        municipality: ['Vezető szerepe a fenntartható városfejlesztésben', 'Zöld városi projektek megvalósítása', 'Megújuló energiák támogatása'],
        business: ['Innovatív megoldások a klímavédelemért', 'Fenntartható üzleti gyakorlatok', 'Zöld technológia fejlesztés'],
        ngo: ['Környezetvédelem és oktatás', 'Közösségi klímakezdeményezések', 'Fenntartható életmód népszerűsítése'],
        citizen: ['Aktív részvétel helyi projektekben', 'Környezeti tudatosság növelése', 'Polgári kezdeményezések a fenntarthatóságért'],
        educational: ['Klímaváltozás kutatása', 'Oktatás a fenntartható fejlődésért', 'Innováció zöld technológiákban'],
        government: ['Klímacélok megvalósítása', 'Fenntartható politikák fejlesztése', 'Regionális kezdeményezések koordinációja']
      },
      en: {
        municipality: ['Leading sustainable urban development', 'Implementing green city projects', 'Promoting renewable energy'],
        business: ['Innovative solutions for climate protection', 'Sustainable business practices', 'Green technology development'],
        ngo: ['Environmental protection and education', 'Community-based climate initiatives', 'Promoting sustainable lifestyles'],
        citizen: ['Active participation in local projects', 'Promoting environmental awareness', 'Citizen initiatives for sustainability'],
        educational: ['Research on climate change', 'Education for sustainable development', 'Innovation in green technologies'],
        government: ['Implementation of climate goals', 'Development of sustainable policies', 'Coordination of regional initiatives']
      }
    };

    const typeDescriptions = descriptions[language]?.[type] || descriptions.en[type];
    return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
  }

  /**
   * Generate region-appropriate challenges
   */
  private generateRegionChallenges(region: Region): ChallengeData[] {
    const challenges: ChallengeData[] = [];
    const baseCount = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < baseCount; i++) {
      challenges.push(this.createRegionChallenge(region, i));
    }

    return challenges;
  }

  private createRegionChallenge(region: Region, index: number): ChallengeData {
    const types: ChallengeData['type'][] = ['energy', 'transport', 'waste', 'water', 'biodiversity', 'community'];
    const difficulties: ChallengeData['difficulty'][] = ['beginner', 'intermediate', 'advanced'];
    const statuses: ChallengeData['status'][] = ['active', 'active', 'active', 'completed', 'upcoming'];

    const type = types[index % types.length];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: `${region.id}-challenge-${index}`,
      title: this.getChallengeTitle(type, region.language),
      description: this.getChallengeDescription(type, region.language),
      type,
      difficulty,
      points: (difficulty === 'beginner' ? 100 : difficulty === 'intermediate' ? 250 : 500) + Math.floor(Math.random() * 100),
      participants: Math.floor(Math.random() * 1000) + 10,
      co2Impact: Math.floor(Math.random() * 1000) + 50,
      duration: this.getChallengeDuration(difficulty),
      status,
      regionSpecific: Math.random() > 0.3,
      requirements: this.getChallengeRequirements(type, region.language)
    };
  }

  private getChallengeTitle(type: ChallengeData['type'], language: string): string {
    const titles: Record<string, Record<ChallengeData['type'], string[]>> = {
      de: {
        energy: ['Energie sparen Challenge', 'Solar Panel Installation', 'LED Beleuchtung Umrüstung'],
        transport: ['Fahrrad zur Arbeit', 'Öffentliche Verkehrsmittel', 'E-Mobilität Förderung'],
        waste: ['Zero Waste Woche', 'Recycling Champions', 'Kompost Initiative'],
        water: ['Wasser sparen Challenge', 'Regenwasser sammeln', 'Wasserschutz Projekt'],
        biodiversity: ['Stadtgarten anlegen', 'Bienen retten', 'Grünflächen erweitern'],
        community: ['Nachbarschaftsprojekt', 'Lokale Produkte', 'Gemeinschaftsgarten']
      },
      hu: {
        energy: ['Energiatakarékossági Kihívás', 'Napelem Telepítés', 'LED Világítás Átalakítás'],
        transport: ['Biciklivel a Munkába', 'Tömegközlekedés', 'E-mobilitás Támogatás'],
        waste: ['Hulladékmentes Hét', 'Újrahasznosítási Bajnokok', 'Komposzt Kezdeményezés'],
        water: ['Víztakarékossági Kihívás', 'Esővíz Gyűjtés', 'Vízvédelmi Projekt'],
        biodiversity: ['Városi Kert Létrehozása', 'Méhek Mentése', 'Zöldterületek Bővítése'],
        community: ['Szomszédsági Projekt', 'Helyi Termékek', 'Közösségi Kert']
      },
      en: {
        energy: ['Energy Saving Challenge', 'Solar Panel Installation', 'LED Lighting Retrofit'],
        transport: ['Bike to Work', 'Public Transportation', 'E-Mobility Promotion'],
        waste: ['Zero Waste Week', 'Recycling Champions', 'Composting Initiative'],
        water: ['Water Conservation Challenge', 'Rainwater Collection', 'Water Protection Project'],
        biodiversity: ['Urban Garden Creation', 'Save the Bees', 'Green Space Expansion'],
        community: ['Neighborhood Project', 'Local Products', 'Community Garden']
      }
    };

    const typeOptions = titles[language]?.[type] || titles.en[type];
    return typeOptions[Math.floor(Math.random() * typeOptions.length)];
  }

  private getChallengeDescription(type: ChallengeData['type'], language: string): string {
    // This would contain detailed descriptions for each challenge type in multiple languages
    return `Detailed challenge description for ${type} in ${language}`;
  }

  private getChallengeDuration(difficulty: ChallengeData['difficulty']): string {
    switch (difficulty) {
      case 'beginner': return '1-2 weeks';
      case 'intermediate': return '1-3 months';
      case 'advanced': return '3-6 months';
    }
  }

  private getChallengeRequirements(type: ChallengeData['type'], language: string): string[] {
    return ['Basic requirement 1', 'Basic requirement 2']; // Simplified for brevity
  }

  /**
   * Generate comprehensive regional data
   */
  private generateRegionalData(region: Region): RegionalData {
    return {
      region,
      stakeholders: this.generateStakeholders(region),
      challenges: this.generateRegionChallenges(region),
      metrics: {
        co2Reduction: Math.floor(Math.random() * 100),
        co2Goal: 75 + Math.floor(Math.random() * 25),
        energyEfficiency: Math.floor(Math.random() * 100),
        wasteReduction: Math.floor(Math.random() * 100),
        greenTransport: Math.floor(Math.random() * 100),
        biodiversityIndex: Math.floor(Math.random() * 100),
        communityEngagement: Math.floor(Math.random() * 100),
        economicImpact: Math.floor(Math.random() * 100)
      },
      demographics: {
        population: region.population || Math.floor(Math.random() * 1000000),
        averageAge: 35 + Math.floor(Math.random() * 20),
        educationLevel: Math.floor(Math.random() * 100),
        incomeLevel: Math.floor(Math.random() * 100)
      },
      infrastructure: {
        publicTransport: Math.floor(Math.random() * 100),
        renewableEnergy: Math.floor(Math.random() * 100),
        recyclingRate: Math.floor(Math.random() * 100),
        greenSpaces: Math.floor(Math.random() * 100)
      },
      realTimeData: {
        airQuality: Math.floor(Math.random() * 100),
        energyConsumption: Math.floor(Math.random() * 1000),
        trafficDensity: Math.floor(Math.random() * 100),
        temperature: Math.floor(Math.random() * 35) - 5
      }
    };
  }

  /**
   * Get real-time weather data for region
   */
  async getWeatherData(region: Region) {
    // Simulate API call to weather service
    await this.delay(500);
    
    return {
      temperature: Math.floor(Math.random() * 35) - 5,
      humidity: Math.floor(Math.random() * 100),
      windSpeed: Math.floor(Math.random() * 50),
      airQuality: Math.floor(Math.random() * 100),
      uv: Math.floor(Math.random() * 11),
      visibility: Math.floor(Math.random() * 50) + 50
    };
  }

  /**
   * Search regions with auto-complete
   */
  async searchRegions(query: string): Promise<Region[]> {
    await this.delay(300);
    
    // This would call Nominatim API in real implementation
    // For now, return mock results based on query
    const mockResults: Region[] = [
      // Results would be populated from actual API
    ];
    
    return mockResults;
  }
}

export const regionDataService = new RegionDataService();