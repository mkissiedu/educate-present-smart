-- ============================================================
-- 09 — Student Bills & Fee Payments (Ananse Academy)
--
-- Fee structure per term (GHS):
--   School Fees   800
--   PTA Levies     50
--   Library Levy   20
--   Sports Fund    30
--   TOTAL         900
--
-- Bill statuses:
--   paid (4) — STU-016, STU-019, STU-025, STU-028
--   partial (2) — STU-007 (paid 500), STU-022 (paid 600)
--   pending (3) — STU-001, STU-004, STU-013
--   overdue (1) — STU-031 (due Apr 30, unpaid)
-- ============================================================

-- ── Discount Type (Scholarship) ──────────────────────────────
INSERT INTO public.discount_types
  (id, school_id, name, description, discount_type, default_value)
VALUES
  ('o0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   'Scholarship Discount',
   'Applied to students on the school scholarship programme',
   'percentage', 20)
ON CONFLICT (id) DO NOTHING;

-- ── Student Bills ─────────────────────────────────────────────
INSERT INTO public.student_bills (
  id, bill_code, school_id, student_id, student_name,
  class_id, class_name, term, academic_year,
  line_items, subtotal,
  discounts, total_discount, previous_balance,
  total_amount, amount_paid, balance,
  status, due_date, sent_via_whatsapp
) VALUES

  -- 1. KG 1 — Kwame Mensah — PENDING
  ('i0000000-0000-0000-0000-000000000001',
   'BL-ANANSE-001',
   'a0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'Kwame Mensah', 'KG 1', 'KG 1',
   'Third Term', '2025/2026',
   '[{"id":"1","name":"School Fees","amount":800,"isOptional":false},{"id":"2","name":"PTA Levies","amount":50,"isOptional":false},{"id":"3","name":"Library Levy","amount":20,"isOptional":false},{"id":"4","name":"Sports Fund","amount":30,"isOptional":true}]'::jsonb,
   900, '[]'::jsonb, 0, 0, 900, 0, 900,
   'pending', '2026-05-30', false),

  -- 2. KG 2 — Akua Owusu — PENDING
  ('i0000000-0000-0000-0000-000000000002',
   'BL-ANANSE-002',
   'a0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000004',
   'Akua Owusu', 'KG 2', 'KG 2',
   'Third Term', '2025/2026',
   '[{"id":"1","name":"School Fees","amount":800,"isOptional":false},{"id":"2","name":"PTA Levies","amount":50,"isOptional":false},{"id":"3","name":"Library Levy","amount":20,"isOptional":false},{"id":"4","name":"Sports Fund","amount":30,"isOptional":true}]'::jsonb,
   900, '[]'::jsonb, 0, 0, 900, 0, 900,
   'pending', '2026-05-30', false),

  -- 3. Primary 1 — Emmanuel Appiah — PARTIAL (paid 500)
  ('i0000000-0000-0000-0000-000000000003',
   'BL-ANANSE-003',
   'a0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000007',
   'Emmanuel Appiah', 'Primary 1', 'Primary 1',
   'Third Term', '2025/2026',
   '[{"id":"1","name":"School Fees","amount":800,"isOptional":false},{"id":"2","name":"PTA Levies","amount":50,"isOptional":false},{"id":"3","name":"Library Levy","amount":20,"isOptional":false},{"id":"4","name":"Sports Fund","amount":30,"isOptional":true}]'::jsonb,
   900, '[]'::jsonb, 0, 0, 900, 500, 400,
   'partial', '2026-05-30', true),

  -- 4. Primary 3 — Kweku Asare — PENDING
  ('i0000000-0000-0000-0000-000000000004',
   'BL-ANANSE-004',
   'a0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000013',
   'Kweku Asare', 'Primary 3', 'Primary 3',
   'Third Term', '2025/2026',
   '[{"id":"1","name":"School Fees","amount":800,"isOptional":false},{"id":"2","name":"PTA Levies","amount":50,"isOptional":false},{"id":"3","name":"Library Levy","amount":20,"isOptional":false},{"id":"4","name":"Sports Fund","amount":30,"isOptional":true}]'::jsonb,
   900, '[]'::jsonb, 0, 0, 900, 0, 900,
   'pending', '2026-05-30', false),

  -- 5. Primary 4 — Maame Adomako — PAID
  ('i0000000-0000-0000-0000-000000000005',
   'BL-ANANSE-005',
   'a0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000016',
   'Maame Adomako', 'Primary 4', 'Primary 4',
   'Third Term', '2025/2026',
   '[{"id":"1","name":"School Fees","amount":800,"isOptional":false},{"id":"2","name":"PTA Levies","amount":50,"isOptional":false},{"id":"3","name":"Library Levy","amount":20,"isOptional":false},{"id":"4","name":"Sports Fund","amount":30,"isOptional":true}]'::jsonb,
   900, '[]'::jsonb, 0, 0, 900, 900, 0,
   'paid', '2026-05-30', true),

  -- 6. Primary 5 — Bernard Mensah — PAID
  ('i0000000-0000-0000-0000-000000000006',
   'BL-ANANSE-006',
   'a0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000019',
   'Bernard Mensah', 'Primary 5', 'Primary 5',
   'Third Term', '2025/2026',
   '[{"id":"1","name":"School Fees","amount":800,"isOptional":false},{"id":"2","name":"PTA Levies","amount":50,"isOptional":false},{"id":"3","name":"Library Levy","amount":20,"isOptional":false},{"id":"4","name":"Sports Fund","amount":30,"isOptional":true}]'::jsonb,
   900, '[]'::jsonb, 0, 0, 900, 900, 0,
   'paid', '2026-05-30', true),

  -- 7. Primary 6 — Naomi Owusu — PARTIAL (paid 600, scholarship on fees)
  ('i0000000-0000-0000-0000-000000000007',
   'BL-ANANSE-007',
   'a0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000022',
   'Naomi Owusu', 'Primary 6', 'Primary 6',
   'Third Term', '2025/2026',
   '[{"id":"1","name":"School Fees","amount":800,"isOptional":false},{"id":"2","name":"PTA Levies","amount":50,"isOptional":false},{"id":"3","name":"Library Levy","amount":20,"isOptional":false},{"id":"4","name":"Sports Fund","amount":30,"isOptional":true}]'::jsonb,
   900,
   '[{"id":"disc1","discount_type_id":"o0000000-0000-0000-0000-000000000001","discount_name":"Scholarship Discount","discount_value":20,"is_percentage":true}]'::jsonb,
   160, 0, 740, 600, 140,
   'partial', '2026-05-30', true),

  -- 8. JHS 1 — Kojo Appiah — PAID
  ('i0000000-0000-0000-0000-000000000008',
   'BL-ANANSE-008',
   'a0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000025',
   'Kojo Appiah', 'JHS 1', 'JHS 1',
   'Third Term', '2025/2026',
   '[{"id":"1","name":"School Fees","amount":800,"isOptional":false},{"id":"2","name":"PTA Levies","amount":50,"isOptional":false},{"id":"3","name":"Library Levy","amount":20,"isOptional":false},{"id":"4","name":"Sports Fund","amount":30,"isOptional":true}]'::jsonb,
   900, '[]'::jsonb, 0, 0, 900, 900, 0,
   'paid', '2026-05-30', true),

  -- 9. JHS 2 — Akwasi Darko — PAID
  ('i0000000-0000-0000-0000-000000000009',
   'BL-ANANSE-009',
   'a0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000028',
   'Akwasi Darko', 'JHS 2', 'JHS 2',
   'Third Term', '2025/2026',
   '[{"id":"1","name":"School Fees","amount":800,"isOptional":false},{"id":"2","name":"PTA Levies","amount":50,"isOptional":false},{"id":"3","name":"Library Levy","amount":20,"isOptional":false},{"id":"4","name":"Sports Fund","amount":30,"isOptional":true}]'::jsonb,
   900, '[]'::jsonb, 0, 0, 900, 900, 0,
   'paid', '2026-05-30', true),

  -- 10. JHS 3 — Thomas Kusi — OVERDUE (due Apr 30, nothing paid)
  ('i0000000-0000-0000-0000-000000000010',
   'BL-ANANSE-010',
   'a0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000031',
   'Thomas Kusi', 'JHS 3', 'JHS 3',
   'Third Term', '2025/2026',
   '[{"id":"1","name":"School Fees","amount":800,"isOptional":false},{"id":"2","name":"PTA Levies","amount":50,"isOptional":false},{"id":"3","name":"Library Levy","amount":20,"isOptional":false},{"id":"4","name":"Sports Fund","amount":30,"isOptional":true}]'::jsonb,
   900, '[]'::jsonb, 0, 0, 900, 0, 900,
   'overdue', '2026-04-30', false)

