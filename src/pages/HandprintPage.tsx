import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const HandprintPage = () => {
  console.log("HandprintPage betöltve - SMART VERSION!");
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [handprint, setHandprint] = useState({
    transport: 0,
    energy: 0,
    waste: 0,
    water: 0,
    community: 0,
    totalCo2Saved: 0,
    treesEquivalent: 0,
    totalPoints: 0,
    rank: 'Kezdő',
    activitiesCount: 0
  });
  
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingChallenge, setCompletingChallenge] = useState<string | null>(null);

  // Challenge teljesítési form
  const [challengeForm, setChallengeForm] = useState({
    challengeId: '',
    completionType: 'manual' as 'manual' | 'photo' | 'api_verified' | 'peer_verified',
    userInput: {} as any,
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadHandprintData();
      loadChallenges();
    }
  }, [user]);

  const loadHandprintData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('challenge-validation', {
        body: { action: 'get-user-handprint' }
      });

      if (error) throw error;
      
      if (data?.handprint) {
        setHandprint(data.handprint);
      }
    } catch (error) {
      console.error('Handprint data load error:', error);
      toast({
        title: "Hiba",
        description: "Nem sikerült betölteni a kéznyom adatokat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChallenges = async () => {
    try {
      const { data: challengeData, error } = await supabase
        .from('challenge_definitions')
        .select('*')
        .eq('is_active', true)
        .order('points_base', { ascending: false });

      if (error) throw error;
      setChallenges(challengeData || []);
    } catch (error) {
      console.error('Challenges load error:', error);
    }
  };

  const completeChallenge = async () => {
    if (!challengeForm.challengeId) {
      toast({
        title: "Hiba",
        description: "Válassz egy kihívást",
        variant: "destructive"
      });
      return;
    }

    setCompletingChallenge(challengeForm.challengeId);

    try {
      const { data, error } = await supabase.functions.invoke('challenge-validation', {
        body: {
          action: 'complete-challenge',
          challengeId: challengeForm.challengeId,
          completionType: challengeForm.completionType,
          userInput: challengeForm.userInput,
          notes: challengeForm.notes
        }
      });

      if (error) throw error;

      toast({
        title: "🎉 Kihívás teljesítve!",
        description: `+${data.completion.points_earned} pont | ${data.impactSummary.co2_saved} kg CO₂ megtakarítás`,
      });

      if (data.validationFeedback) {
        toast({
          title: "💡 Validálási visszajelzés",
          description: data.validationFeedback,
        });
      }

      // Adatok frissítése
      await loadHandprintData();
      
      // Form reset
      setChallengeForm({
        challengeId: '',
        completionType: 'manual',
        userInput: {},
        notes: ''
      });

    } catch (error) {
      console.error('Challenge completion error:', error);
      toast({
        title: "Hiba",
        description: "Nem sikerült rögzíteni a kihívás teljesítését",
        variant: "destructive"
      });
    } finally {
      setCompletingChallenge(null);
    }
  };

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0f172a', 
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: '#3b82f6' }}>
            🔐 Bejelentkezés szükséges
          </h1>
          <p style={{ color: '#94a3b8' }}>
            A kéznyom számító használatához jelentkezz be.
          </p>
          <a 
            href="/auth" 
            style={{ 
              display: 'inline-block',
              marginTop: '16px',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            Bejelentkezés
          </a>
        </div>
      </div>
    );
  }

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
            🌱 Smart Carbon Handprint
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Teljesíts kihívásokat és kövesd nyomon pozitív környezeti hatásod AI-alapú validálással.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Challenge Teljesítés */}
          <div style={{ 
            backgroundColor: '#1e293b', 
            padding: '24px', 
            borderRadius: '12px',
            border: '1px solid #475569'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', color: '#f1f5f9' }}>
              ⚡ Kihívás Teljesítése
            </h2>
            
            {/* Challenge választó */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#e2e8f0' }}>
                🏆 Válassz kihívást
              </label>
              <select
                value={challengeForm.challengeId}
                onChange={(e) => setChallengeForm(prev => ({...prev, challengeId: e.target.value}))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  fontSize: '16px'
                }}
              >
                <option value="">-- Válassz kihívást --</option>
                {challenges.map(challenge => (
                  <option key={challenge.id} value={challenge.id}>
                    {challenge.title} ({challenge.points_base} pont)
                  </option>
                ))}
              </select>
            </div>

            {/* Validálási típus */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#e2e8f0' }}>
                ✅ Validálási mód
              </label>
              <select
                value={challengeForm.completionType}
                onChange={(e) => setChallengeForm(prev => ({...prev, completionType: e.target.value as any}))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  fontSize: '16px'
                }}
              >
                <option value="manual">🖊️ Manuális (alapértelmezett)</option>
                <option value="photo">📸 Fotó (+20% bónusz)</option>
                <option value="peer_verified">👥 Közösség (+40% bónusz)</option>
                <option value="api_verified">📱 API igazolás (+50% bónusz)</option>
              </select>
            </div>

            {/* Dinamikus input mezők */}
            {challengeForm.challengeId === 'bike-to-work' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#e2e8f0' }}>
                  🚲 Távolság (km)
                </label>
                <input
                  type="number"
                  placeholder="10"
                  value={challengeForm.userInput.distance || ''}
                  onChange={(e) => setChallengeForm(prev => ({...prev, userInput: {...prev.userInput, distance: parseFloat(e.target.value) || 0}}))}
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
            )}

            {challengeForm.challengeId === 'led-switch' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#e2e8f0' }}>
                  💡 Izzók száma
                </label>
                <input
                  type="number"
                  placeholder="5"
                  value={challengeForm.userInput.bulbCount || ''}
                  onChange={(e) => setChallengeForm(prev => ({...prev, userInput: {...prev.userInput, bulbCount: parseInt(e.target.value) || 0}}))}
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
            )}

            {challengeForm.challengeId === 'water-saver' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#e2e8f0' }}>
                  💧 Megtakarított víz (liter)
                </label>
                <input
                  type="number"
                  placeholder="500"
                  value={challengeForm.userInput.waterSaved || ''}
                  onChange={(e) => setChallengeForm(prev => ({...prev, userInput: {...prev.userInput, waterSaved: parseFloat(e.target.value) || 0}}))}
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
            )}

            {/* Jegyzetek */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#e2e8f0' }}>
                📝 Jegyzetek (opcionális)
              </label>
              <textarea
                placeholder="Írj róla, hogyan teljesítetted a kihívást..."
                value={challengeForm.notes}
                onChange={(e) => setChallengeForm(prev => ({...prev, notes: e.target.value}))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Teljesítés gomb */}
            <button
              onClick={completeChallenge}
              disabled={!challengeForm.challengeId || completingChallenge !== null}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: completingChallenge ? '#374151' : '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: completingChallenge ? 'not-allowed' : 'pointer',
                opacity: completingChallenge ? 0.7 : 1
              }}
            >
              {completingChallenge ? '⏳ Feldolgozás...' : '🚀 Kihívás Teljesítése'}
            </button>
          </div>

          {/* Kéznyom Eredmények */}
          <div style={{ 
            backgroundColor: '#1e293b', 
            padding: '24px', 
            borderRadius: '12px',
            border: '1px solid #475569'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', color: '#22c55e' }}>
              🌱 Aktuális Kéznyomod
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                ⏳ Betöltés...
              </div>
            ) : (
              <>
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
                    {handprint.totalCo2Saved} kg CO₂
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                    {handprint.activitiesCount} aktivitásból
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#3b82f6', marginBottom: '8px' }}>
                    🌳 {handprint.treesEquivalent} fa egyenérték
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#f59e0b' }}>
                    ⭐ {handprint.totalPoints} pont
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
                    🏆 {handprint.rank}
                  </div>
                </div>

                {/* Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Közlekedés', value: handprint.transport, emoji: '🚗', color: '#3b82f6' },
                    { label: 'Energia', value: handprint.energy, emoji: '💡', color: '#f59e0b' },
                    { label: 'Hulladék', value: handprint.waste, emoji: '♻️', color: '#22c55e' },
                    { label: 'Víz', value: handprint.water, emoji: '💧', color: '#06b6d4' },
                    { label: 'Közösségi hatás', value: handprint.community, emoji: '🏆', color: '#fb923c' }
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
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{item.label}</span>
                      </div>
                      <span style={{ fontWeight: '600', color: item.color }}>{item.value} kg CO₂</span>
                    </div>
                  ))}
                </div>

                {handprint.activitiesCount === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '24px',
                    color: '#94a3b8',
                    fontSize: '14px'
                  }}>
                    Teljesíts kihívásokat, hogy lásd a kéznyomod! 👈
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandprintPage;