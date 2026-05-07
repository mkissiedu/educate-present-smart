-- ============================================================
-- Catalyst Education Platform — Initial Schema
-- Migrated from Famous AI (DatabasePad) → Supabase
--
-- Changes from original dump:
--   • "prj_Ql-drVcwelGY" schema → public schema
--   • _auth and _storage schemas skipped (Supabase manages these)
--   • "prj_Ql-drVcwelGY_auth".auth_uid() → auth.uid()
--   • "prj_Ql-drVcwelGY_role" role → authenticated
-- ============================================================

-- ============================================================
-- CORE APP TABLES
-- ============================================================

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    password_hash text NOT NULL,
    role text DEFAULT 'teacher'::text NOT NULL,
    assigned_classes jsonb DEFAULT '[]'::jsonb,
    avatar text,
    school_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['teacher'::text, 'super_teacher'::text, 'school_admin'::text, 'platform_admin'::text, 'super_admin'::text])))
);

CREATE TABLE public.schools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    logo_url text,
    address text,
    phone text,
    email text,
    motto text,
    academic_year text,
    is_active boolean DEFAULT true,
    gate_latitude double precision,
    gate_longitude double precision,
    attendance_radius_meters integer DEFAULT 100,
    late_threshold_time text DEFAULT '08:00'::text,
    early_departure_time text DEFAULT '14:00'::text,
    work_start_time text DEFAULT '07:30'::text,
    work_end_time text DEFAULT '15:00'::text,
    late_notification_enabled boolean DEFAULT false,
    admin_notification_phone text,
    admin_notification_email text,
    notify_on_absence boolean DEFAULT false,
    notify_on_early_departure boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    user_email text NOT NULL,
    user_role text NOT NULL,
    user_name text,
    user_data jsonb DEFAULT '{}'::jsonb,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    last_active_at timestamp with time zone DEFAULT now(),
    is_revoked boolean DEFAULT false,
    ip_address text,
    user_agent text,
    revoked_at timestamp with time zone
);

CREATE TABLE public.otp_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    code text NOT NULL,
    type text DEFAULT 'login'::text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    attempts integer DEFAULT 0,
    max_attempts integer DEFAULT 5,
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.system_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key text NOT NULL,
    setting_value jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid
);

-- ============================================================
-- LESSON TABLES
-- ============================================================

CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    subject text,
    class_level text,
    week integer DEFAULT 1,
    lesson_number integer DEFAULT 1,
    duration text,
    thumbnail_url text,
    slides jsonb DEFAULT '[]'::jsonb,
    is_favorite boolean DEFAULT false,
    scheduled_date text,
    scheduled_time text,
    curriculum_info jsonb,
    last_presented timestamp with time zone,
    user_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.lesson_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_id text NOT NULL,
    scheduled_date date NOT NULL,
    scheduled_time text,
    duration_minutes integer DEFAULT 30,
    user_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- STUDENT & TEACHER TABLES
-- ============================================================

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text DEFAULT ''::text NOT NULL,
    last_name text DEFAULT ''::text NOT NULL,
    name text GENERATED ALWAYS AS (TRIM(BOTH FROM ((first_name || ' '::text) || last_name))) STORED,
    class_level text NOT NULL,
    class_name text,
    class_id text,
    date_of_birth date,
    student_id text,
    teacher_id uuid,
    school_id uuid,
    guardian1_name text,
    guardian1_whatsapp text,
    guardian1_email text,
    guardian2_name text,
    guardian2_whatsapp text,
    guardian2_email text,
    parent_phone text,
    guardian_phone text,
    parent_email text,
    guardian_name text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.super_teacher_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    super_teacher_id uuid NOT NULL,
    subject text NOT NULL,
    class_level text NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    notes text
);

CREATE TABLE public.teacher_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    date date NOT NULL,
    status text DEFAULT 'present'::text NOT NULL,
    check_in_time timestamp with time zone,
    check_out_time timestamp with time zone,
    notes text,
    recorded_by uuid,
    school_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT teacher_attendance_status_check CHECK ((status = ANY (ARRAY['present'::text, 'absent'::text, 'late'::text, 'on_leave'::text, 'sick'::text])))
);

-- ============================================================
-- ACADEMIC TABLES
-- ============================================================

CREATE TABLE public.term_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    academic_year text NOT NULL,
    term_number integer NOT NULL,
    term_name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    user_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- PROFESSIONAL DEVELOPMENT TABLES
-- ============================================================

CREATE TABLE public.pd_courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail_url text,
    category text,
    level text,
    duration_minutes integer,
    modules jsonb DEFAULT '[]'::jsonb,
    is_published boolean DEFAULT false,
    created_by uuid,
    school_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.pd_webinars (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    host_name text,
    host_id uuid,
    scheduled_at timestamp with time zone,
    duration_minutes integer DEFAULT 60,
    meeting_url text,
    meeting_id text,
    meeting_password text,
    status text DEFAULT 'scheduled'::text,
    recording_url text,
    recording_duration integer,
    recording_thumbnail text,
    attendees jsonb DEFAULT '[]'::jsonb,
    max_attendees integer,
    created_by uuid,
    school_id uuid,
    is_public boolean DEFAULT true,
    tags text[],
    category text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.pd_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    course_id uuid,
    webinar_id uuid,
    progress integer DEFAULT 0,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    enrolled_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- CONTENT PUBLISHING TABLES
-- ============================================================

CREATE TABLE public.published_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_type text NOT NULL,
    content_id text NOT NULL,
    title text NOT NULL,
    subject text,
    class_level text,
    published_by text,
    publish_mode text DEFAULT 'all'::text,
    is_active boolean DEFAULT true,
    selected_schools text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.content_school_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid,
    school_id uuid,
    granted_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- CRM TABLES
-- ============================================================

CREATE TABLE public.crm_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    name text,
    phone text,
    sms_opt_in boolean DEFAULT false,
    address jsonb,
    source text DEFAULT 'manual'::text,
    tags text[] DEFAULT '{}'::text[],
    metadata jsonb DEFAULT '{}'::jsonb,
    ecom_customer_id uuid,
    total_orders integer DEFAULT 0,
    total_spent integer DEFAULT 0,
    last_order_at timestamp with time zone,
    subscribed boolean DEFAULT true,
    subscribed_at timestamp with time zone DEFAULT now(),
    unsubscribed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_contacts_source_check CHECK ((source = ANY (ARRAY['form'::text, 'ecom'::text, 'import'::text, 'manual'::text, 'auth'::text])))
);

CREATE TABLE public.crm_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    filter_query jsonb,
    is_dynamic boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.crm_contact_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contact_id uuid NOT NULL,
    list_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.crm_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    subject text,
    html_body text,
    text_body text,
    status text DEFAULT 'draft'::text,
    list_id uuid,
    filter_query jsonb,
    list_ids jsonb,
    style_preset text,
    images jsonb,
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    total_recipients integer DEFAULT 0,
    total_sent integer DEFAULT 0,
    total_opened integer DEFAULT 0,
    total_clicked integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_campaigns_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'sending'::text, 'sent'::text, 'failed'::text])))
);

CREATE TABLE public.crm_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contact_id uuid,
    campaign_id uuid,
    event_type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_events_event_type_check CHECK ((event_type = ANY (ARRAY['sent'::text, 'opened'::text, 'clicked'::text, 'bounced'::text, 'unsubscribed'::text])))
);

CREATE TABLE public.crm_flows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    trigger_type text NOT NULL,
    trigger_config jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_flows_trigger_type_check CHECK ((trigger_type = ANY (ARRAY['contact.subscribed'::text, 'order.placed'::text, 'contact.tagged'::text, 'user.registered'::text, 'appointment.booked'::text])))
);

CREATE TABLE public.crm_flow_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flow_id uuid,
    step_order integer NOT NULL,
    action_type text NOT NULL,
    action_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_flow_steps_action_type_check CHECK ((action_type = ANY (ARRAY['send_email'::text, 'add_tag'::text, 'add_to_list'::text])))
);

CREATE TABLE public.crm_flow_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flow_id uuid,
    step_id uuid,
    contact_id uuid,
    trigger_event text NOT NULL,
    status text DEFAULT 'executed'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_flow_logs_status_check CHECK ((status = ANY (ARRAY['executed'::text, 'failed'::text, 'skipped'::text])))
);

