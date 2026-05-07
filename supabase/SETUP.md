# Supabase Setup Guide

## Step 1 — Create a Supabase project

1. Go to https://supabase.com → New project
2. Choose a name, region, and password
3. Wait for it to provision (~2 minutes)
4. Copy your **Project URL** and **anon key** from Settings → API

## Step 2 — Run the migrations

### Option A: Supabase SQL Editor (easiest — no CLI needed)

1. Open your project → SQL Editor
2. Paste and run `migrations/20260506000001_initial_schema.sql`
3. Paste and run `migrations/20260506000002_seed_data.sql`

### Option B: Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link to your project (get project-ref from your Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

## Step 3 — Update the app config

In `src/lib/supabase.ts`, replace:
- `supabaseUrl` → your new Supabase project URL
- `supabaseKey` → your new anon key

In `src/lib/edge-functions.ts`, replace:
- `EDGE_FUNCTION_BASE_URL` → your new Supabase project's functions URL
- `EDGE_FUNCTION_ANON_KEY` → your new anon key

## Step 4 — Set the JWT secret

The edge functions need a shared JWT secret. Run this once via the Supabase CLI:

```bash
supabase secrets set JWT_SECRET=your-strong-secret-here
```

Or set it in your Supabase dashboard → Settings → Edge Functions → Secrets.
Use a long random string (32+ characters). Keep it safe — it signs all session tokens.

## Step 5 — Deploy edge functions

```bash
supabase functions deploy send-otp
supabase functions deploy verify-otp
supabase functions deploy create-user
supabase functions deploy reset-password
supabase functions deploy validate-session
supabase functions deploy logout-session
```

Or deploy all at once:
```bash
supabase functions deploy
```

Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically by Supabase.
You only need to set JWT_SECRET manually (Step 4).

## Step 6 — Update the app connection config

Once your Supabase project is live, update these two files with your new credentials:
- `src/lib/supabase.ts` — database URL and anon key
- `src/lib/edge-functions.ts` — edge function base URL and anon key

---

## What's in the migration

### Tables migrated from the Famous AI export (30 tables):
- `users`, `schools`, `sessions`, `otp_codes`, `password_reset_tokens`, `system_settings`
- `lessons`, `lesson_schedules`
- `students`, `super_teacher_assignments`, `teacher_attendance`, `term_settings`
- `pd_courses`, `pd_webinars`, `pd_enrollments`
- `published_content`, `content_school_access`
- `crm_contacts`, `crm_lists`, `crm_contact_lists`, `crm_campaigns`, `crm_events`
- `crm_flows`, `crm_flow_steps`, `crm_flow_logs`
- `crm_calendly_connections`, `crm_calendars`, `crm_calendar_members`, `crm_availability`, `crm_appointments`

## What's NOT yet in the migration (Phase 2)

These tables are referenced in the app code but were NOT in the Famous AI export.
They need to be created separately once the edge functions are reviewed:

| Table | App module |
|---|---|
| `teacher_punch_clock` | supabase-punch-clock.ts |
| `late_arrival_notifications` | supabase-punch-clock.ts |
| `attendance` | supabase-attendance.ts / supabase-scores.ts |
| `student_bills` | supabase-billing.ts |
| `student_discounts` | supabase-billing.ts |
| `discount_types` | supabase-billing.ts |
| `student_scores` | supabase-scores.ts |
| `report_cards` | supabase-scores.ts |
| `questions` | supabase-questions.ts |
| `question_options` | supabase-questions.ts |
| `test_papers` | supabase-questions.ts |
| `test_paper_questions` | supabase-questions.ts |
| `teacher_assignments` | supabase-teacher-assignments.ts |
| `profiles` | supabase-teacher-assignments.ts |
| `school_branding` | supabase-branding.ts |
| `omr_scan_results` | supabase-omr.ts |
| `lesson_planning_sessions` | supabase-planning.ts |
| `student_transfers` | supabase-transfers.ts |
| + others | supabase-leave.ts, supabase-notifications.ts, supabase-skills.ts, etc. |

These will be derived by reading the app's lib files and creating a Phase 2 migration.
