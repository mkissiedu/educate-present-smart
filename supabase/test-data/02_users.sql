-- ============================================================
-- 02 — Users
-- Links existing seed users to Ananse Academy.
-- Adds: platform admin, school admin 2, super teacher 2,
--       4 teachers (Ananse), 1 teacher (Sunrise).
--
-- Passwords (plain-text for dev — replace via create-user edge fn):
--   Teachers      → teacher123
--   School Admins → admin123
--   Super Teacher → super123
-- ============================================================

-- Link existing seed users to Ananse Academy
UPDATE public.users
SET school_id = 'a0000000-0000-0000-0000-000000000001', updated_at = now()
WHERE id = 'fdf6539c-efa5-4205-9b9e-3ee3140d85e7';  -- Demo Teacher

UPDATE public.users
SET school_id = 'a0000000-0000-0000-0000-000000000001', updated_at = now()
WHERE id = '41370924-e180-4985-b0d5-e618c2a35e9e';  -- School Admin

UPDATE public.users
SET school_id = 'a0000000-0000-0000-0000-000000000001', updated_at = now()
WHERE id = '2d0b7399-64a2-4997-acc8-276a62d12d55';  -- Super Teacher

-- New test users
INSERT INTO public.users
  (id, name, email, phone, password_hash, role, assigned_classes, school_id, is_active)
VALUES
  -- Platform Admin (no school)
  ('b0000000-0000-0000-0000-000000000001',
   'Ama Antwi', 'platformadmin@catalyst.edu', '+233244100001',
   'admin123', 'platform_admin', '[]', NULL, true),

  -- School Admin — Sunrise International
  ('b0000000-0000-0000-0000-000000000002',
   'Yaw Mensah', 'admin@sunrise.edu.gh', '+233244100002',
   'admin123', 'school_admin', '[]',
   'a0000000-0000-0000-0000-000000000002', true),

  -- Super Teacher — Sunrise International
  ('b0000000-0000-0000-0000-000000000003',
   'Adwoa Asante', 'super@sunrise.edu.gh', '+233244100003',
   'super123', 'super_teacher', '[]',
   'a0000000-0000-0000-0000-000000000002', true),

  -- Teacher — Ananse, KG 1 & KG 2, Mathematics
  ('b0000000-0000-0000-0000-000000000004',
   'Akosua Mensah', 'akosua@ananse.edu.gh', '+233244100004',
   'teacher123', 'teacher', '["KG 1","KG 2"]',
   'a0000000-0000-0000-0000-000000000001', true),

  -- Teacher — Ananse, Primary 1-3, Mathematics + English
  ('b0000000-0000-0000-0000-000000000005',
   'Emmanuel Boateng', 'emmanuel@ananse.edu.gh', '+233244100005',
   'teacher123', 'teacher', '["Primary 1","Primary 2","Primary 3"]',
   'a0000000-0000-0000-0000-000000000001', true),

  -- Teacher — Ananse, Primary 4-6, Science + Mathematics
  ('b0000000-0000-0000-0000-000000000006',
   'Grace Darko', 'grace@ananse.edu.gh', '+233244100006',
   'teacher123', 'teacher', '["Primary 4","Primary 5","Primary 6"]',
   'a0000000-0000-0000-0000-000000000001', true),

  -- Teacher — Ananse, JHS 1-3, Social Studies + English
  ('b0000000-0000-0000-0000-000000000007',
   'Kwame Owusu', 'kwame@ananse.edu.gh', '+233244100007',
   'teacher123', 'teacher', '["JHS 1","JHS 2","JHS 3"]',
   'a0000000-0000-0000-0000-000000000001', true),

  -- Teacher — Sunrise, Primary 1-3, English + Mathematics
  ('b0000000-0000-0000-0000-000000000008',
   'Abena Frimpong', 'abena@sunrise.edu.gh', '+233244100008',
   'teacher123', 'teacher', '["Primary 1","Primary 2","Primary 3"]',
   'a0000000-0000-0000-0000-000000000002', true)

ON CONFLICT (email) DO NOTHING;