CREATE TABLE public.crm_calendly_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    calendly_user_uri text NOT NULL,
    calendly_user_email text,
    calendly_user_name text,
    calendly_org_uri text,
    encrypted_access_token text NOT NULL,
    signing_key text NOT NULL,
    webhook_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.crm_calendars (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text DEFAULT 'Default Calendar'::text NOT NULL,
    slug text,
    description text,
    calendar_type text DEFAULT 'personal'::text,
    owner_user_id text,
    max_participants integer DEFAULT 1,
    date_range_days integer,
    slot_duration integer DEFAULT 30,
    slot_interval integer DEFAULT 0,
    max_bookings_per_day integer,
    min_notice_hours integer DEFAULT 1,
    buffer_before integer DEFAULT 0,
    buffer_after integer DEFAULT 0,
    timezone text DEFAULT 'America/New_York'::text,
    is_active boolean DEFAULT true,
    meeting_location_type text DEFAULT 'custom'::text,
    meeting_location_value text,
    google_calendar_id text,
    google_refresh_token text,
    calendly_user_uri text,
    calendly_webhook_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    calendly_connection_id uuid,
    CONSTRAINT crm_calendars_calendar_type_check CHECK ((calendar_type = ANY (ARRAY['personal'::text, 'round_robin'::text, 'class'::text, 'collective'::text])))
);

CREATE TABLE public.crm_calendar_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    calendar_id uuid,
    user_id text NOT NULL,
    user_google_calendar_id text,
    priority integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.crm_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    calendar_id uuid,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_availability_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);

CREATE TABLE public.crm_appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    calendar_id uuid,
    contact_id uuid,
    contact_email text NOT NULL,
    contact_name text,
    contact_phone text,
    title text,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    status text DEFAULT 'confirmed'::text,
    notes text,
    source text DEFAULT 'manual'::text,
    google_event_id text,
    calendly_event_id text,
    assigned_user_id text,
    assigned_membership_id uuid,
    participant_count integer DEFAULT 1,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_appointments_source_check CHECK ((source = ANY (ARRAY['manual'::text, 'public_link'::text, 'google'::text, 'calendly'::text]))),
    CONSTRAINT crm_appointments_status_check CHECK ((status = ANY (ARRAY['confirmed'::text, 'cancelled'::text, 'completed'::text, 'no_show'::text, 'rescheduled'::text])))
);

-- ============================================================
-- PRIMARY KEYS
-- ============================================================

ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.schools ADD CONSTRAINT schools_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.otp_codes ADD CONSTRAINT otp_codes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.password_reset_tokens ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.system_settings ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.lessons ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.lesson_schedules ADD CONSTRAINT lesson_schedules_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.students ADD CONSTRAINT students_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.super_teacher_assignments ADD CONSTRAINT super_teacher_assignments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_attendance ADD CONSTRAINT teacher_attendance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.term_settings ADD CONSTRAINT term_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.pd_courses ADD CONSTRAINT pd_courses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.pd_webinars ADD CONSTRAINT pd_webinars_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.pd_enrollments ADD CONSTRAINT pd_enrollments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.published_content ADD CONSTRAINT published_content_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.content_school_access ADD CONSTRAINT content_school_access_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_contacts ADD CONSTRAINT crm_contacts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_lists ADD CONSTRAINT crm_lists_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_contact_lists ADD CONSTRAINT crm_contact_lists_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_campaigns ADD CONSTRAINT crm_campaigns_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_events ADD CONSTRAINT crm_events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_flows ADD CONSTRAINT crm_flows_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_flow_steps ADD CONSTRAINT crm_flow_steps_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_flow_logs ADD CONSTRAINT crm_flow_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_calendly_connections ADD CONSTRAINT crm_calendly_connections_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_calendars ADD CONSTRAINT crm_calendars_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_calendar_members ADD CONSTRAINT crm_calendar_members_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_availability ADD CONSTRAINT crm_availability_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crm_appointments ADD CONSTRAINT crm_appointments_pkey PRIMARY KEY (id);

-- ============================================================
-- UNIQUE CONSTRAINTS
-- ============================================================

ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.schools ADD CONSTRAINT schools_code_key UNIQUE (code);
ALTER TABLE ONLY public.password_reset_tokens ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);
ALTER TABLE ONLY public.system_settings ADD CONSTRAINT system_settings_setting_key_key UNIQUE (setting_key);
ALTER TABLE ONLY public.lesson_schedules ADD CONSTRAINT lesson_schedules_lesson_id_key UNIQUE (lesson_id);
ALTER TABLE ONLY public.super_teacher_assignments ADD CONSTRAINT uq_super_teacher_subject_class UNIQUE (super_teacher_id, subject, class_level);
ALTER TABLE ONLY public.teacher_attendance ADD CONSTRAINT uq_teacher_attendance_teacher_date UNIQUE (teacher_id, date);
ALTER TABLE ONLY public.crm_contacts ADD CONSTRAINT crm_contacts_email_key UNIQUE (email);
ALTER TABLE ONLY public.crm_contact_lists ADD CONSTRAINT crm_contact_lists_contact_id_list_id_key UNIQUE (contact_id, list_id);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_phone ON public.users USING btree (phone);
CREATE INDEX idx_users_role ON public.users USING btree (role);
CREATE INDEX idx_users_school_id ON public.users USING btree (school_id);

CREATE INDEX idx_sessions_user_id ON public.sessions USING btree (user_id);
CREATE INDEX idx_sessions_user_id_revoked ON public.sessions USING btree (user_id, is_revoked);
CREATE INDEX idx_sessions_token_hash ON public.sessions USING btree (token_hash) WHERE (is_revoked = false);
CREATE INDEX idx_sessions_expires_at ON public.sessions USING btree (expires_at) WHERE (is_revoked = false);

CREATE INDEX idx_otp_codes_identifier ON public.otp_codes USING btree (identifier);
CREATE INDEX idx_otp_codes_expires ON public.otp_codes USING btree (expires_at);

CREATE INDEX idx_lessons_user ON public.lessons USING btree (user_id);
CREATE INDEX idx_lessons_subject ON public.lessons USING btree (subject);
CREATE INDEX idx_lessons_class ON public.lessons USING btree (class_level);

CREATE INDEX idx_lesson_schedules_lesson ON public.lesson_schedules USING btree (lesson_id);
CREATE INDEX idx_lesson_schedules_date ON public.lesson_schedules USING btree (scheduled_date);

CREATE INDEX idx_students_school_id ON public.students USING btree (school_id);
CREATE INDEX idx_students_teacher_id ON public.students USING btree (teacher_id);
CREATE INDEX idx_students_class_level ON public.students USING btree (class_level);
CREATE INDEX idx_students_class_id ON public.students USING btree (class_id);
CREATE INDEX idx_students_student_id ON public.students USING btree (student_id);
CREATE INDEX idx_students_last_name ON public.students USING btree (last_name);
CREATE INDEX idx_students_is_active ON public.students USING btree (is_active);

CREATE INDEX idx_sta_super_teacher_id ON public.super_teacher_assignments USING btree (super_teacher_id);
CREATE INDEX idx_sta_subject ON public.super_teacher_assignments USING btree (subject);
CREATE INDEX idx_sta_class_level ON public.super_teacher_assignments USING btree (class_level);
CREATE INDEX idx_sta_is_active ON public.super_teacher_assignments USING btree (is_active);
CREATE INDEX idx_sta_assigned_by ON public.super_teacher_assignments USING btree (assigned_by);

CREATE INDEX idx_teacher_attendance_teacher_id ON public.teacher_attendance USING btree (teacher_id);
CREATE INDEX idx_teacher_attendance_date ON public.teacher_attendance USING btree (date);
CREATE INDEX idx_teacher_attendance_teacher_date ON public.teacher_attendance USING btree (teacher_id, date);
CREATE INDEX idx_teacher_attendance_school_id ON public.teacher_attendance USING btree (school_id);
CREATE INDEX idx_teacher_attendance_status ON public.teacher_attendance USING btree (status);

CREATE INDEX idx_term_settings_year ON public.term_settings USING btree (academic_year);

CREATE UNIQUE INDEX crm_contacts_email_unique ON public.crm_contacts USING btree (email);
CREATE INDEX idx_crm_contacts_source ON public.crm_contacts USING btree (source);
CREATE INDEX idx_crm_contacts_subscribed ON public.crm_contacts USING btree (subscribed);
CREATE INDEX idx_crm_contacts_created_at ON public.crm_contacts USING btree (created_at);
CREATE INDEX idx_crm_contacts_tags ON public.crm_contacts USING gin (tags);

CREATE INDEX idx_crm_contact_lists_contact_id ON public.crm_contact_lists USING btree (contact_id);
CREATE INDEX idx_crm_contact_lists_list_id ON public.crm_contact_lists USING btree (list_id);

