import React from 'react';
import Navigation from '@/components/Navigation';
import InteractiveMap from '@/components/InteractiveMap';

const InteractiveMapPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InteractiveMap />
      </div>
    </div>
  );
};

export default InteractiveMapPage;