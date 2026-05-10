-- ============================================================
-- Catalyst Education Platform — Assessment, Transfers & KB
-- Migration 003
-- ============================================================

-- ============================================================
-- ASSESSMENT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_by uuid,
    question_text text NOT NULL,
    question_type text NOT NULL,
    difficulty text NOT NULL DEFAULT 'medium',
    marks integer NOT NULL DEFAULT 1,
    curriculum_type text NOT NULL DEFAULT 'NaCCA',
    subject text NOT NULL,
    grade_level text NOT NULL,
    strand text,
    sub_strand text,
    indicator_code text,
    indicator_text text,
    explanation text,
    image_url text,
    is_approved boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT questions_type_check CHECK (question_type = ANY (ARRAY[
        'multiple_choice', 'true_false', 'short_answer', 'fill_blank', 'matching', 'essay'
    ])),
    CONSTRAINT questions_difficulty_check CHECK (difficulty = ANY (ARRAY['easy', 'medium', 'hard']))
);

CREATE TABLE IF NOT EXISTS public.question_options (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text text NOT NULL,
    is_correct boolean DEFAULT false,
    match_pair text,
    option_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.test_papers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_by uuid,
    title text NOT NULL,
    description text,
    subject text NOT NULL,
    grade_level text NOT NULL,
    curriculum_type text NOT NULL DEFAULT 'NaCCA',
    duration_minutes integer NOT NULL DEFAULT 60,
    total_marks integer NOT NULL DEFAULT 0,
    school_name text,
    school_logo_url text,
    school_address text,
    school_motto text,
    term text,
    academic_year text,
    instructions text,
    is_published boolean DEFAULT false,
    publish_mode text DEFAULT 'selected',
    school_ids text[],
    created_at timestamptz DEFAULT now(),
    CONSTRAINT test_papers_publish_mode_check CHECK (publish_mode = ANY (ARRAY['all', 'selected']))
);

CREATE TABLE IF NOT EXISTS public.test_paper_questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    test_paper_id uuid NOT NULL REFERENCES public.test_papers(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_order integer NOT NULL DEFAULT 0,
    marks_override integer
);

-- ============================================================
-- STUDENT TRANSFERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.student_transfers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL,
    from_school_id uuid NOT NULL,
    to_school_id uuid NOT NULL,
    requested_by uuid NOT NULL,
    student_name text NOT NULL,
    student_class text NOT NULL DEFAULT '',
    reason text,
    status text NOT NULL DEFAULT 'pending',
    reviewed_by uuid,
    review_notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT student_transfers_status_check CHECK (status = ANY (ARRAY['pending', 'approved', 'rejected']))
);

-- ============================================================
-- KNOWLEDGE BASE TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.knowledge_base_documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    subject text,
    grade_level text,
    file_name text,
    uploaded_by uuid,
    created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions (subject);
CREATE INDEX IF NOT EXISTS idx_questions_grade_level ON public.questions (grade_level);
CREATE INDEX IF NOT EXISTS idx_questions_curriculum_type ON public.questions (curriculum_type);
CREATE INDEX IF NOT EXISTS idx_questions_indicator_code ON public.questions (indicator_code);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON public.questions (created_by);
CREATE INDEX IF NOT EXISTS idx_questions_is_approved ON public.questions (is_approved);

CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON public.question_options (question_id);

CREATE INDEX IF NOT EXISTS idx_test_papers_subject ON public.test_papers (subject);
CREATE INDEX IF NOT EXISTS idx_test_papers_grade_level ON public.test_papers (grade_level);
CREATE INDEX IF NOT EXISTS idx_test_papers_created_by ON public.test_papers (created_by);
CREATE INDEX IF NOT EXISTS idx_test_papers_is_published ON public.test_papers (is_published);

CREATE INDEX IF NOT EXISTS idx_test_paper_questions_paper ON public.test_paper_questions (test_paper_id);
CREATE INDEX IF NOT EXISTS idx_test_paper_questions_question ON public.test_paper_questions (question_id);

CREATE INDEX IF NOT EXISTS idx_transfers_student_id ON public.student_transfers (student_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_school ON public.student_transfers (from_school_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_school ON public.student_transfers (to_school_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON public.student_transfers (status);
CREATE INDEX IF NOT EXISTS idx_transfers_created_at ON public.student_transfers (created_at);

CREATE INDEX IF NOT EXISTS idx_kb_docs_subject ON public.knowledge_base_documents (subject);
CREATE INDEX IF NOT EXISTS idx_kb_docs_grade_level ON public.knowledge_base_documents (grade_level);
CREATE INDEX IF NOT EXISTS idx_kb_docs_created_at ON public.knowledge_base_documents (created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- Note: App uses custom OTP auth — all policies are permissive.
-- Security enforced at application layer via sessions table.
-- ============================================================

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_paper_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_documents ENABLE ROW LEVEL SECURITY;

-- questions
DROP POLICY IF EXISTS "Questions readable" ON public.questions;
DROP POLICY IF EXISTS "Questions insertable" ON public.questions;
DROP POLICY IF EXISTS "Questions updatable" ON public.questions;
DROP POLICY IF EXISTS "Questions deletable" ON public.questions;
CREATE POLICY "Questions readable" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Questions insertable" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Questions updatable" ON public.questions FOR UPDATE USING (true);
CREATE POLICY "Questions deletable" ON public.questions FOR DELETE USING (true);

-- question_options
DROP POLICY IF EXISTS "Question options readable" ON public.question_options;
DROP POLICY IF EXISTS "Question options insertable" ON public.question_options;
DROP POLICY IF EXISTS "Question options updatable" ON public.question_options;
DROP POLICY IF EXISTS "Question options deletable" ON public.question_options;
CREATE POLICY "Question options readable" ON public.question_options FOR SELECT USING (true);
CREATE POLICY "Question options insertable" ON public.question_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Question options updatable" ON public.question_options FOR UPDATE USING (true);
CREATE POLICY "Question options deletable" ON public.question_options FOR DELETE USING (true);

-- test_papers
DROP POLICY IF EXISTS "Test papers readable" ON public.test_papers;
DROP POLICY IF EXISTS "Test papers insertable" ON public.test_papers;
DROP POLICY IF EXISTS "Test papers updatable" ON public.test_papers;
DROP POLICY IF EXISTS "Test papers deletable" ON public.test_papers;
CREATE POLICY "Test papers readable" ON public.test_papers FOR SELECT USING (true);
CREATE POLICY "Test papers insertable" ON public.test_papers FOR INSERT WITH CHECK (true);
CREATE POLICY "Test papers updatable" ON public.test_papers FOR UPDATE USING (true);
CREATE POLICY "Test papers deletable" ON public.test_papers FOR DELETE USING (true);

-- test_paper_questions
DROP POLICY IF EXISTS "Test paper questions readable" ON public.test_paper_questions;
DROP POLICY IF EXISTS "Test paper questions insertable" ON public.test_paper_questions;
DROP POLICY IF EXISTS "Test paper questions deletable" ON public.test_paper_questions;
CREATE POLICY "Test paper questions readable" ON public.test_paper_questions FOR SELECT USING (true);
CREATE POLICY "Test paper questions insertable" ON public.test_paper_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Test paper questions deletable" ON public.test_paper_questions FOR DELETE USING (true);

-- student_transfers
DROP POLICY IF EXISTS "Transfers readable" ON public.student_transfers;
DROP POLICY IF EXISTS "Transfers insertable" ON public.student_transfers;
DROP POLICY IF EXISTS "Transfers updatable" ON public.student_transfers;
CREATE POLICY "Transfers readable" ON public.student_transfers FOR SELECT USING (true);
CREATE POLICY "Transfers insertable" ON public.student_transfers FOR INSERT WITH CHECK (true);
CREATE POLICY "Transfers updatable" ON public.student_transfers FOR UPDATE USING (true);

-- knowledge_base_documents
DROP POLICY IF EXISTS "KB docs readable" ON public.knowledge_base_documents;
DROP POLICY IF EXISTS "KB docs insertable" ON public.knowledge_base_documents;
DROP POLICY IF EXISTS "KB docs deletable" ON public.knowledge_base_documents;
CREATE POLICY "KB docs readable" ON public.knowledge_base_documents FOR SELECT USING (true);
CREATE POLICY "KB docs insertable" ON public.knowledge_base_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "KB docs deletable" ON public.knowledge_base_documents FOR DELETE USING (true);
