-- ============================================================
-- 01 — Schools
-- 2 schools: Ananse Academy (fully populated) + Sunrise International
-- ============================================================

INSERT INTO public.schools (
  id, name, code, address, phone, email, motto, academic_year, is_active,
  gate_latitude, gate_longitude, attendance_radius_meters,
  late_threshold_time, early_departure_time, work_start_time, work_end_time,
  late_notification_enabled, admin_notification_email,
  notify_on_absence, notify_on_early_departure
) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Ananse Academy', 'ANANSE',
    'Plot 14, Osu, Accra, Ghana',
    '+233302123456', 'info@ananse.edu.gh',
    'Excellence Through Knowledge', '2025/2026', true,
    5.5502, -0.2174, 80,
    '08:00:00', '14:30:00', '07:30:00', '15:30:00',
    true, 'admin@ananse.edu.gh',
    true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Sunrise International School', 'SUNRISE',
    '22 Airport Road, Accra, Ghana',
    '+233302987654', 'info@sunrise.edu.gh',
    'Rising Together', '2025/2026', true,
    5.6037, -0.1870, 100,
    '07:45:00', '14:00:00', '07:15:00', '15:00:00',
    false, 'admin@sunrise.edu.gh',
    false, false
  )
ON CONFLICT (code) DO NOTHING;
