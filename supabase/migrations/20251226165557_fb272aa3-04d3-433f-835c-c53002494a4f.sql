-- RPC function to get real village stats
CREATE OR REPLACE FUNCTION get_regional_village_stats(p_project_id UUID DEFAULT NULL)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(village_stats)
    FROM (
      SELECT 
        COALESCE(p.city, p.district, 'Ismeretlen') as village_name,
        COUNT(DISTINCT p.id) as participants,
        COUNT(DISTINCT cc.challenge_id) as programs,
        COALESCE((
          SELECT COUNT(*) 
          FROM events e 
          WHERE e.village = COALESCE(p.city, p.district)
            AND (p_project_id IS NULL OR e.project_id = p_project_id)
        ), 0) as events
      FROM profiles p
      LEFT JOIN project_members pm ON pm.user_id = p.id
      LEFT JOIN challenge_completions cc ON cc.user_id = p.id
      WHERE (p_project_id IS NULL OR pm.project_id = p_project_id)
        AND (p.city IS NOT NULL OR p.district IS NOT NULL)
      GROUP BY COALESCE(p.city, p.district, 'Ismeretlen')
      ORDER BY participants DESC
      LIMIT 10
    ) village_stats
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  challenge_id TEXT,
  organization_id UUID REFERENCES organizations(id),
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Location
  location_name TEXT,
  location_address TEXT,
  village TEXT,
  latitude FLOAT,
  longitude FLOAT,
  
  -- Timing
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_all_day BOOLEAN DEFAULT false,
  recurrence TEXT CHECK (recurrence IS NULL OR recurrence IN ('weekly', 'monthly', 'none')),
  
  -- Capacity
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  
  -- Meta
  image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event RSVPs table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Events RLS policies
CREATE POLICY "Public events visible to all" ON public.events
  FOR SELECT USING (is_public = true);

CREATE POLICY "Project members can view project events" ON public.events
  FOR SELECT USING (project_id IS NOT NULL AND is_project_member(auth.uid(), project_id));

CREATE POLICY "Event creators can manage their events" ON public.events
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Project admins can manage project events" ON public.events
  FOR ALL USING (project_id IS NOT NULL AND is_project_admin(auth.uid(), project_id));

-- Event RSVPs RLS policies
CREATE POLICY "Users can view RSVPs for public events" ON public.event_rsvps
  FOR SELECT USING (
    event_id IN (SELECT id FROM events WHERE is_public = true)
  );

CREATE POLICY "Users can manage their own RSVPs" ON public.event_rsvps
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_project ON public.events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_village ON public.events(village);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON public.event_rsvps(user_id);