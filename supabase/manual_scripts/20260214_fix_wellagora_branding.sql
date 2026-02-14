-- Fix "Wellagora" → "WellAgora" branding in profiles table
UPDATE profiles SET organization = 'WellAgora' WHERE organization ILIKE '%wellagora%' AND organization != 'WellAgora';
