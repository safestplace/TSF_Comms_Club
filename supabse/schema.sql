-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  global_role TEXT NOT NULL DEFAULT 'member' CHECK (global_role IN ('member', 'admin', 'super')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- States
CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Districts
CREATE TABLE districts (
  id SERIAL PRIMARY KEY,
  state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE(state_id, name)
);

-- Institutions
CREATE TABLE institutions (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending')),
  UNIQUE(district_id, name)
);

CREATE INDEX idx_institutions_status ON institutions(status);

-- Club Requests
CREATE TABLE club_requests (
  id SERIAL PRIMARY KEY,
  requested_by_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_name TEXT NOT NULL,
  state_id INTEGER NOT NULL REFERENCES states(id),
  district_id INTEGER NOT NULL REFERENCES districts(id),
  institution_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decided_by UUID REFERENCES users(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_club_requests_status ON club_requests(status);

-- Clubs
CREATE TABLE clubs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  state_id INTEGER NOT NULL REFERENCES states(id),
  district_id INTEGER NOT NULL REFERENCES districts(id),
  institution_id INTEGER NOT NULL REFERENCES institutions(id),
  created_by_user UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clubs_status ON clubs(status);

-- Club Admins
CREATE TABLE club_admins (
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (club_id, user_id)
);

-- Club Members
CREATE TABLE club_members (
  id SERIAL PRIMARY KEY,
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_organizer BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

CREATE INDEX idx_club_members_club ON club_members(club_id);
CREATE INDEX idx_club_members_status ON club_members(status);

-- Organizer cap constraint (5 per 20 approved members)
CREATE OR REPLACE FUNCTION check_organizer_cap()
RETURNS TRIGGER AS $$
DECLARE
  approved_count INTEGER;
  organizer_count INTEGER;
  max_organizers INTEGER;
BEGIN
  IF NEW.is_organizer = TRUE AND NEW.status = 'approved' THEN
    SELECT COUNT(*) INTO approved_count
    FROM club_members
    WHERE club_id = NEW.club_id AND status = 'approved';

    SELECT COUNT(*) INTO organizer_count
    FROM club_members
    WHERE club_id = NEW.club_id AND status = 'approved' AND is_organizer = TRUE;

    max_organizers := FLOOR(approved_count / 20.0) * 5;

    IF organizer_count > max_organizers THEN
      RAISE EXCEPTION 'Organizer cap exceeded: max % organizers allowed for % members', max_organizers, approved_count;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_organizer_cap
  BEFORE INSERT OR UPDATE ON club_members
  FOR EACH ROW
  EXECUTE FUNCTION check_organizer_cap();

-- Levels
CREATE TABLE levels (
  id SERIAL PRIMARY KEY,
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  number INTEGER NOT NULL CHECK (number BETWEEN 1 AND 4),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  UNIQUE(club_id, number)
);

-- Meetings
CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL REFERENCES levels(id),
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_club ON meetings(club_id);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);

-- Tasks
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL REFERENCES levels(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evaluator_user_id UUID REFERENCES users(id)
);

-- Roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  UNIQUE(club_id, name)
);

-- Role Requests
CREATE TABLE role_requests (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decided_by UUID REFERENCES users(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_role_requests_status ON role_requests(status);

-- Unique partial index: one approved role per meeting per user
CREATE UNIQUE INDEX idx_one_approved_role_per_meeting_user 
  ON role_requests(meeting_id, user_id) 
  WHERE status = 'approved';

-- Achievement Requests
CREATE TABLE achievement_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL REFERENCES levels(id),
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decided_by UUID REFERENCES users(id),
  decided_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievement_requests_status ON achievement_requests(status);

-- Certificates
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL REFERENCES levels(id),
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  issued_by UUID NOT NULL REFERENCES users(id),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  sha256_hash TEXT NOT NULL
);

CREATE INDEX idx_certificates_user ON certificates(user_id);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  payload_json JSONB,
  channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email')),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read_at);

-- Audit Log
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  actor_user UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  payload_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_actor ON audit_log(actor_user);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- Views

-- Leaderboard View
CREATE OR REPLACE VIEW v_leaderboard AS
SELECT 
  cm.club_id,
  ar.user_id,
  COUNT(*) as approved_achievements_count
FROM achievement_requests ar
JOIN club_members cm ON ar.user_id = cm.user_id
WHERE ar.status = 'approved' AND cm.status = 'approved'
GROUP BY cm.club_id, ar.user_id
ORDER BY approved_achievements_count DESC;

-- Club Activity View
CREATE OR REPLACE VIEW v_club_activity AS
SELECT 
  c.id as club_id,
  COUNT(DISTINCT m.id) as meetings_count,
  COUNT(DISTINCT cm.user_id) FILTER (WHERE cm.status = 'approved') as members_count,
  (
    SELECT COUNT(*) 
    FROM role_requests rr 
    JOIN meetings mt ON rr.meeting_id = mt.id 
    WHERE mt.club_id = c.id AND rr.status = 'pending'
  ) + (
    SELECT COUNT(*) 
    FROM achievement_requests ar 
    JOIN levels l ON ar.level_id = l.id 
    WHERE l.club_id = c.id AND ar.status = 'pending'
  ) as pending_approvals
FROM clubs c
LEFT JOIN meetings m ON c.id = m.club_id
LEFT JOIN club_members cm ON c.id = cm.club_id
GROUP BY c.id;

-- Row Level Security (RLS)

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_requests ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Super admins can view all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND global_role = 'super')
);

-- Club Members policies
CREATE POLICY "Members can view approved members in their clubs" ON club_members FOR SELECT USING (
  club_id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid() AND status = 'approved')
);

