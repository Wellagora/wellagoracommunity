-- Growth Dashboard: weekly registrations function
CREATE OR REPLACE FUNCTION get_weekly_registrations(weeks INT DEFAULT 12)
RETURNS TABLE(week_start DATE, experts BIGINT, members BIGINT)
LANGUAGE sql AS $$
  SELECT
    date_trunc('week', created_at)::date as week_start,
    COUNT(*) FILTER (WHERE role = 'expert') as experts,
    COUNT(*) FILTER (WHERE role IN ('member', 'tag')) as members
  FROM profiles
  WHERE created_at >= NOW() - (weeks || ' weeks')::interval
  GROUP BY week_start
  ORDER BY week_start;
$$;
