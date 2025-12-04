UPDATE subscription_plans SET features = '["Havi 1 kredit", "Szervezeti profil", "Logo megjelenés", "Impact riport", "Email támogatás"]'::jsonb WHERE plan_key = 'bronze_monthly';

UPDATE subscription_plans SET features = '["12 kredit évente + 2 bónusz", "Szervezeti profil", "Logo megjelenés", "Impact riport", "Email támogatás", "~17% megtakarítás"]'::jsonb WHERE plan_key = 'bronze_yearly';

UPDATE subscription_plans SET features = '["Havi 2 kredit", "Szervezeti profil", "Logo megjelenés", "Impact riport", "Részletes analitika", "Email támogatás"]'::jsonb WHERE plan_key = 'silver_monthly';

UPDATE subscription_plans SET features = '["24 kredit évente + 4 bónusz", "Szervezeti profil", "Logo megjelenés", "Impact riport", "Részletes analitika", "Email támogatás", "~17% megtakarítás"]'::jsonb WHERE plan_key = 'silver_yearly';

UPDATE subscription_plans SET features = '["Havi 4 kredit", "Szervezeti profil", "Logo megjelenés", "Haladó analitika", "Prioritásos támogatás"]'::jsonb WHERE plan_key = 'gold_monthly';

UPDATE subscription_plans SET features = '["48 kredit évente + 8 bónusz", "Szervezeti profil", "Logo megjelenés", "Haladó analitika", "Prioritásos támogatás", "~17% megtakarítás"]'::jsonb WHERE plan_key = 'gold_yearly';

UPDATE subscription_plans SET features = '["Havi 8 kredit", "Szervezeti profil", "Logo megjelenés", "Prémium analitika", "Dedikált kapcsolattartó"]'::jsonb WHERE plan_key = 'diamond_monthly';

UPDATE subscription_plans SET features = '["96 kredit évente + 16 bónusz", "Szervezeti profil", "Logo megjelenés", "Prémium analitika", "Dedikált kapcsolattartó", "~17% megtakarítás"]'::jsonb WHERE plan_key = 'diamond_yearly';