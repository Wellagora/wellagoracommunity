-- Set Attila as sponsor + super admin (now that enum values are committed)
UPDATE profiles 
SET 
  user_role = 'sponsor',
  is_super_admin = true
WHERE email = 'attila.kelemen@proself.org';