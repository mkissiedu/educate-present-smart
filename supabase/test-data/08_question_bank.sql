-- ============================================================
-- 08 — Question Bank: Questions, Options & Test Papers
-- 20 questions (Math 8, English 7, Science 5)
-- 2 test papers with questions assembled
-- Created by Super Admin (platform-wide access)
-- ============================================================

-- ── Questions ────────────────────────────────────────────────
INSERT INTO public.questions (
  id, created_by, question_text, question_type, difficulty,
  marks, curriculum_type, subject, grade_level,
  strand, sub_strand, explanation, is_approved
) VALUES

  -- MATHEMATICS — Primary 4 & 5
  ('q0000000-0000-0000-0000-000000000001',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'What is 24 × 5?',
   'multiple_choice','medium',2,'NaCCA','Mathematics','Primary 4',
   'Number','Multiplication','24 × 5 = 120. Count by 5s: 5,10,15,...,120.',true),

  ('q0000000-0000-0000-0000-000000000002',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'What is the perimeter of a square with a side length of 6 cm?',
   'multiple_choice','medium',2,'NaCCA','Mathematics','Primary 4',
   'Geometry','Perimeter','Perimeter of square = 4 × side = 4 × 6 = 24 cm.',true),

  ('q0000000-0000-0000-0000-000000000003',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'The product of any number and zero is always zero.',
   'true_false','easy',1,'NaCCA','Mathematics','Primary 4',
   'Number','Properties of Operations','Any number × 0 = 0. This is the zero property of multiplication.',true),

  ('q0000000-0000-0000-0000-000000000004',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'Which fraction is larger: 3/4 or 2/3?',
   'multiple_choice','medium',2,'NaCCA','Mathematics','Primary 5',
   'Number','Fractions','Convert to same denominator: 3/4=9/12, 2/3=8/12. So 3/4 is larger.',true),

  ('q0000000-0000-0000-0000-000000000005',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'What is 156 ÷ 12?',
   'multiple_choice','medium',2,'NaCCA','Mathematics','Primary 5',
   'Number','Division','156 ÷ 12 = 13. Check: 12 × 13 = 156.',true),

  ('q0000000-0000-0000-0000-000000000006',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'The sum of angles in any triangle is 180°.',
   'true_false','easy',1,'NaCCA','Mathematics','Primary 5',
   'Geometry','Angles','All three interior angles of a triangle always add up to 180°.',true),

  ('q0000000-0000-0000-0000-000000000007',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'What is the area of a rectangle that is 8 cm long and 5 cm wide?',
   'multiple_choice','easy',2,'NaCCA','Mathematics','JHS 1',
   'Geometry','Area','Area = length × width = 8 × 5 = 40 cm².',true),

  ('q0000000-0000-0000-0000-000000000008',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'What is 15% of 200?',
   'multiple_choice','medium',2,'NaCCA','Mathematics','JHS 1',
   'Number','Percentages','15% of 200 = (15/100) × 200 = 30.',true),

  -- ENGLISH LANGUAGE — Primary 3 & JHS 1
  ('q0000000-0000-0000-0000-000000000009',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'Which of the following words is a noun?',
   'multiple_choice','easy',1,'NaCCA','English Language','Primary 3',
   'Grammar','Parts of Speech','A noun is a naming word — it names a person, place, or thing. "Teacher" is a noun.',true),

  ('q0000000-0000-0000-0000-000000000010',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'Which word is a synonym for "happy"?',
   'multiple_choice','easy',1,'NaCCA','English Language','Primary 3',
   'Vocabulary','Synonyms','Synonyms are words with similar meanings. "Joyful" means the same as "happy".',true),

  ('q0000000-0000-0000-0000-000000000011',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'An adjective is a word that describes a noun.',
   'true_false','easy',1,'NaCCA','English Language','Primary 3',
   'Grammar','Parts of Speech','Correct — adjectives modify or describe nouns. E.g. "tall teacher".',true),

  ('q0000000-0000-0000-0000-000000000012',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'Choose the correct verb tense: "Yesterday, she ___ to school."',
   'multiple_choice','medium',2,'NaCCA','English Language','JHS 1',
   'Grammar','Verb Tenses','"Yesterday" signals past tense. The simple past of "go" is "went".',true),

  ('q0000000-0000-0000-0000-000000000013',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'Which sentence uses correct punctuation?',
   'multiple_choice','medium',2,'NaCCA','English Language','JHS 1',
   'Writing','Punctuation','A question must begin with a capital letter and end with a question mark.',true),

  ('q0000000-0000-0000-0000-000000000014',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'Every complete sentence must have a subject and a predicate.',
   'true_false','easy',1,'NaCCA','English Language','JHS 1',
   'Grammar','Sentence Structure','True — the subject tells WHO or WHAT; the predicate tells what the subject does or is.',true),

  ('q0000000-0000-0000-0000-000000000015',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'What is the plural of "child"?',
   'multiple_choice','easy',1,'NaCCA','English Language','JHS 1',
   'Grammar','Plurals','"Child" is an irregular noun. Its plural is "children", not "childs".',true),

  -- SCIENCE — Primary 4 & 5
  ('q0000000-0000-0000-0000-000000000016',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'Which gas do plants absorb from the air during photosynthesis?',
   'multiple_choice','medium',2,'NaCCA','Science','Primary 4',
   'Life Science','Photosynthesis','Plants absorb carbon dioxide (CO₂) and release oxygen during photosynthesis.',true),

  ('q0000000-0000-0000-0000-000000000017',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'Which of the following animals is a mammal?',
   'multiple_choice','easy',1,'NaCCA','Science','Primary 4',
   'Life Science','Classification','Mammals are warm-blooded, breathe air, and feed young with milk. Bats are mammals.',true),

  ('q0000000-0000-0000-0000-000000000018',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'The sun is a planet.',
   'true_false','easy',1,'NaCCA','Science','Primary 4',
   'Earth Science','Solar System','False — the sun is a STAR, not a planet. It is the centre of our solar system.',true),

  ('q0000000-0000-0000-0000-000000000019',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'Which organ in the human body pumps blood through the circulatory system?',
   'multiple_choice','easy',1,'NaCCA','Science','Primary 5',
   'Life Science','Human Body','The heart is a muscular organ that pumps blood throughout the body.',true),

  ('q0000000-0000-0000-0000-000000000020',
   'c7730aab-5b4e-4ad8-8c85-1081b2abb054',
   'At what temperature does water boil at sea level?',
   'multiple_choice','easy',1,'NaCCA','Science','Primary 5',
   'Physical Science','States of Matter','Water boils at 100°C (212°F) at standard atmospheric pressure (sea level).',true)

