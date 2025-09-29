import React from "react";

const HandprintPage = () => {
  console.log("HandprintPage - LOADING SUCCESSFULLY!");
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: '#ffffff',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Simple navigation */}
      <div style={{ 
        borderBottom: '1px solid #334155',
        paddingBottom: '16px',
        marginBottom: '32px'
      }}>
        <a href="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          ← Vissza a Dashboard-ra
        </a>
      </div>
      
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#3b82f6',
          marginBottom: '16px'
        }}>
          🌱 Carbon Handprint Számító
        </h1>
        
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#94a3b8',
          marginBottom: '32px'
        }}>
          Számítsd ki pozitív környezeti hatásod és kövesd nyomon előrehaladásod a fenntarthatóság felé.
        </p>
        
        {/* Success indicator */}
        <div style={{
          backgroundColor: '#065f46',
          color: '#10b981',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '32px',
          border: '1px solid #059669'
        }}>
          ✅ HANDPRINT OLDAL SIKERESEN BETÖLTVE!
        </div>
        
        {/* Simple calculator results */}
        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '24px', 
          borderRadius: '12px',
          border: '1px solid #475569'
        }}>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            color: '#10b981',
            marginBottom: '24px'
          }}>
            🌱 Kéznyom Eredményed
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px',
            textAlign: 'center'
          }}>
            <div style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
              padding: '16px', 
              borderRadius: '8px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#22c55e'
              }}>
                245 kg
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#94a3b8'
              }}>
                CO₂ megtakarítva
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              padding: '16px', 
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#3b82f6'
              }}>
                🌳 11
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#94a3b8'
              }}>
                fa egyenérték
              </div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: 'rgba(251, 146, 60, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(251, 146, 60, 0.3)'
          }}>
            <div style={{ 
              color: '#fb923c', 
              fontWeight: '600'
            }}>
              🏆 Öko Harcos szint
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandprintPage;