-- RoleFlow Realistic Demo Seeding SQL Script for Supabase PostgreSQL
-- Default password for all demo accounts: RoleflowDemo123!
-- Bcrypt Hash: $2a$10$1Pz5aG5V5f4y9X.rA2h1.ObaUf8Q7aG/3tM.d6c3x4y5z6a7b8c9d

DELETE FROM activity_logs;
DELETE FROM comments;
DELETE FROM tasks;
DELETE FROM team_members;
DELETE FROM teams;
DELETE FROM users;

-- 1. Insert Demo Users
INSERT INTO users (id, name, email, password_hash, role, avatar_url, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Priya Mehta', 'admin@roleflow.demo', '$2a$10$t7794gNoNogTjKNFpR7VWuNohRVyLscXAkDR992Zu2eZGnsS7WsDe', 'admin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', true),
('22222222-2222-2222-2222-222222222222', 'Aarav Sharma', 'manager@roleflow.demo', '$2a$10$t7794gNoNogTjKNFpR7VWuNohRVyLscXAkDR992Zu2eZGnsS7WsDe', 'manager', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', true),
('33333333-3333-3333-3333-333333333333', 'Rahul Verma', 'employee@roleflow.demo', '$2a$10$t7794gNoNogTjKNFpR7VWuNohRVyLscXAkDR992Zu2eZGnsS7WsDe', 'employee', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', true),
('44444444-4444-4444-4444-444444444444', 'Sneha Reddy', 'sneha.reddy@roleflow.demo', '$2a$10$t7794gNoNogTjKNFpR7VWuNohRVyLscXAkDR992Zu2eZGnsS7WsDe', 'manager', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', true),
('55555555-5555-5555-5555-555555555555', 'Ananya Singh', 'ananya.singh@roleflow.demo', '$2a$10$t7794gNoNogTjKNFpR7VWuNohRVyLscXAkDR992Zu2eZGnsS7WsDe', 'employee', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', true),
('66666666-6666-6666-6666-666666666666', 'Rohan Gupta', 'rohan.gupta@roleflow.demo', '$2a$10$t7794gNoNogTjKNFpR7VWuNohRVyLscXAkDR992Zu2eZGnsS7WsDe', 'employee', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', true),
('77777777-7777-7777-7777-777777777777', 'Neha Iyer', 'neha.iyer@roleflow.demo', '$2a$10$t7794gNoNogTjKNFpR7VWuNohRVyLscXAkDR992Zu2eZGnsS7WsDe', 'employee', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', true);

-- 2. Insert Teams
INSERT INTO teams (id, name, description, manager_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Engineering', 'Core platform backend, APIs, frontend architecture and infrastructure', '22222222-2222-2222-2222-222222222222'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Product & Design', 'UI/UX design systems, user research and product workflows', '44444444-4444-4444-4444-444444444444'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Marketing & Growth', 'Growth campaigns, product marketing and customer acquisition', '22222222-2222-2222-2222-222222222222');

-- 3. Team Memberships
INSERT INTO team_members (team_id, user_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777');

-- 4. Tasks
INSERT INTO tasks (id, title, description, team_id, assigned_to, created_by, status, priority, due_date) VALUES
('99999999-9999-9999-9999-999999999991', 'Implement JWT authentication & RBAC API', 'Set up Express middleware with JWT verification, password hashing with bcrypt, and role authorization for Admin, Manager, and Employee.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'in_progress', 'high', CURRENT_DATE + INTERVAL '2 days'),
('99999999-9999-9999-9999-999999999992', 'Fix payment webhook timeout issue', 'Debug idempotency check and database connection pooling timeout during burst webhook spikes.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'todo', 'high', CURRENT_DATE + INTERVAL '1 day'),
('99999999-9999-9999-9999-999999999993', 'Optimize PostgreSQL query execution plans', 'Add indexes on foreign keys, audit logs created_at, and optimize task search filter performance.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'completed', 'medium', CURRENT_DATE),
('99999999-9999-9999-9999-999999999994', 'Design onboarding flow & wireframes', 'Create interactive Figma prototypes for new user invite and team workspace setup.', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'in_progress', 'medium', CURRENT_DATE + INTERVAL '4 days');

-- 5. Comments
INSERT INTO comments (task_id, user_id, content) VALUES
('99999999-9999-9999-9999-999999999991', '22222222-2222-2222-2222-222222222222', 'Please make sure public registration always defaults strictly to Employee role.'),
('99999999-9999-9999-9999-999999999991', '33333333-3333-3333-3333-333333333333', 'JWT token signing and RBAC middleware tests are verified. Working on refresh handler now.'),
('99999999-9999-9999-9999-999999999992', '55555555-5555-5555-5555-555555555555', 'Identified the issue in connection pool limit exhaustion. Applying fix and testing with k6.');

-- 6. Activity Logs
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata) VALUES
('11111111-1111-1111-1111-111111111111', 'USER_CREATED', 'user', '33333333-3333-3333-3333-333333333333', '{"name": "Rahul Verma", "email": "employee@roleflow.demo", "role": "employee"}'::jsonb),
('22222222-2222-2222-2222-222222222222', 'TASK_CREATED', 'task', '99999999-9999-9999-9999-999999999991', '{"task_title": "Implement JWT authentication & RBAC API", "priority": "high"}'::jsonb),
('33333333-3333-3333-3333-333333333333', 'TASK_STATUS_CHANGED', 'task', '99999999-9999-9999-9999-999999999991', '{"task_title": "Implement JWT authentication & RBAC API", "old_status": "todo", "new_status": "in_progress"}'::jsonb);