ON CONFLICT (id) DO NOTHING;

-- ── Question Options ──────────────────────────────────────────
INSERT INTO public.question_options
  (question_id, option_text, is_correct, option_order)
VALUES
  -- q01: 24 × 5
  ('q0000000-0000-0000-0000-000000000001','120',true, 0),
  ('q0000000-0000-0000-0000-000000000001','96', false,1),
  ('q0000000-0000-0000-0000-000000000001','110',false,2),
  ('q0000000-0000-0000-0000-000000000001','108',false,3),

  -- q02: perimeter of square 6 cm
  ('q0000000-0000-0000-0000-000000000002','24 cm',true, 0),
  ('q0000000-0000-0000-0000-000000000002','12 cm',false,1),
  ('q0000000-0000-0000-0000-000000000002','36 cm',false,2),
  ('q0000000-0000-0000-0000-000000000002','18 cm',false,3),

  -- q03: true/false — product and zero
  ('q0000000-0000-0000-0000-000000000003','True', true, 0),
  ('q0000000-0000-0000-0000-000000000003','False',false,1),

  -- q04: 3/4 vs 2/3
  ('q0000000-0000-0000-0000-000000000004','3/4',              true, 0),
  ('q0000000-0000-0000-0000-000000000004','2/3',              false,1),
  ('q0000000-0000-0000-0000-000000000004','They are equal',   false,2),
  ('q0000000-0000-0000-0000-000000000004','Cannot be compared',false,3),

  -- q05: 156 ÷ 12
  ('q0000000-0000-0000-0000-000000000005','13',false, 0),
  ('q0000000-0000-0000-0000-000000000005','12',false,1),
  ('q0000000-0000-0000-0000-000000000005','14',false,2),
  ('q0000000-0000-0000-0000-000000000005','13',true, 3),

  -- q06: true/false — angles in triangle
  ('q0000000-0000-0000-0000-000000000006','True', true, 0),
  ('q0000000-0000-0000-0000-000000000006','False',false,1),

  -- q07: area rectangle 8×5
  ('q0000000-0000-0000-0000-000000000007','40 cm²',true, 0),
  ('q0000000-0000-0000-0000-000000000007','26 cm²',false,1),
  ('q0000000-0000-0000-0000-000000000007','13 cm²',false,2),
  ('q0000000-0000-0000-0000-000000000007','80 cm²',false,3),

  -- q08: 15% of 200
  ('q0000000-0000-0000-0000-000000000008','30',true, 0),
  ('q0000000-0000-0000-0000-000000000008','25',false,1),
  ('q0000000-0000-0000-0000-000000000008','35',false,2),
  ('q0000000-0000-0000-0000-000000000008','20',false,3),

  -- q09: noun
  ('q0000000-0000-0000-0000-000000000009','run',      false,0),
  ('q0000000-0000-0000-0000-000000000009','beautiful',false,1),
  ('q0000000-0000-0000-0000-000000000009','teacher',  true, 2),
  ('q0000000-0000-0000-0000-000000000009','quickly',  false,3),

  -- q10: synonym for happy
  ('q0000000-0000-0000-0000-000000000010','sad',    false,0),
  ('q0000000-0000-0000-0000-000000000010','joyful', true, 1),
  ('q0000000-0000-0000-0000-000000000010','angry',  false,2),
  ('q0000000-0000-0000-0000-000000000010','tired',  false,3),

  -- q11: true/false — adjective
  ('q0000000-0000-0000-0000-000000000011','True', true, 0),
  ('q0000000-0000-0000-0000-000000000011','False',false,1),

  -- q12: verb tense
  ('q0000000-0000-0000-0000-000000000012','go',   false,0),
  ('q0000000-0000-0000-0000-000000000012','went', true, 1),
  ('q0000000-0000-0000-0000-000000000012','goes', false,2),
  ('q0000000-0000-0000-0000-000000000012','going',false,3),

  -- q13: punctuation
  ('q0000000-0000-0000-0000-000000000013','where are you going.',  false,0),
  ('q0000000-0000-0000-0000-000000000013','Where are you going?',  true, 1),
  ('q0000000-0000-0000-0000-000000000013','where are you going?',  false,2),
  ('q0000000-0000-0000-0000-000000000013','Where are you going.',  false,3),

  -- q14: true/false — sentence structure
  ('q0000000-0000-0000-0000-000000000014','True', true, 0),
  ('q0000000-0000-0000-0000-000000000014','False',false,1),

  -- q15: plural of child
  ('q0000000-0000-0000-0000-000000000015','childs',   false,0),
  ('q0000000-0000-0000-0000-000000000015','childes',  false,1),
  ('q0000000-0000-0000-0000-000000000015','children', true, 2),
  ('q0000000-0000-0000-0000-000000000015','childrens',false,3),

  -- q16: photosynthesis gas
  ('q0000000-0000-0000-0000-000000000016','Oxygen',         false,0),
  ('q0000000-0000-0000-0000-000000000016','Carbon dioxide', true, 1),
  ('q0000000-0000-0000-0000-000000000016','Nitrogen',       false,2),
  ('q0000000-0000-0000-0000-000000000016','Hydrogen',       false,3),

  -- q17: mammal
  ('q0000000-0000-0000-0000-000000000017','Snake',false,0),
  ('q0000000-0000-0000-0000-000000000017','Frog', false,1),
  ('q0000000-0000-0000-0000-000000000017','Bat',  true, 2),
  ('q0000000-0000-0000-0000-000000000017','Eagle',false,3),

  -- q18: true/false — sun is a planet
  ('q0000000-0000-0000-0000-000000000018','True', false,0),
  ('q0000000-0000-0000-0000-000000000018','False',true, 1),

  -- q19: organ that pumps blood
  ('q0000000-0000-0000-0000-000000000019','Liver', false,0),
  ('q0000000-0000-0000-0000-000000000019','Lungs', false,1),
  ('q0000000-0000-0000-0000-000000000019','Kidney',false,2),
  ('q0000000-0000-0000-0000-000000000019','Heart', true, 3),

  -- q20: boiling point of water
  ('q0000000-0000-0000-0000-000000000020','90°C', false,0),
  ('q0000000-0000-0000-0000-000000000020','100°C',true, 1),
  ('q0000000-0000-0000-0000-000000000020','110°C',false,2),
  ('q0000000-0000-0000-0000-000000000020','80°C', false,3);

-- ── Test Papers ───────────────────────────────────────────────
INSERT INTO public.test_papers (
  id, created_by, title, description,
  subject, grade_level, curriculum_type,
  duration_minutes, total_marks,
  school_name, term, academic_year, instructions,
  is_published, publish_mode
) VALUES

  ('p0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000006',
   'Primary 5 Mathematics Mid-Term Test',
   'Covers fractions, division, percentages, geometry, and properties of operations.',
   'Mathematics','Primary 5','NaCCA',
   40, 10,
   'Ananse Academy','Third Term','2025/2026',
   'Answer ALL questions. Show your working where required. Each question carries the marks indicated.',
   true,'selected'),

  ('p0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000007',
   'JHS 1 English Language End of Term Exam',
   'Covers grammar (parts of speech, tenses, sentence structure), vocabulary, and punctuation.',
   'English Language','JHS 1','NaCCA',
   60, 8,
   'Ananse Academy','Third Term','2025/2026',
   'Answer ALL questions. Choose the BEST answer for each multiple choice question.',
   true,'selected')

ON CONFLICT (id) DO NOTHING;

-- ── Link Questions to Test Papers ─────────────────────────────
INSERT INTO public.test_paper_questions
  (test_paper_id, question_id, question_order, marks_override)
VALUES
  -- Paper 1: Primary 5 Mathematics (q04–q08)
  ('p0000000-0000-0000-0000-000000000001','q0000000-0000-0000-0000-000000000004',1,NULL),
  ('p0000000-0000-0000-0000-000000000001','q0000000-0000-0000-0000-000000000005',2,NULL),
  ('p0000000-0000-0000-0000-000000000001','q0000000-0000-0000-0000-000000000006',3,NULL),
  ('p0000000-0000-0000-0000-000000000001','q0000000-0000-0000-0000-000000000007',4,NULL),
  ('p0000000-0000-0000-0000-000000000001','q0000000-0000-0000-0000-000000000008',5,NULL),

  -- Paper 2: JHS 1 English Language (q12–q15 + q09)
  ('p0000000-0000-0000-0000-000000000002','q0000000-0000-0000-0000-000000000009',1,NULL),
  ('p0000000-0000-0000-0000-000000000002','q0000000-0000-0000-0000-000000000012',2,NULL),
  ('p0000000-0000-0000-0000-000000000002','q0000000-0000-0000-0000-000000000013',3,NULL),
  ('p0000000-0000-0000-0000-000000000002','q0000000-0000-0000-0000-000000000014',4,NULL),
  ('p0000000-0000-0000-0000-000000000002','q0000000-0000-0000-0000-000000000015',5,NULL);
