-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography column to profiles for spatial queries
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location_point geography(POINT, 4326);

-- Populate location_point from existing lat/lng data
UPDATE profiles 
SET location_point = ST_SetSRID(ST_MakePoint(longitude::float, latitude::float), 4326)::geography
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL 
  AND location_point IS NULL;

-- Create spatial index for fast proximity queries
CREATE INDEX IF NOT EXISTS idx_profiles_location_point 
ON profiles USING GIST (location_point);

-- Create trigger to auto-update location_point when lat/lng changes
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_point = ST_SetSRID(ST_MakePoint(NEW.longitude::float, NEW.latitude::float), 4326)::geography;
  ELSE
    NEW.location_point = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_location_point ON profiles;
CREATE TRIGGER trigger_update_location_point
  BEFORE INSERT OR UPDATE OF latitude, longitude ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_location_point();

-- Create RPC function for finding nearby stakeholders using PostGIS
CREATE OR REPLACE FUNCTION find_nearby_stakeholders(
  p_latitude FLOAT,
  p_longitude FLOAT,
  p_radius_meters INT DEFAULT 10000,
  p_project_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  user_role user_role,
  organization TEXT,
  distance_meters FLOAT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  industry TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    COALESCE(pr.public_display_name, pr.first_name || ' ' || pr.last_name) as name,
    pr.user_role,
    pr.organization,
    ST_Distance(
      pr.location_point,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
    ) as distance_meters,
    pr.avatar_url,
    pr.bio,
    pr.location,
    pr.industry
  FROM profiles pr
  WHERE pr.location_point IS NOT NULL
    AND pr.is_public_profile = true
    AND ST_DWithin(
      pr.location_point,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_meters
    )
    AND (p_project_id IS NULL OR pr.project_id = p_project_id)
  ORDER BY distance_meters
  LIMIT p_limit;
END;
$$;