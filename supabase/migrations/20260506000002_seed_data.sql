-- ============================================================
-- Catalyst Education Platform — Seed Data
-- ============================================================
-- NOTE: Demo user passwords below are stored as plain text.
-- The original Famous AI project inserted them this way.
-- Once your edge functions (create-user, verify-otp) are
-- deployed, new users will have properly hashed passwords.
-- You should update these passwords after first login or
-- re-create these users via the create-user edge function.
-- ============================================================

-- System settings (required for OTP, email, and SMS config)
INSERT INTO public.system_settings (id, setting_key, setting_value, description, updated_at, updated_by) VALUES
(
  '25a4a438-929d-4b72-acc9-8ece5a7e5554',
  'sms_config',
  '{"enabled": false, "provider": "twilio", "auth_token": "", "account_sid": "", "from_number": "", "whatsapp_number": "", "whatsapp_enabled": false}',
  'SMS/WhatsApp configuration via Twilio',
  now(),
  NULL
),
(
  '9e0b5b2e-e6d8-4d0f-985c-5e63a262d797',
  'smtp_config',
  '{"api_key": "", "enabled": false, "provider": "", "from_name": "Catalyst Education", "from_email": ""}',
  'Email configuration (Resend, SendGrid, or Mailgun)',
  now(),
  NULL
),
(
  '3e93d396-03dc-48a4-9960-9683a9cb8f0d',
  'otp_config',
  '{"code_length": 6, "max_attempts": 5, "expiry_minutes": 10}',
  'OTP generation and validation settings',
  now(),
  NULL
);

-- Demo users (WARNING: plain-text passwords — replace via edge function after setup)
INSERT INTO public.users (id, name, email, phone, password_hash, role, assigned_classes, avatar, school_id, is_active, created_at, updated_at) VALUES
(
  'fdf6539c-efa5-4205-9b9e-3ee3140d85e7',
  'Demo Teacher',
  'teacher@ananse.edu',
  '+233244222222',
  'teacher123',
  'teacher',
  '["KG 1", "KG 2"]',
  NULL,
  NULL,
  true,
  now(),
  now()
),
(
  '41370924-e180-4985-b0d5-e618c2a35e9e',
  'School Admin',
  'admin@ananse.edu',
  '+233244000000',
  'admin123',
  'school_admin',
  '[]',
  NULL,
  NULL,
  true,
  now(),
  now()
),
(
  '2d0b7399-64a2-4997-acc8-276a62d12d55',
  'Super Teacher',
  'super@ananse.edu',
  '+233244111111',
  'super123',
  'super_teacher',
  '[]',
  NULL,
  NULL,
  true,
  now(),
  now()
),
(
  'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
  'Super Admin',
  'superadmin@catalyst.edu',
  '+233240000000',
  'superadmin123',
  'super_admin',
  '[]',
  NULL,
  NULL,
  true,
  now(),
  now()
);
