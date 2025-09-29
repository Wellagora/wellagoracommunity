import React from "react";
import Navigation from "@/components/Navigation";

const HandprintPage = () => {
  console.log("HandprintPage betöltve!");
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-400 mb-4">
            Carbon Handprint Számító
          </h1>
          <p className="text-lg text-slate-300 mb-8">
            Számítsd ki pozitív környezeti hatásod és kövesd nyomon előrehaladásod a fenntarthatóság felé.
          </p>
          
          {/* Egyszerű kéznyom számító */}
          <div className="bg-slate-800 p-6 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-green-400 mb-4">🌱 Kéznyom Eredményed</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-900/30 p-4 rounded">
                <div className="text-2xl font-bold text-green-400">245 kg</div>
                <div className="text-sm text-slate-400">CO₂ megtakarítva</div>
              </div>
              <div className="bg-blue-900/30 p-4 rounded">
                <div className="text-2xl font-bold text-blue-400">🌳 11</div>
                <div className="text-sm text-slate-400">fa egyenérték</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-900/30 rounded">
              <div className="text-yellow-400 font-medium">🏆 Öko Harcos szint</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HandprintPage;