-- ============================================================
-- 00 — Create Missing Tables + RLS Policies
-- Run this FIRST before any other test-data file.
-- Safe to re-run (CREATE TABLE IF NOT EXISTS).
-- ============================================================

-- teacher_assignments
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id            uuid    NOT NULL,
  school_id             uuid    NOT NULL,
  assigned_classes      text[]  NOT NULL DEFAULT '{}',
  assigned_subjects     text[]  NOT NULL DEFAULT '{}',
  assignment_mode       text    NOT NULL DEFAULT 'multi-class',
  class_subject_mapping jsonb,
  assigned_by           uuid,
  assigned_at           timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  notes                 text,
  is_active             boolean DEFAULT true,
  CONSTRAINT uq_teacher_school UNIQUE (teacher_id, school_id),
  CONSTRAINT assignment_mode_check CHECK (
    assignment_mode = ANY (ARRAY['multi-class','multi-subject','multi-both'])
  )
);

-- teacher_punch_clock
CREATE TABLE IF NOT EXISTS public.teacher_punch_clock (
  id                        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id                uuid             NOT NULL,
  school_id                 uuid             NOT NULL,
  date                      date             NOT NULL,
  punch_in_time             timestamptz,
  punch_out_time            timestamptz,
  punch_in_latitude         double precision,
  punch_in_longitude        double precision,
  punch_out_latitude        double precision,
  punch_out_longitude       double precision,
  punch_in_photo_url        text,
  punch_out_photo_url       text,
  punch_in_verified         boolean DEFAULT false,
  punch_out_verified        boolean DEFAULT false,
  punch_in_distance_meters  integer,
  punch_out_distance_meters integer,
  notes                     text,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now(),
  CONSTRAINT uq_teacher_date UNIQUE (teacher_id, date)
);

-- leave_types
CREATE TABLE IF NOT EXISTS public.leave_types (
  id                     uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id              uuid,
  name                   text    NOT NULL,
  description            text,
  days_allowed           integer NOT NULL DEFAULT 5,
  requires_documentation boolean DEFAULT false,
  is_paid                boolean DEFAULT true,
  color                  text    DEFAULT '#3B82F6',
  is_active              boolean DEFAULT true,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- leave_requests
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id         uuid    NOT NULL,
  teacher_id        uuid    NOT NULL,
  teacher_name      text    NOT NULL,
  leave_type_id     uuid,
  leave_type_name   text    NOT NULL,
  start_date        date    NOT NULL,
  end_date          date    NOT NULL,
  total_days        integer NOT NULL DEFAULT 1,
  reason            text,
  documentation_url text,
  status            text    NOT NULL DEFAULT 'pending',
  reviewed_by       uuid,
  reviewed_by_name  text,
  reviewed_at       timestamptz,
  review_notes      text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  CONSTRAINT leave_requests_status_check CHECK (
    status = ANY (ARRAY['pending','approved','rejected','cancelled'])
  )
);

-- leave_balances
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id       uuid    NOT NULL,
  teacher_id      uuid    NOT NULL,
  leave_type_id   uuid    NOT NULL,
  year            integer NOT NULL,
  total_days      integer NOT NULL DEFAULT 0,
  used_days       integer NOT NULL DEFAULT 0,
  remaining_days  integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  CONSTRAINT uq_leave_balance UNIQUE (school_id, teacher_id, leave_type_id, year)
);

-- student_bills
CREATE TABLE IF NOT EXISTS public.student_bills (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_code        text    NOT NULL UNIQUE,
  school_id        uuid    NOT NULL,
  student_id       uuid    NOT NULL,
  student_name     text,
  class_id         text,
  class_name       text,
  term             text    NOT NULL,
  academic_year    text    NOT NULL,
  line_items       jsonb   NOT NULL DEFAULT '[]',
  subtotal         numeric NOT NULL DEFAULT 0,
  discounts        jsonb   NOT NULL DEFAULT '[]',
  total_discount   numeric NOT NULL DEFAULT 0,
  previous_balance numeric NOT NULL DEFAULT 0,
  total_amount     numeric NOT NULL DEFAULT 0,
  amount_paid      numeric NOT NULL DEFAULT 0,
  balance          numeric NOT NULL DEFAULT 0,
  status           text    NOT NULL DEFAULT 'pending',
  due_date         date,
  sent_via_whatsapp boolean DEFAULT false,
  whatsapp_sent_at  timestamptz,
  created_at        timestamptz DEFAULT now(),
  CONSTRAINT student_bills_status_check CHECK (
    status = ANY (ARRAY['pending','partial','paid','overdue'])
  )
);

-- fee_payments
CREATE TABLE IF NOT EXISTS public.fee_payments (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id          uuid    NOT NULL,
  student_id       uuid    NOT NULL,
  amount           numeric NOT NULL,
  payment_method   text    NOT NULL DEFAULT 'cash',
  transaction_id   text,
  hubtel_reference text,
  payment_status   text    NOT NULL DEFAULT 'success',
  receipt_number   text,
  receipt_sent     boolean DEFAULT false,
  payment_date     date    NOT NULL,
  notes            text,
  created_at       timestamptz DEFAULT now(),
  CONSTRAINT fee_payments_method_check CHECK (
    payment_method = ANY (ARRAY['momo','card','bank','cash'])
  ),
  CONSTRAINT fee_payments_status_check CHECK (
    payment_status = ANY (ARRAY['pending','success','failed'])
  )
);

-- discount_types
CREATE TABLE IF NOT EXISTS public.discount_types (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id      uuid NOT NULL,
  name           text NOT NULL,
  description    text,
  discount_type  text NOT NULL DEFAULT 'percentage',
  default_value  numeric NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  CONSTRAINT discount_type_check CHECK (
    discount_type = ANY (ARRAY['percentage','fixed'])
  )
);

-- student_discounts
CREATE TABLE IF NOT EXISTS public.student_discounts (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id       uuid    NOT NULL,
  discount_type_id uuid    NOT NULL,
  discount_value   numeric NOT NULL,
  is_percentage    boolean DEFAULT true,
  reason           text,
  created_at       timestamptz DEFAULT now()
);

-- late_arrival_notifications
CREATE TABLE IF NOT EXISTS public.late_arrival_notifications (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id            uuid NOT NULL,
  teacher_id           uuid NOT NULL,
  teacher_name         text NOT NULL,
  punch_in_time        timestamptz NOT NULL,
  late_threshold_time  text NOT NULL,
  minutes_late         integer NOT NULL DEFAULT 0,
  notification_type    text NOT NULL DEFAULT 'email',
  notification_sent_at timestamptz DEFAULT now(),
  notification_status  text NOT NULL DEFAULT 'sent',
  recipient_phone      text,
  recipient_email      text,
  created_at           timestamptz DEFAULT now()
);

-- ============================================================
-- Enable RLS + permissive policies on all new tables
-- ============================================================
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'teacher_assignments','teacher_punch_clock',
    'leave_types','leave_requests','leave_balances',
    'student_bills','fee_payments',
    'discount_types','student_discounts',
    'late_arrival_notifications'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "allow_all" ON public.%I', tbl);
    EXECUTE format(
      'CREATE POLICY "allow_all" ON public.%I USING (true) WITH CHECK (true)', tbl
    );
  END LOOP;
END $$;