CREATE INDEX idx_crm_campaigns_status ON public.crm_campaigns USING btree (status);
CREATE INDEX idx_crm_campaigns_created_at ON public.crm_campaigns USING btree (created_at);

CREATE INDEX idx_crm_events_contact_id ON public.crm_events USING btree (contact_id);
CREATE INDEX idx_crm_events_campaign_id ON public.crm_events USING btree (campaign_id);
CREATE INDEX idx_crm_events_event_type ON public.crm_events USING btree (event_type);
CREATE INDEX idx_crm_events_created_at ON public.crm_events USING btree (created_at);

CREATE INDEX idx_crm_flows_trigger_type ON public.crm_flows USING btree (trigger_type);
CREATE INDEX idx_crm_flows_is_active ON public.crm_flows USING btree (is_active);

CREATE INDEX idx_crm_flow_steps_flow_id ON public.crm_flow_steps USING btree (flow_id);

CREATE INDEX idx_crm_flow_logs_flow_id ON public.crm_flow_logs USING btree (flow_id);
CREATE INDEX idx_crm_flow_logs_contact_id ON public.crm_flow_logs USING btree (contact_id);
CREATE INDEX idx_crm_flow_logs_created_at ON public.crm_flow_logs USING btree (created_at);

CREATE INDEX idx_crm_calendly_connections_user_id ON public.crm_calendly_connections USING btree (user_id);
CREATE UNIQUE INDEX crm_calendly_connections_user_uri_unique ON public.crm_calendly_connections USING btree (user_id, calendly_user_uri);

CREATE INDEX idx_crm_calendars_owner_user_id ON public.crm_calendars USING btree (owner_user_id);
CREATE INDEX idx_crm_calendars_is_active ON public.crm_calendars USING btree (is_active);
CREATE INDEX idx_crm_calendars_calendly_connection ON public.crm_calendars USING btree (calendly_connection_id) WHERE (calendly_connection_id IS NOT NULL);
CREATE UNIQUE INDEX crm_calendars_slug_unique ON public.crm_calendars USING btree (slug) WHERE (slug IS NOT NULL);

CREATE UNIQUE INDEX crm_calendar_members_calendar_user_unique ON public.crm_calendar_members USING btree (calendar_id, user_id);
CREATE INDEX idx_crm_calendar_members_calendar_id ON public.crm_calendar_members USING btree (calendar_id);
CREATE INDEX idx_crm_calendar_members_user_id ON public.crm_calendar_members USING btree (user_id);

CREATE INDEX idx_crm_availability_calendar_id ON public.crm_availability USING btree (calendar_id);

CREATE INDEX idx_crm_appointments_calendar_id ON public.crm_appointments USING btree (calendar_id);
CREATE INDEX idx_crm_appointments_contact_id ON public.crm_appointments USING btree (contact_id);
CREATE INDEX idx_crm_appointments_starts_at ON public.crm_appointments USING btree (starts_at);
CREATE INDEX idx_crm_appointments_status ON public.crm_appointments USING btree (status);
CREATE INDEX idx_crm_appointments_assigned_user_id ON public.crm_appointments USING btree (assigned_user_id);

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

ALTER TABLE ONLY public.content_school_access
    ADD CONSTRAINT content_school_access_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.published_content(id);
ALTER TABLE ONLY public.content_school_access
    ADD CONSTRAINT content_school_access_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);

