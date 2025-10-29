-- Teszt adatok hozzáadása a szponzor dashboard teszteléséhez
-- FIGYELEM: Ez teszt adat, éles környezetben törölni kell!

-- Először ellenőrizzük és töröljük a régi teszt adatokat ha vannak
DELETE FROM credit_transactions WHERE sponsor_user_id = '0be71725-70ac-4bd6-81b0-9fe106ed1573';
DELETE FROM challenge_sponsorships WHERE sponsor_user_id = '0be71725-70ac-4bd6-81b0-9fe106ed1573';
DELETE FROM sponsor_credits WHERE sponsor_user_id = '0be71725-70ac-4bd6-81b0-9fe106ed1573';

-- Sponsor credits létrehozása (available_credits automatikusan számolódik)
INSERT INTO sponsor_credits (sponsor_user_id, total_credits, used_credits)
VALUES (
  '0be71725-70ac-4bd6-81b0-9fe106ed1573',
  500,
  150
);

-- Teszt tranzakciók hozzáadása
INSERT INTO credit_transactions (sponsor_user_id, transaction_type, credits, description, created_at)
VALUES 
  (
    '0be71725-70ac-4bd6-81b0-9fe106ed1573',
    'purchase',
    500,
    'Kezdő csomag vásárlás - Teszt',
    NOW() - INTERVAL '7 days'
  ),
  (
    '0be71725-70ac-4bd6-81b0-9fe106ed1573',
    'spend',
    -50,
    'Kerékpározás kihívás szponzorálása - Budapest régió',
    NOW() - INTERVAL '5 days'
  ),
  (
    '0be71725-70ac-4bd6-81b0-9fe106ed1573',
    'spend',
    -100,
    'Zero Waste kihívás szponzorálása - Országos',
    NOW() - INTERVAL '2 days'
  );

-- Teszt szponzorálások hozzáadása (tier és package_type használatával)
INSERT INTO challenge_sponsorships (
  sponsor_user_id, 
  challenge_id, 
  tier, 
  package_type,
  credit_cost,
  start_date, 
  end_date,
  status,
  region,
  amount_paid
)
VALUES 
  (
    '0be71725-70ac-4bd6-81b0-9fe106ed1573',
    'bike-to-work',
    'bronze',
    'bronze',
    50,
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '25 days',
    'active',
    'Budapest',
    15000
  ),
  (
    '0be71725-70ac-4bd6-81b0-9fe106ed1573',
    'zero-waste-challenge',
    'silver',
    'silver',
    100,
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '28 days',
    'active',
    'Országos',
    45000
  );