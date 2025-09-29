import React, { useState, useEffect } from 'react';

const HandprintPage = () => {
  console.log("HandprintPage betöltve - WORKING VERSION!");
  
  const [inputs, setInputs] = useState({
    bikeKm: '',
    publicTransportKm: '',
    energySaved: '',
    wasteRecycled: '',
    waterSaved: '',
    communityHours: ''
  });

  const [results, setResults] = useState({
    transport: 0,
    energy: 0,
    waste: 0,
    water: 0,
    community: 0,
    totalCo2Saved: 0,
    treesEquivalent: 0,
    rank: 'Kezdő'
  });

  const calculateHandprint = () => {
    const bikeImpact = parseFloat(inputs.bikeKm || '0') * 0.21;
    const publicTransportImpact = parseFloat(inputs.publicTransportKm || '0') * 0.15;
    const transport = bikeImpact + publicTransportImpact;

    const energy = parseFloat(inputs.energySaved || '0') * 0.4;
    const waste = parseFloat(inputs.wasteRecycled || '0') * 2.1;
    const water = parseFloat(inputs.waterSaved || '0') * 0.0004;
    
    const communityMultiplier = parseFloat(inputs.communityHours || '0') * 5;
    const community = (transport + energy + waste + water) * (communityMultiplier / 100);

    const totalCo2Saved = transport + energy + waste + water + community;
    const treesEquivalent = Math.round(totalCo2Saved / 22);

    let rank = 'Kezdő';
    if (totalCo2Saved > 1000) rank = 'Fenntarthatósági Hős';
    else if (totalCo2Saved > 500) rank = 'Környezeti Bajnok';
    else if (totalCo2Saved > 200) rank = 'Zöld Aktivista';
    else if (totalCo2Saved > 50) rank = 'Öko Harcos';

    setResults({
      transport: Math.round(transport),
      energy: Math.round(energy),
      waste: Math.round(waste),
      water: Math.round(water),
      community: Math.round(community),
      totalCo2Saved: Math.round(totalCo2Saved),
      treesEquivalent,
      rank
    });
  };

  useEffect(() => {
    calculateHandprint();
  }, [inputs]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Navigation */}
      <div style={{ 
        borderBottom: '1px solid #334155',
        padding: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>
            ← Dashboard
          </a>
          <a href="/challenges" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>
            Kihívások
          </a>
        </div>
      </div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            background: 'linear-gradient(to right, #3b82f6, #22c55e)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px'
          }}>
            🌱 Carbon Handprint Számító
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Számítsd ki pozitív környezeti hatásod és kövesd nyomon előrehaladásod a fenntarthatóság felé.
          </p>
        </div>

        {/* Success indicator */}
        <div style={{
          backgroundColor: '#065f46',
          color: '#10b981',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '32px',
          border: '1px solid #059669',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ✅ HANDPRINT SZÁMÍTÓ SIKERESEN BETÖLTVE!
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Input Form */}
          <div style={{ 
            backgroundColor: '#1e293b', 
            padding: '24px', 
            borderRadius: '12px',
            border: '1px solid #475569'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', color: '#f1f5f9' }}>
              Havi Aktivitásaid
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#94a3b8' }}>
                  🚲 Biciklizés (km/hó)
                </label>
                <input
                  type="number"
                  placeholder="50"
                  value={inputs.bikeKm}
                  onChange={(e) => setInputs(prev => ({...prev, bikeKm: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#94a3b8' }}>
                  🚌 Tömegközlekedés (km/hó)
                </label>
                <input
                  type="number"
                  placeholder="100"
                  value={inputs.publicTransportKm}
                  onChange={(e) => setInputs(prev => ({...prev, publicTransportKm: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#94a3b8' }}>
                  💡 Energia megtakarítás (kWh/hó)
                </label>
                <input
                  type="number"
                  placeholder="30"
                  value={inputs.energySaved}
                  onChange={(e) => setInputs(prev => ({...prev, energySaved: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#94a3b8' }}>
                  ♻️ Újrahasznosítás (kg/hó)
                </label>
                <input
                  type="number"
                  placeholder="15"
                  value={inputs.wasteRecycled}
                  onChange={(e) => setInputs(prev => ({...prev, wasteRecycled: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#94a3b8' }}>
                  💧 Víz megtakarítás (liter/hó)
                </label>
                <input
                  type="number"
                  placeholder="500"
                  value={inputs.waterSaved}
                  onChange={(e) => setInputs(prev => ({...prev, waterSaved: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#94a3b8' }}>
                  🏆 Közösségi aktivizmus (óra/hó)
                </label>
                <input
                  type="number"
                  placeholder="8"
                  value={inputs.communityHours}
                  onChange={(e) => setInputs(prev => ({...prev, communityHours: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ 
            backgroundColor: '#1e293b', 
            padding: '24px', 
            borderRadius: '12px',
            border: '1px solid #475569'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', color: '#22c55e' }}>
              🌱 Pozitív Környezeti Kéznyomod
            </h2>

            {/* Total Impact */}
            <div style={{
              textAlign: 'center',
              background: 'linear-gradient(to right, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '8px' }}>
                {results.totalCo2Saved} kg CO₂
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                megtakarítva havonta
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#3b82f6' }}>
                🌳 {results.treesEquivalent} fa egyenérték
              </div>
            </div>

            {/* Rank */}
            <div style={{
              textAlign: 'center',
              backgroundColor: 'rgba(251, 146, 60, 0.1)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(251, 146, 60, 0.3)',
              marginBottom: '24px'
            }}>
              <div style={{ color: '#fb923c', fontWeight: '600', fontSize: '1.1rem' }}>
                🏆 {results.rank}
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Közlekedés', value: results.transport, emoji: '🚗', color: '#3b82f6' },
                { label: 'Energia', value: results.energy, emoji: '💡', color: '#f59e0b' },
                { label: 'Hulladék', value: results.waste, emoji: '♻️', color: '#22c55e' },
                { label: 'Víz', value: results.water, emoji: '💧', color: '#06b6d4' },
                { label: 'Közösségi hatás', value: results.community, emoji: '🏆', color: '#fb923c' }
              ].map((item) => (
                <div key={item.label} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #475569'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{item.emoji}</span>
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>{item.label}</span>
                  </div>
                  <span style={{ fontWeight: '600', color: item.color }}>{item.value} kg CO₂</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandprintPage;