-- ============================================================
-- 03 — Term Settings + Teacher Assignments
-- ============================================================

-- Term Settings (2025/2026 academic year)
INSERT INTO public.term_settings
  (id, academic_year, term_number, term_name, start_date, end_date, user_id)
VALUES
  ('t0000000-0000-0000-0000-000000000001',
   '2025/2026', 1, 'First Term',  '2025-09-02', '2025-12-12',
   'b0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000002',
   '2025/2026', 2, 'Second Term', '2026-01-12', '2026-04-02',
   'b0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000003',
   '2025/2026', 3, 'Third Term',  '2026-04-20', '2026-07-17',
   'b0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Teacher Assignments — Ananse Academy
-- ============================================================
INSERT INTO public.teacher_assignments
  (teacher_id, school_id, assigned_classes, assigned_subjects, assignment_mode, assigned_by, is_active)
VALUES
  -- Demo Teacher → KG 1, KG 2 — English Language
  ('fdf6539c-efa5-4205-9b9e-3ee3140d85e7',
   'a0000000-0000-0000-0000-000000000001',
   ARRAY['KG 1','KG 2'], ARRAY['English Language'],
   'multi-class', '41370924-e180-4985-b0d5-e618c2a35e9e', true),

  -- Akosua Mensah → KG 1, KG 2 — Mathematics
  ('b0000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000001',
   ARRAY['KG 1','KG 2'], ARRAY['Mathematics'],
   'multi-class', '41370924-e180-4985-b0d5-e618c2a35e9e', true),

  -- Emmanuel Boateng → Primary 1-3 — Mathematics, English Language
  ('b0000000-0000-0000-0000-000000000005',
   'a0000000-0000-0000-0000-000000000001',
   ARRAY['Primary 1','Primary 2','Primary 3'],
   ARRAY['Mathematics','English Language'],
   'multi-class', '41370924-e180-4985-b0d5-e618c2a35e9e', true),

  -- Grace Darko → Primary 4-6 — Science, Mathematics
  ('b0000000-0000-0000-0000-000000000006',
   'a0000000-0000-0000-0000-000000000001',
   ARRAY['Primary 4','Primary 5','Primary 6'],
   ARRAY['Science','Mathematics'],
   'multi-class', '41370924-e180-4985-b0d5-e618c2a35e9e', true),

  -- Kwame Owusu → JHS 1-3 — Social Studies, English Language
  ('b0000000-0000-0000-0000-000000000007',
   'a0000000-0000-0000-0000-000000000001',
   ARRAY['JHS 1','JHS 2','JHS 3'],
   ARRAY['Social Studies','English Language'],
   'multi-class', '41370924-e180-4985-b0d5-e618c2a35e9e', true)

ON CONFLICT (teacher_id, school_id) DO NOTHING;

-- Teacher Assignment — Sunrise International
INSERT INTO public.teacher_assignments
  (teacher_id, school_id, assigned_classes, assigned_subjects, assignment_mode, assigned_by, is_active)
VALUES
  ('b0000000-0000-0000-0000-000000000008',
   'a0000000-0000-0000-0000-000000000002',
   ARRAY['Primary 1','Primary 2','Primary 3'],
   ARRAY['English Language','Mathematics'],
   'multi-class', 'b0000000-0000-0000-0000-000000000002', true)
ON CONFLICT (teacher_id, school_id) DO NOTHING;

-- ============================================================
-- Super Teacher Assignments
-- ============================================================
INSERT INTO public.super_teacher_assignments
  (super_teacher_id, subject, class_level, assigned_by, is_active)
VALUES
  -- Existing Super Teacher (Ananse) — Mathematics KG through Primary 3
  ('2d0b7399-64a2-4997-acc8-276a62d12d55','Mathematics','KG 1',     '41370924-e180-4985-b0d5-e618c2a35e9e',true),
  ('2d0b7399-64a2-4997-acc8-276a62d12d55','Mathematics','KG 2',     '41370924-e180-4985-b0d5-e618c2a35e9e',true),
  ('2d0b7399-64a2-4997-acc8-276a62d12d55','Mathematics','Primary 1','41370924-e180-4985-b0d5-e618c2a35e9e',true),
  ('2d0b7399-64a2-4997-acc8-276a62d12d55','Mathematics','Primary 2','41370924-e180-4985-b0d5-e618c2a35e9e',true),
  ('2d0b7399-64a2-4997-acc8-276a62d12d55','Mathematics','Primary 3','41370924-e180-4985-b0d5-e618c2a35e9e',true),
  -- English Language JHS
  ('2d0b7399-64a2-4997-acc8-276a62d12d55','English Language','JHS 1','41370924-e180-4985-b0d5-e618c2a35e9e',true),
  ('2d0b7399-64a2-4997-acc8-276a62d12d55','English Language','JHS 2','41370924-e180-4985-b0d5-e618c2a35e9e',true),
  ('2d0b7399-64a2-4997-acc8-276a62d12d55','English Language','JHS 3','41370924-e180-4985-b0d5-e618c2a35e9e',true),

  -- Adwoa Asante (Sunrise Super Teacher)
  ('b0000000-0000-0000-0000-000000000003','Mathematics','Primary 1','b0000000-0000-0000-0000-000000000002',true),
  ('b0000000-0000-0000-0000-000000000003','Mathematics','Primary 2','b0000000-0000-0000-0000-000000000002',true),
  ('b0000000-0000-0000-0000-000000000003','Science',    'Primary 3','b0000000-0000-0000-0000-000000000002',true)

ON CONFLICT (super_teacher_id, subject, class_level) DO NOTHING;
