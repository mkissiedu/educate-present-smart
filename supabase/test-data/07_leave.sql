-- ============================================================
-- 07 — Leave Types, Requests & Balances
-- Global leave types (school_id = NULL) visible to all schools.
-- Requests cover: 2 pending, 2 approved, 1 rejected.
-- ============================================================

-- ── Leave Types (global defaults) ────────────────────────────
INSERT INTO public.leave_types
  (id, school_id, name, description, days_allowed, requires_documentation, is_paid, color, is_active)
VALUES
  ('d0000000-0000-0000-0000-000000000001',
   NULL, 'Annual Leave',
   'Standard annual leave entitlement for all teaching staff',
   10, false, true, '#3B82F6', true),

  ('d0000000-0000-0000-0000-000000000002',
   NULL, 'Sick Leave',
   'Medical leave — documentation required for 3 or more consecutive days',
   5, false, true, '#EF4444', true),

  ('d0000000-0000-0000-0000-000000000003',
   NULL, 'Maternity Leave',
   'Paid maternity leave for female staff — medical certificate required',
   84, true, true, '#EC4899', true),

  ('d0000000-0000-0000-0000-000000000004',
   NULL, 'Study Leave',
   'Unpaid leave for approved professional development programmes',
   5, true, false, '#8B5CF6', true)

ON CONFLICT (id) DO NOTHING;

-- ── Leave Requests ────────────────────────────────────────────
INSERT INTO public.leave_requests (
  id, school_id, teacher_id, teacher_name,
  leave_type_id, leave_type_name,
  start_date, end_date, total_days,
  reason, status,
  reviewed_by, reviewed_by_name, reviewed_at, review_notes
) VALUES

  -- 1. PENDING — Grace Darko, Sick Leave (upcoming)
  ('e0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000006', 'Grace Darko',
   'd0000000-0000-0000-0000-000000000002', 'Sick Leave',
   '2026-05-13', '2026-05-14', 2,
   'Experiencing recurring fever and headache. Visiting doctor on May 13.',
   'pending', NULL, NULL, NULL, NULL),

  -- 2. PENDING — Emmanuel Boateng, Annual Leave (upcoming)
  ('e0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000005', 'Emmanuel Boateng',
   'd0000000-0000-0000-0000-000000000001', 'Annual Leave',
   '2026-05-20', '2026-05-22', 3,
   'Family travel — attending aunt''s traditional marriage ceremony in Kumasi.',
   'pending', NULL, NULL, NULL, NULL),

  -- 3. APPROVED — Demo Teacher, Annual Leave (past — Easter break)
  ('e0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000001',
   'fdf6539c-efa5-4205-9b9e-3ee3140d85e7', 'Demo Teacher',
   'd0000000-0000-0000-0000-000000000001', 'Annual Leave',
   '2026-04-07', '2026-04-09', 3,
   'Easter family travel.',
   'approved',
   '41370924-e180-4985-b0d5-e618c2a35e9e', 'School Admin',
   '2026-04-03 10:00:00+00', 'Approved. Ensure lesson notes are left for the substitute teacher.'),

  -- 4. APPROVED — Akosua Mensah, Sick Leave (past)
  ('e0000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000004', 'Akosua Mensah',
   'd0000000-0000-0000-0000-000000000002', 'Sick Leave',
   '2026-03-10', '2026-03-10', 1,
   'Sudden illness — high temperature and vomiting.',
   'approved',
   '41370924-e180-4985-b0d5-e618c2a35e9e', 'School Admin',
   '2026-03-10 08:30:00+00', 'Approved. Get well soon.'),

  -- 5. REJECTED — Kwame Owusu, Study Leave
  ('e0000000-0000-0000-0000-000000000005',
   'a0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000007', 'Kwame Owusu',
   'd0000000-0000-0000-0000-000000000004', 'Study Leave',
   '2026-05-18', '2026-05-22', 5,
   'Attending a week-long Social Studies curriculum workshop in Accra.',
   'rejected',
   '41370924-e180-4985-b0d5-e618c2a35e9e', 'School Admin',
   '2026-05-08 14:00:00+00', 'Rejected — exam period begins May 18. Please reapply for a date after term ends.')

ON CONFLICT (id) DO NOTHING;

-- ── Leave Balances (year 2026 — Ananse Academy teachers) ─────
INSERT INTO public.leave_balances
  (school_id, teacher_id, leave_type_id, year, total_days, used_days, remaining_days)
VALUES
  -- Demo Teacher
  ('a0000000-0000-0000-0000-000000000001','fdf6539c-efa5-4205-9b9e-3ee3140d85e7','d0000000-0000-0000-0000-000000000001',2026,10,3,7),
  ('a0000000-0000-0000-0000-000000000001','fdf6539c-efa5-4205-9b9e-3ee3140d85e7','d0000000-0000-0000-0000-000000000002',2026,5,0,5),

  -- Akosua Mensah
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000004','d0000000-0000-0000-0000-000000000001',2026,10,0,10),
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000004','d0000000-0000-0000-0000-000000000002',2026,5,1,4),

  -- Emmanuel Boateng
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000005','d0000000-0000-0000-0000-000000000001',2026,10,0,10),
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000005','d0000000-0000-0000-0000-000000000002',2026,5,0,5),

  -- Grace Darko
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000006','d0000000-0000-0000-0000-000000000001',2026,10,0,10),
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000006','d0000000-0000-0000-0000-000000000002',2026,5,1,4),

  -- Kwame Owusu
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000007','d0000000-0000-0000-0000-000000000001',2026,10,0,10),
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000007','d0000000-0000-0000-0000-000000000002',2026,5,0,5),
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000007','d0000000-0000-0000-0000-000000000004',2026,5,0,5)

ON CONFLICT (school_id, teacher_id, leave_type_id, year) DO NOTHING;