ON CONFLICT (bill_code) DO NOTHING;

-- ── Fee Payments ──────────────────────────────────────────────
INSERT INTO public.fee_payments (
  id, bill_id, student_id,
  amount, payment_method, payment_status,
  receipt_number, receipt_sent, payment_date, notes
) VALUES

  -- Bill 3 — Emmanuel Appiah partial (500 GHS via MoMo)
  ('j0000000-0000-0000-0000-000000000001',
   'i0000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000007',
   500, 'momo', 'success',
   'RCP-2026-001', true, '2026-05-01',
   'Partial payment via MTN MoMo — balance of 400 GHS outstanding'),

  -- Bill 5 — Maame Adomako full payment (900 GHS via MoMo)
  ('j0000000-0000-0000-0000-000000000002',
   'i0000000-0000-0000-0000-000000000005',
   'c1000000-0000-0000-0000-000000000016',
   900, 'momo', 'success',
   'RCP-2026-002', true, '2026-04-25',
   'Full payment via MTN MoMo'),

  -- Bill 6 — Bernard Mensah full payment (900 GHS cash)
  ('j0000000-0000-0000-0000-000000000003',
   'i0000000-0000-0000-0000-000000000006',
   'c1000000-0000-0000-0000-000000000019',
   900, 'cash', 'success',
   'RCP-2026-003', true, '2026-04-22',
   'Full payment — cash received at school office'),

  -- Bill 7 — Naomi Owusu partial (600 GHS bank transfer)
  ('j0000000-0000-0000-0000-000000000004',
   'i0000000-0000-0000-0000-000000000007',
   'c1000000-0000-0000-0000-000000000022',
   600, 'bank', 'success',
   'RCP-2026-004', true, '2026-04-29',
   'Bank transfer — scholarship discount applied; 140 GHS balance remaining'),

  -- Bill 8 — Kojo Appiah full payment (900 GHS via MoMo)
  ('j0000000-0000-0000-0000-000000000005',
   'i0000000-0000-0000-0000-000000000008',
   'c1000000-0000-0000-0000-000000000025',
   900, 'momo', 'success',
   'RCP-2026-005', true, '2026-04-28',
   'Full payment via Vodafone Cash'),

  -- Bill 9 — Akwasi Darko full payment (900 GHS via MoMo)
  ('j0000000-0000-0000-0000-000000000006',
   'i0000000-0000-0000-0000-000000000009',
   'c1000000-0000-0000-0000-000000000028',
   900, 'momo', 'success',
   'RCP-2026-006', true, '2026-05-03',
   'Full payment via MTN MoMo')

ON CONFLICT (id) DO NOTHING;