CREATE POLICY "Club admins can manage their club members" ON club_members FOR ALL USING (
  club_id IN (SELECT club_id FROM club_admins WHERE user_id = auth.uid() AND active = TRUE)
);

CREATE POLICY "Users can request to join clubs" ON club_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- Club Admins policies
CREATE POLICY "Club admins can view their admin status" ON club_admins FOR SELECT USING (user_id = auth.uid());

-- Clubs policies
CREATE POLICY "Members can view approved clubs they belong to" ON clubs FOR SELECT USING (
  status = 'approved' AND id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can view all clubs" ON clubs FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND global_role = 'super')
);

-- Meetings policies
CREATE POLICY "Members can view meetings in their clubs" ON meetings FOR SELECT USING (
  club_id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid() AND status = 'approved')
);

CREATE POLICY "Club admins can manage meetings" ON meetings FOR ALL USING (
  club_id IN (SELECT club_id FROM club_admins WHERE user_id = auth.uid() AND active = TRUE)
);

-- Role Requests policies
CREATE POLICY "Users can view their own role requests" ON role_requests FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create role requests" ON role_requests FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Club admins can manage role requests" ON role_requests FOR ALL USING (
  meeting_id IN (SELECT id FROM meetings WHERE club_id IN (
    SELECT club_id FROM club_admins WHERE user_id = auth.uid() AND active = TRUE
  ))
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can mark notifications as read" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Club Requests policies
CREATE POLICY "Users can view their own club requests" ON club_requests FOR SELECT USING (requested_by_user = auth.uid());
CREATE POLICY "Users can create club requests" ON club_requests FOR INSERT WITH CHECK (requested_by_user = auth.uid());
CREATE POLICY "Super admins can manage club requests" ON club_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND global_role = 'super')
);

-- Certificates policies
CREATE POLICY "Users can view their own certificates" ON certificates FOR SELECT USING (user_id = auth.uid());

-- Achievement Requests policies
CREATE POLICY "Users can view their own achievement requests" ON achievement_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create achievement requests" ON achievement_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Club admins can manage achievement requests" ON achievement_requests FOR ALL USING (
  level_id IN (SELECT id FROM levels WHERE club_id IN (
    SELECT club_id FROM club_admins WHERE user_id = auth.uid() AND active = TRUE
  ))
);