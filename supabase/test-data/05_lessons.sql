-- ============================================================
-- 05 — Lessons (8 lessons across subjects and class levels)
-- ============================================================

INSERT INTO public.lessons (
  id, title, subject, class_level, week, lesson_number,
  duration, slides, is_favorite, scheduled_date,
  curriculum_info, user_id, created_at
) VALUES

  -- 1. KG 1 — Mathematics (Akosua Mensah)
  ('f0000000-0000-0000-0000-000000000001',
   'Counting Numbers 1 to 20',
   'Mathematics', 'KG 1', 1, 1, '30 minutes',
   '[
     {"id":"s1","type":"title","title":"Counting Numbers 1 to 20","subtitle":"KG 1 | Mathematics | Week 1"},
     {"id":"s2","type":"content","title":"Learning Objectives","content":"By the end of this lesson, learners will be able to:\n• Count from 1 to 20 in sequence\n• Identify and write numbers 1–20\n• Match numerals to quantities"},
     {"id":"s3","type":"content","title":"Let us Count!","content":"Point and count together:\n1, 2, 3, 4, 5 — CLAP!\n6, 7, 8, 9, 10 — CLAP!\nKeep going to 20!"},
     {"id":"s4","type":"content","title":"Activity","content":"Give each child 20 counters.\nAsk them to count out 5, then 10, then 15, then 20."},
     {"id":"s5","type":"content","title":"Review","content":"Q: What number comes after 9?\nQ: What number comes before 15?\nQ: Count backwards from 10!"}
   ]'::jsonb,
   false, '2026-05-12',
   '{"curriculum":"NaCCA","strand":"Number","sub_strand":"Counting","week":1}'::jsonb,
   'b0000000-0000-0000-0000-000000000004',
   '2026-04-20 09:00:00+00'),

  -- 2. KG 2 — English Language (Demo Teacher)
  ('f0000000-0000-0000-0000-000000000002',
   'The Alphabet — Letters A to M',
   'English Language', 'KG 2', 2, 1, '30 minutes',
   '[
     {"id":"s1","type":"title","title":"The Alphabet — Letters A to M","subtitle":"KG 2 | English Language | Week 2"},
     {"id":"s2","type":"content","title":"Learning Objectives","content":"Learners will be able to:\n• Recognise and name letters A–M\n• Write uppercase and lowercase A–M\n• Say a word beginning with each letter"},
     {"id":"s3","type":"content","title":"Sing the Alphabet","content":"A B C D E F G\nH I J K L M N\nO P Q R S T U\nV W X Y Z!\nNow I know my ABCs!"},
     {"id":"s4","type":"content","title":"Letter Activity","content":"Match the letter to the picture:\nA = Apple  B = Ball  C = Cat\nD = Dog  E = Egg  F = Fish"},
     {"id":"s5","type":"content","title":"Review","content":"Point to a letter — what is it?\nTell me a word that starts with B.\nWrite the letter M in the air."}
   ]'::jsonb,
   true, '2026-05-13',
   '{"curriculum":"NaCCA","strand":"Reading","sub_strand":"Phonics","week":2}'::jsonb,
   'fdf6539c-efa5-4205-9b9e-3ee3140d85e7',
   '2026-04-21 09:30:00+00'),

  -- 3. Primary 2 — Mathematics (Emmanuel Boateng)
  ('f0000000-0000-0000-0000-000000000003',
   'Addition and Subtraction Within 100',
   'Mathematics', 'Primary 2', 3, 2, '45 minutes',
   '[
     {"id":"s1","type":"title","title":"Addition and Subtraction Within 100","subtitle":"Primary 2 | Mathematics | Week 3"},
     {"id":"s2","type":"content","title":"Learning Objectives","content":"Learners will be able to:\n• Add two-digit numbers with and without regrouping\n• Subtract two-digit numbers\n• Solve simple word problems"},
     {"id":"s3","type":"content","title":"Let us Add","content":"45 + 32 = ?\nStep 1: Add the ones → 5 + 2 = 7\nStep 2: Add the tens → 4 + 3 = 7\nAnswer: 77\n\nTry: 63 + 25 = ?"},
     {"id":"s4","type":"content","title":"Let us Subtract","content":"78 − 34 = ?\nStep 1: Subtract ones → 8 − 4 = 4\nStep 2: Subtract tens → 7 − 3 = 4\nAnswer: 44\n\nTry: 95 − 52 = ?"},
     {"id":"s5","type":"content","title":"Word Problem","content":"Ama had 56 mangoes.\nShe gave 23 to her friends.\nHow many does she have left?\n\n56 − 23 = ?"}
   ]'::jsonb,
   false, '2026-05-14',
   '{"curriculum":"NaCCA","strand":"Number","sub_strand":"Operations","week":3}'::jsonb,
   'b0000000-0000-0000-0000-000000000005',
   '2026-04-22 10:00:00+00'),

  -- 4. Primary 3 — English Language (Emmanuel Boateng)
  ('f0000000-0000-0000-0000-000000000004',
   'Nouns and Pronouns',
   'English Language', 'Primary 3', 4, 1, '45 minutes',
   '[
     {"id":"s1","type":"title","title":"Nouns and Pronouns","subtitle":"Primary 3 | English Language | Week 4"},
     {"id":"s2","type":"content","title":"Learning Objectives","content":"Learners will be able to:\n• Identify nouns in sentences\n• Replace nouns with correct pronouns\n• Use pronouns in their own sentences"},
     {"id":"s3","type":"content","title":"What is a Noun?","content":"A noun is a naming word.\nIt names a person, place, animal, or thing.\n\nExamples:\nPerson: teacher, doctor, Kofi\nPlace: school, market, Accra\nThing: book, pen, table"},
     {"id":"s4","type":"content","title":"What is a Pronoun?","content":"A pronoun replaces a noun.\n\nKofi → he\nAma → she\nThe book → it\nKofi and Ama → they\n\nExample:\n'Kofi reads every day.' → 'He reads every day.'"},
     {"id":"s5","type":"content","title":"Practice","content":"Replace the nouns with pronouns:\n1. Akua likes to sing.\n2. The dog barked loudly.\n3. My mother and I went to the market."}
   ]'::jsonb,
   false, '2026-05-15',
   '{"curriculum":"NaCCA","strand":"Grammar","sub_strand":"Parts of Speech","week":4}'::jsonb,
   'b0000000-0000-0000-0000-000000000005',
   '2026-04-23 09:00:00+00'),

  -- 5. Primary 5 — Science (Grace Darko)
  ('f0000000-0000-0000-0000-000000000005',
   'The Human Digestive System',
   'Science', 'Primary 5', 5, 1, '45 minutes',
   '[
     {"id":"s1","type":"title","title":"The Human Digestive System","subtitle":"Primary 5 | Science | Week 5"},
     {"id":"s2","type":"content","title":"Learning Objectives","content":"Learners will be able to:\n• Name the organs of the digestive system\n• Describe the path food takes through the body\n• Explain the importance of digestion"},
     {"id":"s3","type":"content","title":"Organs of Digestion","content":"1. Mouth — chews and mixes food with saliva\n2. Oesophagus — tube that carries food to stomach\n3. Stomach — churns food and adds acid\n4. Small Intestine — absorbs nutrients\n5. Large Intestine — absorbs water\n6. Rectum & Anus — removes waste"},
     {"id":"s4","type":"content","title":"How Digestion Works","content":"Food enters the mouth → chewed and swallowed\n↓ Travels down the oesophagus\n↓ Enters the stomach (2–4 hours)\n↓ Moves to small intestine (nutrients absorbed)\n↓ Waste moves to large intestine\n↓ Removed through the anus"},
     {"id":"s5","type":"content","title":"Review Questions","content":"1. Which organ absorbs most nutrients?\n2. What does saliva do to food?\n3. Name two organs of the digestive system.\n4. Why is digestion important?"}
   ]'::jsonb,
   true, '2026-05-12',
   '{"curriculum":"NaCCA","strand":"Life Science","sub_strand":"Human Body","week":5}'::jsonb,
   'b0000000-0000-0000-0000-000000000006',
   '2026-04-24 10:00:00+00'),

  -- 6. Primary 4 — Science (Grace Darko)
  ('f0000000-0000-0000-0000-000000000006',
   'Living and Non-Living Things',
   'Science', 'Primary 4', 2, 1, '40 minutes',
   '[
     {"id":"s1","type":"title","title":"Living and Non-Living Things","subtitle":"Primary 4 | Science | Week 2"},
     {"id":"s2","type":"content","title":"Learning Objectives","content":"Learners will be able to:\n• Distinguish between living and non-living things\n• List characteristics of living things\n• Give examples from their environment"},
     {"id":"s3","type":"content","title":"Characteristics of Living Things","content":"Living things:\n✓ Grow and develop\n✓ Reproduce (make new life)\n✓ Respond to their environment\n✓ Need food and water\n✓ Breathe (exchange gases)\n✓ Move (in some way)"},
     {"id":"s4","type":"content","title":"Examples","content":"LIVING: plants, animals, fungi, bacteria\nNON-LIVING: stone, water, table, pen, sun\n\nRemember: Water is non-living even though living things need it!"},
     {"id":"s5","type":"content","title":"Sorting Activity","content":"Sort these into LIVING or NON-LIVING:\nDog, Chair, Mango tree, River, Bee,\nBook, Mushroom, Cloud, Worm, Sand"}
   ]'::jsonb,
   false, '2026-05-13',
   '{"curriculum":"NaCCA","strand":"Life Science","sub_strand":"Classification","week":2}'::jsonb,
   'b0000000-0000-0000-0000-000000000006',
   '2026-04-25 09:30:00+00'),

  -- 7. JHS 1 — Social Studies (Kwame Owusu)
  ('f0000000-0000-0000-0000-000000000007',
   'Ghana''s Independence',
   'Social Studies', 'JHS 1', 3, 1, '60 minutes',
   '[
     {"id":"s1","type":"title","title":"Ghana''s Independence","subtitle":"JHS 1 | Social Studies | Week 3"},
     {"id":"s2","type":"content","title":"Learning Objectives","content":"Learners will be able to:\n• State the date and circumstances of Ghana''s independence\n• Identify key figures in Ghana''s independence movement\n• Explain the significance of independence to Ghana and Africa"},
     {"id":"s3","type":"content","title":"Road to Independence","content":"Ghana was formerly the Gold Coast under British colonial rule.\n\nKey events:\n• 1947: UGCC (United Gold Coast Convention) formed\n• 1949: Kwame Nkrumah forms the CPP\n• 1951: First elections — CPP wins\n• 1957: Ghana becomes INDEPENDENT on 6th March"},
     {"id":"s4","type":"content","title":"Key Figures","content":"Dr. Kwame Nkrumah — First President of Ghana\nDr. J.B. Danquah — Nationalist leader\nYaa Asantewaa — Earlier resistance leader\nSir Charles Arden-Clarke — Last British Governor"},
     {"id":"s5","type":"content","title":"Significance","content":"• Ghana was the FIRST sub-Saharan African country to gain independence\n• Inspired other African nations\n• Kwame Nkrumah became a pan-African hero\n• Independence Day: 6th March — national holiday\n\nDiscussion: Why is independence important?"}
   ]'::jsonb,
   false, '2026-05-14',
   '{"curriculum":"NaCCA","strand":"History","sub_strand":"Governance","week":3}'::jsonb,
   'b0000000-0000-0000-0000-000000000007',
   '2026-04-26 10:00:00+00'),

  -- 8. JHS 2 — English Language (Kwame Owusu)
  ('f0000000-0000-0000-0000-000000000008',
   'Descriptive Writing',
   'English Language', 'JHS 2', 4, 2, '60 minutes',
   '[
     {"id":"s1","type":"title","title":"Descriptive Writing","subtitle":"JHS 2 | English Language | Week 4"},
     {"id":"s2","type":"content","title":"Learning Objectives","content":"Learners will be able to:\n• Identify features of descriptive writing\n• Use sensory details (sight, sound, smell, taste, touch)\n• Write a descriptive paragraph about a place or person"},
     {"id":"s3","type":"content","title":"Features of Descriptive Writing","content":"1. Uses vivid adjectives\n2. Appeals to the five senses\n3. Creates a picture in the reader''s mind\n4. Uses similes and metaphors\n5. Organises details logically"},
     {"id":"s4","type":"content","title":"Example Passage","content":"''The school market was alive with colour and noise. Bright bolts of kente cloth shimmered in the afternoon sun. The smell of kelewele — hot, spicy fried plantain — drifted through the air. Traders called out their prices like a lively chorus...''\n\nWhat senses does the writer appeal to?"},
     {"id":"s5","type":"content","title":"Writing Task","content":"Describe ONE of the following in a paragraph of 8–10 sentences:\n\n• Your school compound in the morning\n• A busy market you have visited\n• Your favourite place at home\n\nRemember: show, don''t just tell!"}
   ]'::jsonb,
   false, '2026-05-15',
   '{"curriculum":"NaCCA","strand":"Writing","sub_strand":"Creative Writing","week":4}'::jsonb,
   'b0000000-0000-0000-0000-000000000007',
   '2026-04-27 09:00:00+00')

ON CONFLICT (id) DO NOTHING;
