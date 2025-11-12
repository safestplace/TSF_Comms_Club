-- Seed States
INSERT INTO states (name) VALUES
('Maharashtra'),
('Karnataka'),
('Tamil Nadu'),
('Delhi'),
('Gujarat');

-- Seed Districts
INSERT INTO districts (state_id, name) VALUES
(1, 'Mumbai'),
(1, 'Pune'),
(1, 'Nagpur'),
(2, 'Bangalore Urban'),
(2, 'Mysore'),
(3, 'Chennai'),
(3, 'Coimbatore'),
(4, 'Central Delhi'),
(4, 'South Delhi'),
(5, 'Ahmedabad'),
(5, 'Surat');

-- Seed Institutions
INSERT INTO institutions (district_id, name, status) VALUES
(1, 'Mumbai University', 'approved'),
(1, 'VJTI College', 'approved'),
(2, 'Pune Institute of Technology', 'approved'),
(4, 'Bangalore Institute of Technology', 'approved'),
(6, 'Anna University', 'approved'),
(8, 'Delhi University', 'approved'),
(10, 'Gujarat University', 'approved');

-- Create a Super Admin user (you'll need to sign up first, then update the role)
-- After signing up via the app, run:
-- UPDATE users SET global_role = 'super' WHERE email = 'your-super-admin@example.com';

-- Seed Default Roles (these will be created for each club)
-- Toastmaster, Speaker, Evaluator, Timer, Grammarian, Table Topics Master, General Evaluator, Ah-Counter

-- Note: You'll need to create a club and users first via the application,
-- then you can use the club_id to seed meetings and tasks

-- Example seed for a demo club (after club creation):
/*
-- Assuming club_id = 1
INSERT INTO levels (club_id, number, title, description) VALUES
(1, 1, 'Beginner', 'Introduction to public speaking'),
(1, 2, 'Intermediate', 'Developing speaking skills'),
(1, 3, 'Advanced', 'Mastering communication'),
(1, 4, 'Expert', 'Leadership and mentorship');

-- Seed Roles for club
INSERT INTO roles (club_id, name, description) VALUES
(1, 'Toastmaster', 'Leads the meeting'),
(1, 'Speaker', 'Delivers prepared speech'),
(1, 'Evaluator', 'Evaluates speeches'),
(1, 'Timer', 'Tracks time for all segments'),
(1, 'Grammarian', 'Tracks language usage'),
(1, 'Table Topics Master', 'Leads impromptu speaking'),
(1, 'General Evaluator', 'Evaluates the entire meeting'),
(1, 'Ah-Counter', 'Counts filler words');

-- Seed Sample Meetings
INSERT INTO meetings (club_id, level_id, title, scheduled_at, venue, notes) VALUES
(1, 1, 'Icebreaker Session', '2024-02-15 18:00:00', 'Main Auditorium', 'First meeting for new members'),
(1, 2, 'Advanced Speaking Workshop', '2024-02-22 18:00:00', 'Conference Room A', 'Focus on persuasive speaking'),
(1, 3, 'Leadership Excellence', '2024-03-01 18:00:00', 'Main Auditorium', 'Panel discussion');

-- Seed Tasks for meetings
INSERT INTO tasks (meeting_id, level_id, title, description) VALUES
(1, 1, 'Prepare 5-minute speech', 'Introduce yourself to the club'),
(1, 1, 'Learn meeting roles', 'Understand the structure of a club meeting'),
(2, 2, 'Deliver persuasive speech', '7-minute speech on a topic of your choice'),
(2, 2, 'Evaluate a speech', 'Provide constructive feedback');
*/