ALTER TABLE ONLY public.crm_appointments
    ADD CONSTRAINT crm_appointments_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES public.crm_calendars(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.crm_appointments
    ADD CONSTRAINT crm_appointments_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.crm_contacts(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.crm_availability
    ADD CONSTRAINT crm_availability_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES public.crm_calendars(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.crm_calendar_members
    ADD CONSTRAINT crm_calendar_members_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES public.crm_calendars(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.crm_calendars
    ADD CONSTRAINT crm_calendars_calendly_connection_id_fkey FOREIGN KEY (calendly_connection_id) REFERENCES public.crm_calendly_connections(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.crm_campaigns
    ADD CONSTRAINT crm_campaigns_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.crm_lists(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.crm_contact_lists
    ADD CONSTRAINT crm_contact_lists_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.crm_contacts(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.crm_contact_lists
    ADD CONSTRAINT crm_contact_lists_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.crm_lists(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.crm_events
    ADD CONSTRAINT crm_events_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.crm_campaigns(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.crm_events
    ADD CONSTRAINT crm_events_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.crm_contacts(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.crm_flow_logs
    ADD CONSTRAINT crm_flow_logs_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.crm_contacts(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.crm_flow_logs
    ADD CONSTRAINT crm_flow_logs_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES public.crm_flows(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.crm_flow_logs
    ADD CONSTRAINT crm_flow_logs_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.crm_flow_steps(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.crm_flow_steps
    ADD CONSTRAINT crm_flow_steps_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES public.crm_flows(id) ON DELETE CASCADE;

-- ============================================================
-- ROW LEVEL SECURITY — ENABLE
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.term_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pd_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pd_webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pd_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_school_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_flow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_calendly_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_calendar_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_appointments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ROW LEVEL SECURITY — POLICIES
-- Note: This app uses custom OTP-based auth (not Supabase Auth).
-- The anon key is used for all requests; security is enforced
-- at the application level via the sessions table.
-- All policies below mirror the original Famous AI configuration.
-- ============================================================

-- users
CREATE POLICY "Allow read access for all" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow insert for all" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for all" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow delete for all" ON public.users FOR DELETE USING (true);

-- system_settings
CREATE POLICY "Allow read access to system_settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow insert to system_settings" ON public.system_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update to system_settings" ON public.system_settings FOR UPDATE USING (true);

-- otp_codes
CREATE POLICY "Allow all operations on otp_codes" ON public.otp_codes USING (true) WITH CHECK (true);

-- password_reset_tokens
CREATE POLICY "Allow all operations on password_reset_tokens" ON public.password_reset_tokens USING (true) WITH CHECK (true);

-- sessions (managed exclusively by edge functions via service role)
CREATE POLICY "Service role manages sessions" ON public.sessions USING (true) WITH CHECK (true);

-- schools
CREATE POLICY "Allow public read access to schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Allow public insert to schools" ON public.schools FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to schools" ON public.schools FOR UPDATE USING (true);

-- lessons (no explicit policies in dump — add permissive defaults)
CREATE POLICY "Allow all on lessons" ON public.lessons USING (true) WITH CHECK (true);

-- lesson_schedules
CREATE POLICY "Allow public read access to lesson_schedules" ON public.lesson_schedules FOR SELECT USING (true);
CREATE POLICY "Allow public insert to lesson_schedules" ON public.lesson_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to lesson_schedules" ON public.lesson_schedules FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on lesson_schedules" ON public.lesson_schedules FOR DELETE USING (true);

-- students
CREATE POLICY "Allow all select on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow all insert on students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on students" ON public.students FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete on students" ON public.students FOR DELETE USING (true);

-- super_teacher_assignments
CREATE POLICY "Allow all select on super_teacher_assignments" ON public.super_teacher_assignments FOR SELECT USING (true);
CREATE POLICY "Allow all insert on super_teacher_assignments" ON public.super_teacher_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on super_teacher_assignments" ON public.super_teacher_assignments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete on super_teacher_assignments" ON public.super_teacher_assignments FOR DELETE USING (true);

-- teacher_attendance
CREATE POLICY "Allow all select on teacher_attendance" ON public.teacher_attendance FOR SELECT USING (true);
CREATE POLICY "Allow all insert on teacher_attendance" ON public.teacher_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on teacher_attendance" ON public.teacher_attendance FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete on teacher_attendance" ON public.teacher_attendance FOR DELETE USING (true);

-- term_settings
CREATE POLICY "Allow public read access to term_settings" ON public.term_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert to term_settings" ON public.term_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to term_settings" ON public.term_settings FOR UPDATE USING (true);

-- pd_courses / pd_webinars / pd_enrollments (no policies in dump — permissive defaults)
CREATE POLICY "Allow all on pd_courses" ON public.pd_courses USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on pd_webinars" ON public.pd_webinars USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on pd_enrollments" ON public.pd_enrollments USING (true) WITH CHECK (true);

-- published_content
CREATE POLICY "Allow public read access to published_content" ON public.published_content FOR SELECT USING (true);
CREATE POLICY "Allow public insert to published_content" ON public.published_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to published_content" ON public.published_content FOR UPDATE USING (true);

-- content_school_access
CREATE POLICY "Allow public read access to content_school_access" ON public.content_school_access FOR SELECT USING (true);
CREATE POLICY "Allow public insert to content_school_access" ON public.content_school_access FOR INSERT WITH CHECK (true);

-- CRM tables — all permissive
CREATE POLICY "CRM contacts readable" ON public.crm_contacts FOR SELECT USING (true);
CREATE POLICY "CRM contacts insertable" ON public.crm_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM contacts updatable" ON public.crm_contacts FOR UPDATE USING (true);
CREATE POLICY "CRM contacts deletable" ON public.crm_contacts FOR DELETE USING (true);

CREATE POLICY "CRM lists readable" ON public.crm_lists FOR SELECT USING (true);
CREATE POLICY "CRM lists insertable" ON public.crm_lists FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM lists updatable" ON public.crm_lists FOR UPDATE USING (true);
CREATE POLICY "CRM lists deletable" ON public.crm_lists FOR DELETE USING (true);

CREATE POLICY "CRM contact lists readable" ON public.crm_contact_lists FOR SELECT USING (true);
CREATE POLICY "CRM contact lists insertable" ON public.crm_contact_lists FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM contact lists deletable" ON public.crm_contact_lists FOR DELETE USING (true);

CREATE POLICY "CRM campaigns readable" ON public.crm_campaigns FOR SELECT USING (true);
CREATE POLICY "CRM campaigns insertable" ON public.crm_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM campaigns updatable" ON public.crm_campaigns FOR UPDATE USING (true);
CREATE POLICY "CRM campaigns deletable" ON public.crm_campaigns FOR DELETE USING (true);

CREATE POLICY "CRM events readable" ON public.crm_events FOR SELECT USING (true);
CREATE POLICY "CRM events insertable" ON public.crm_events FOR INSERT WITH CHECK (true);

CREATE POLICY "CRM flows readable" ON public.crm_flows FOR SELECT USING (true);
CREATE POLICY "CRM flows insertable" ON public.crm_flows FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM flows updatable" ON public.crm_flows FOR UPDATE USING (true);
CREATE POLICY "CRM flows deletable" ON public.crm_flows FOR DELETE USING (true);

CREATE POLICY "CRM flow steps readable" ON public.crm_flow_steps FOR SELECT USING (true);
CREATE POLICY "CRM flow steps insertable" ON public.crm_flow_steps FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM flow steps updatable" ON public.crm_flow_steps FOR UPDATE USING (true);
CREATE POLICY "CRM flow steps deletable" ON public.crm_flow_steps FOR DELETE USING (true);

CREATE POLICY "CRM flow logs readable" ON public.crm_flow_logs FOR SELECT USING (true);
CREATE POLICY "CRM flow logs insertable" ON public.crm_flow_logs FOR INSERT WITH CHECK (true);

-- crm_calendly_connections — blocked from anon access (service role only, same as original)
CREATE POLICY "Calendly connections service only" ON public.crm_calendly_connections USING (false) WITH CHECK (false);

CREATE POLICY "CRM calendars readable" ON public.crm_calendars FOR SELECT USING (true);
CREATE POLICY "CRM calendars insertable" ON public.crm_calendars FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM calendars updatable" ON public.crm_calendars FOR UPDATE USING (true);
CREATE POLICY "CRM calendars deletable" ON public.crm_calendars FOR DELETE USING (true);

CREATE POLICY "CRM calendar members readable" ON public.crm_calendar_members FOR SELECT USING (true);
CREATE POLICY "CRM calendar members insertable" ON public.crm_calendar_members FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM calendar members updatable" ON public.crm_calendar_members FOR UPDATE USING (true);
CREATE POLICY "CRM calendar members deletable" ON public.crm_calendar_members FOR DELETE USING (true);

CREATE POLICY "CRM availability readable" ON public.crm_availability FOR SELECT USING (true);
CREATE POLICY "CRM availability insertable" ON public.crm_availability FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM availability updatable" ON public.crm_availability FOR UPDATE USING (true);
CREATE POLICY "CRM availability deletable" ON public.crm_availability FOR DELETE USING (true);

CREATE POLICY "CRM appointments readable" ON public.crm_appointments FOR SELECT USING (true);
CREATE POLICY "CRM appointments insertable" ON public.crm_appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM appointments updatable" ON public.crm_appointments FOR UPDATE USING (true);
CREATE POLICY "CRM appointments deletable" ON public.crm_appointments FOR DELETE USING (true);
