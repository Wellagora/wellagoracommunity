-- Expert availability slots for calendar booking
CREATE TABLE IF NOT EXISTS expert_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  booked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  booked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_expert_availability_expert_date ON expert_availability(expert_id, date);
CREATE INDEX IF NOT EXISTS idx_expert_availability_date ON expert_availability(date) WHERE NOT is_booked;

-- RLS
ALTER TABLE expert_availability ENABLE ROW LEVEL SECURITY;

-- Experts can manage their own availability
CREATE POLICY "Experts manage own availability" ON expert_availability
  FOR ALL USING (auth.uid() = expert_id);

-- Anyone authenticated can view availability
CREATE POLICY "Anyone can view availability" ON expert_availability
  FOR SELECT USING (auth.role() = 'authenticated');

-- Members can book available slots
CREATE POLICY "Members can book slots" ON expert_availability
  FOR UPDATE USING (
    auth.role() = 'authenticated' 
    AND NOT is_booked 
    AND auth.uid() != expert_id
  );

-- Attendance tracking for programs
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  checked_in_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_program ON attendance(program_id);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Experts can manage attendance for their programs
CREATE POLICY "Experts manage attendance" ON attendance
  FOR ALL USING (auth.uid() = checked_in_by OR auth.uid() = user_id);

-- Anyone authenticated can view attendance
CREATE POLICY "Anyone can view attendance" ON attendance
  FOR SELECT USING (auth.role() = 'authenticated');
