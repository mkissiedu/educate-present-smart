#!/usr/bin/env node
// Run: node seed.cjs
// Requires: @supabase/supabase-js (already in root node_modules)
// Run 00_missing_tables.sql in the Supabase SQL editor FIRST.
// Keys are loaded from supabase/test-data/.env (gitignored).

const fs   = require('fs');
const path = require('path');

// Load .env from same directory without requiring the dotenv package
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf-8')
    .split('\n')
    .forEach(line => {
      const eq = line.indexOf('=');
      if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    });
} catch (_) {}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL        || '';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in supabase/test-data/.env');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function upsert(table, rows, conflict) {
  const { error } = await sb.from(table).upsert(rows, {
    onConflict: conflict,
    ignoreDuplicates: true,
  });
  if (error) console.error(`  ✗ ${table}:`, error.message);
  else console.log(`  ✓ ${table} (${rows.length} rows)`);
}

async function run() {

  // ── 01 SCHOOLS ──────────────────────────────────────────────
  console.log('\n[01] Schools');
  await upsert('schools', [
    { id:'a0000000-0000-0000-0000-000000000001', name:'Ananse Academy', code:'ANANSE',
      address:'Plot 14, Osu, Accra, Ghana', phone:'+233302123456', email:'info@ananse.edu.gh',
      motto:'Excellence Through Knowledge', academic_year:'2025/2026', is_active:true,
      gate_latitude:5.5502, gate_longitude:-0.2174, attendance_radius_meters:80,
      late_threshold_time:'08:00:00', early_departure_time:'14:30:00',
      work_start_time:'07:30:00', work_end_time:'15:30:00',
      late_notification_enabled:true, admin_notification_email:'admin@ananse.edu.gh',
      notify_on_absence:true, notify_on_early_departure:true },
    { id:'a0000000-0000-0000-0000-000000000002', name:'Sunrise International School', code:'SUNRISE',
      address:'22 Airport Road, Accra, Ghana', phone:'+233302987654', email:'info@sunrise.edu.gh',
      motto:'Rising Together', academic_year:'2025/2026', is_active:true,
      gate_latitude:5.6037, gate_longitude:-0.1870, attendance_radius_meters:100,
      late_threshold_time:'07:45:00', early_departure_time:'14:00:00',
      work_start_time:'07:15:00', work_end_time:'15:00:00',
      late_notification_enabled:false, admin_notification_email:'admin@sunrise.edu.gh',
      notify_on_absence:false, notify_on_early_departure:false },
  ], 'code');

  // ── 02 USERS ─────────────────────────────────────────────────
  console.log('\n[02] Users — update existing seed users');
  for (const [id, school_id] of [
    ['fdf6539c-efa5-4205-9b9e-3ee3140d85e7', 'a0000000-0000-0000-0000-000000000001'],
    ['41370924-e180-4985-b0d5-e618c2a35e9e', 'a0000000-0000-0000-0000-000000000001'],
    ['2d0b7399-64a2-4997-acc8-276a62d12d55', 'a0000000-0000-0000-0000-000000000001'],
  ]) {
    const { error } = await sb.from('users').update({ school_id }).eq('id', id);
    if (error) console.error(`  ✗ update user ${id}:`, error.message);
  }
  console.log('  ✓ users updated (school_id linked)');

  await upsert('users', [
    { id:'b0000000-0000-0000-0000-000000000001', name:'Ama Antwi',       email:'platformadmin@catalyst.edu',  phone:'+233244100001', password_hash:'admin123',   role:'platform_admin', assigned_classes:'[]', school_id:null, is_active:true },
    { id:'b0000000-0000-0000-0000-000000000002', name:'Yaw Mensah',      email:'admin@sunrise.edu.gh',         phone:'+233244100002', password_hash:'admin123',   role:'school_admin',   assigned_classes:'[]', school_id:'a0000000-0000-0000-0000-000000000002', is_active:true },
    { id:'b0000000-0000-0000-0000-000000000003', name:'Adwoa Asante',    email:'super@sunrise.edu.gh',         phone:'+233244100003', password_hash:'super123',   role:'super_teacher',  assigned_classes:'[]', school_id:'a0000000-0000-0000-0000-000000000002', is_active:true },
    { id:'b0000000-0000-0000-0000-000000000004', name:'Akosua Mensah',   email:'akosua@ananse.edu.gh',         phone:'+233244100004', password_hash:'teacher123', role:'teacher',        assigned_classes:'["KG 1","KG 2"]', school_id:'a0000000-0000-0000-0000-000000000001', is_active:true },
    { id:'b0000000-0000-0000-0000-000000000005', name:'Emmanuel Boateng',email:'emmanuel@ananse.edu.gh',       phone:'+233244100005', password_hash:'teacher123', role:'teacher',        assigned_classes:'["Primary 1","Primary 2","Primary 3"]', school_id:'a0000000-0000-0000-0000-000000000001', is_active:true },
    { id:'b0000000-0000-0000-0000-000000000006', name:'Grace Darko',     email:'grace@ananse.edu.gh',          phone:'+233244100006', password_hash:'teacher123', role:'teacher',        assigned_classes:'["Primary 4","Primary 5","Primary 6"]', school_id:'a0000000-0000-0000-0000-000000000001', is_active:true },
    { id:'b0000000-0000-0000-0000-000000000007', name:'Kwame Owusu',     email:'kwame@ananse.edu.gh',          phone:'+233244100007', password_hash:'teacher123', role:'teacher',        assigned_classes:'["JHS 1","JHS 2","JHS 3"]', school_id:'a0000000-0000-0000-0000-000000000001', is_active:true },
    { id:'b0000000-0000-0000-0000-000000000008', name:'Abena Frimpong',  email:'abena@sunrise.edu.gh',         phone:'+233244100008', password_hash:'teacher123', role:'teacher',        assigned_classes:'["Primary 1","Primary 2","Primary 3"]', school_id:'a0000000-0000-0000-0000-000000000002', is_active:true },
  ], 'email');

  // ── 03 TERMS ─────────────────────────────────────────────────
  console.log('\n[03] Terms');
  await upsert('term_settings', [
    { id:'1a000000-0000-0000-0000-000000000001', academic_year:'2025/2026', term_number:1, term_name:'First Term',  start_date:'2025-09-02', end_date:'2025-12-12', user_id:'b0000000-0000-0000-0000-000000000001' },
    { id:'1a000000-0000-0000-0000-000000000002', academic_year:'2025/2026', term_number:2, term_name:'Second Term', start_date:'2026-01-12', end_date:'2026-04-02', user_id:'b0000000-0000-0000-0000-000000000001' },
    { id:'1a000000-0000-0000-0000-000000000003', academic_year:'2025/2026', term_number:3, term_name:'Third Term',  start_date:'2026-04-20', end_date:'2026-07-17', user_id:'b0000000-0000-0000-0000-000000000001' },
  ], 'id');

  // ── 03 TEACHER ASSIGNMENTS ───────────────────────────────────
  console.log('\n[03] Teacher assignments');
  await upsert('teacher_assignments', [
    { teacher_id:'fdf6539c-efa5-4205-9b9e-3ee3140d85e7', school_id:'a0000000-0000-0000-0000-000000000001', assigned_classes:['KG 1','KG 2'], assigned_subjects:['English Language'], assignment_mode:'multi-class', assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { teacher_id:'b0000000-0000-0000-0000-000000000004', school_id:'a0000000-0000-0000-0000-000000000001', assigned_classes:['KG 1','KG 2'], assigned_subjects:['Mathematics'], assignment_mode:'multi-class', assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { teacher_id:'b0000000-0000-0000-0000-000000000005', school_id:'a0000000-0000-0000-0000-000000000001', assigned_classes:['Primary 1','Primary 2','Primary 3'], assigned_subjects:['Mathematics','English Language'], assignment_mode:'multi-class', assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { teacher_id:'b0000000-0000-0000-0000-000000000006', school_id:'a0000000-0000-0000-0000-000000000001', assigned_classes:['Primary 4','Primary 5','Primary 6'], assigned_subjects:['Science','Mathematics'], assignment_mode:'multi-class', assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { teacher_id:'b0000000-0000-0000-0000-000000000007', school_id:'a0000000-0000-0000-0000-000000000001', assigned_classes:['JHS 1','JHS 2','JHS 3'], assigned_subjects:['Social Studies','English Language'], assignment_mode:'multi-class', assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { teacher_id:'b0000000-0000-0000-0000-000000000008', school_id:'a0000000-0000-0000-0000-000000000002', assigned_classes:['Primary 1','Primary 2','Primary 3'], assigned_subjects:['English Language','Mathematics'], assignment_mode:'multi-class', assigned_by:'b0000000-0000-0000-0000-000000000002', is_active:true },
  ], 'teacher_id,school_id');

  // ── 03 SUPER TEACHER ASSIGNMENTS ─────────────────────────────
  console.log('\n[03] Super teacher assignments');
  await upsert('super_teacher_assignments', [
    { super_teacher_id:'2d0b7399-64a2-4997-acc8-276a62d12d55', subject:'Mathematics',     class_level:'KG 1',     assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { super_teacher_id:'2d0b7399-64a2-4997-acc8-276a62d12d55', subject:'Mathematics',     class_level:'KG 2',     assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { super_teacher_id:'2d0b7399-64a2-4997-acc8-276a62d12d55', subject:'Mathematics',     class_level:'Primary 1',assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { super_teacher_id:'2d0b7399-64a2-4997-acc8-276a62d12d55', subject:'Mathematics',     class_level:'Primary 2',assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { super_teacher_id:'2d0b7399-64a2-4997-acc8-276a62d12d55', subject:'Mathematics',     class_level:'Primary 3',assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { super_teacher_id:'2d0b7399-64a2-4997-acc8-276a62d12d55', subject:'English Language',class_level:'JHS 1',    assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { super_teacher_id:'2d0b7399-64a2-4997-acc8-276a62d12d55', subject:'English Language',class_level:'JHS 2',    assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { super_teacher_id:'2d0b7399-64a2-4997-acc8-276a62d12d55', subject:'English Language',class_level:'JHS 3',    assigned_by:'41370924-e180-4985-b0d5-e618c2a35e9e', is_active:true },
    { super_teacher_id:'b0000000-0000-0000-0000-000000000003', subject:'Mathematics',     class_level:'Primary 1',assigned_by:'b0000000-0000-0000-0000-000000000002', is_active:true },
    { super_teacher_id:'b0000000-0000-0000-0000-000000000003', subject:'Mathematics',     class_level:'Primary 2',assigned_by:'b0000000-0000-0000-0000-000000000002', is_active:true },
    { super_teacher_id:'b0000000-0000-0000-0000-000000000003', subject:'Science',         class_level:'Primary 3',assigned_by:'b0000000-0000-0000-0000-000000000002', is_active:true },
  ], 'super_teacher_id,subject,class_level');

  // ── 04 STUDENTS ──────────────────────────────────────────────
  console.log('\n[04] Students');
  const S1 = 'a0000000-0000-0000-0000-000000000001';
  const S2 = 'a0000000-0000-0000-0000-000000000002';
  const DT = 'fdf6539c-efa5-4205-9b9e-3ee3140d85e7';
  const T4 = 'b0000000-0000-0000-0000-000000000004';
  const T5 = 'b0000000-0000-0000-0000-000000000005';
  const T6 = 'b0000000-0000-0000-0000-000000000006';
  const T7 = 'b0000000-0000-0000-0000-000000000007';
  const T8 = 'b0000000-0000-0000-0000-000000000008';
  await upsert('students', [
    { id:'c1000000-0000-0000-0000-000000000001', first_name:'Kwame',   last_name:'Mensah',   class_level:'KG 1',    class_name:'KG 1',    class_id:'KG 1',    date_of_birth:'2020-03-15', student_id:'STU-001', teacher_id:DT, school_id:S1, guardian1_name:'Kofi Mensah',    guardian1_whatsapp:'+233244200001', guardian1_email:'kofi.mensah@gmail.com',   is_active:true },
    { id:'c1000000-0000-0000-0000-000000000002', first_name:'Ama',     last_name:'Asante',   class_level:'KG 1',    class_name:'KG 1',    class_id:'KG 1',    date_of_birth:'2020-07-22', student_id:'STU-002', teacher_id:DT, school_id:S1, guardian1_name:'Yaa Asante',     guardian1_whatsapp:'+233244200002', guardian1_email:'yaa.asante@gmail.com',    is_active:true },
    { id:'c1000000-0000-0000-0000-000000000003', first_name:'Kofi',    last_name:'Boateng',  class_level:'KG 1',    class_name:'KG 1',    class_id:'KG 1',    date_of_birth:'2020-11-05', student_id:'STU-003', teacher_id:DT, school_id:S1, guardian1_name:'Kwesi Boateng',  guardian1_whatsapp:'+233244200003', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000004', first_name:'Akua',    last_name:'Owusu',    class_level:'KG 2',    class_name:'KG 2',    class_id:'KG 2',    date_of_birth:'2019-04-18', student_id:'STU-004', teacher_id:T4, school_id:S1, guardian1_name:'Abena Owusu',    guardian1_whatsapp:'+233244200004', guardian1_email:'abena.owusu@gmail.com',   is_active:true },
    { id:'c1000000-0000-0000-0000-000000000005', first_name:'Yaw',     last_name:'Amponsah', class_level:'KG 2',    class_name:'KG 2',    class_id:'KG 2',    date_of_birth:'2019-08-30', student_id:'STU-005', teacher_id:T4, school_id:S1, guardian1_name:'Kwame Amponsah', guardian1_whatsapp:'+233244200005', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000006', first_name:'Abena',   last_name:'Osei',     class_level:'KG 2',    class_name:'KG 2',    class_id:'KG 2',    date_of_birth:'2019-01-12', student_id:'STU-006', teacher_id:T4, school_id:S1, guardian1_name:'Ama Osei',       guardian1_whatsapp:'+233244200006', guardian1_email:'ama.osei@yahoo.com',      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000007', first_name:'Emmanuel',last_name:'Appiah',   class_level:'Primary 1',class_name:'Primary 1',class_id:'Primary 1',date_of_birth:'2018-05-20',student_id:'STU-007',teacher_id:T5,school_id:S1, guardian1_name:'Samuel Appiah',  guardian1_whatsapp:'+233244200007', guardian1_email:'s.appiah@gmail.com',      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000008', first_name:'Adwoa',   last_name:'Antwi',    class_level:'Primary 1',class_name:'Primary 1',class_id:'Primary 1',date_of_birth:'2018-09-14',student_id:'STU-008',teacher_id:T5,school_id:S1, guardian1_name:'Kojo Antwi',     guardian1_whatsapp:'+233244200008', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000009', first_name:'Nana',    last_name:'Frimpong', class_level:'Primary 1',class_name:'Primary 1',class_id:'Primary 1',date_of_birth:'2018-03-28',student_id:'STU-009',teacher_id:T5,school_id:S1, guardian1_name:'Esi Frimpong',   guardian1_whatsapp:'+233244200009', guardian1_email:'esi.frimpong@gmail.com',  is_active:true },
    { id:'c1000000-0000-0000-0000-000000000010', first_name:'Efua',    last_name:'Amoako',   class_level:'Primary 2',class_name:'Primary 2',class_id:'Primary 2',date_of_birth:'2017-06-11',student_id:'STU-010',teacher_id:T5,school_id:S1, guardian1_name:'Kweku Amoako',   guardian1_whatsapp:'+233244200010', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000011', first_name:'Kwabena', last_name:'Kusi',     class_level:'Primary 2',class_name:'Primary 2',class_id:'Primary 2',date_of_birth:'2017-10-25',student_id:'STU-011',teacher_id:T5,school_id:S1, guardian1_name:'Akua Kusi',      guardian1_whatsapp:'+233244200011', guardian1_email:'akua.kusi@gmail.com',     is_active:true },
    { id:'c1000000-0000-0000-0000-000000000012', first_name:'Afia',    last_name:'Bonsu',    class_level:'Primary 2',class_name:'Primary 2',class_id:'Primary 2',date_of_birth:'2017-02-08',student_id:'STU-012',teacher_id:T5,school_id:S1, guardian1_name:'Kofi Bonsu',     guardian1_whatsapp:'+233244200012', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000013', first_name:'Kweku',   last_name:'Asare',    class_level:'Primary 3',class_name:'Primary 3',class_id:'Primary 3',date_of_birth:'2016-07-17',student_id:'STU-013',teacher_id:T5,school_id:S1, guardian1_name:'Maame Asare',    guardian1_whatsapp:'+233244200013', guardian1_email:'maame.asare@gmail.com',   is_active:true },
    { id:'c1000000-0000-0000-0000-000000000014', first_name:'Esi',     last_name:'Duah',     class_level:'Primary 3',class_name:'Primary 3',class_id:'Primary 3',date_of_birth:'2016-11-30',student_id:'STU-014',teacher_id:T5,school_id:S1, guardian1_name:'Yaw Duah',       guardian1_whatsapp:'+233244200014', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000015', first_name:'Fiifi',   last_name:'Wiredu',   class_level:'Primary 3',class_name:'Primary 3',class_id:'Primary 3',date_of_birth:'2016-04-03',student_id:'STU-015',teacher_id:T5,school_id:S1, guardian1_name:'Abena Wiredu',   guardian1_whatsapp:'+233244200015', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000016', first_name:'Maame',   last_name:'Adomako',  class_level:'Primary 4',class_name:'Primary 4',class_id:'Primary 4',date_of_birth:'2015-08-22',student_id:'STU-016',teacher_id:T6,school_id:S1, guardian1_name:'Kwame Adomako',  guardian1_whatsapp:'+233244200016', guardian1_email:'k.adomako@gmail.com',     is_active:true },
    { id:'c1000000-0000-0000-0000-000000000017', first_name:'Isaac',   last_name:'Nyarko',   class_level:'Primary 4',class_name:'Primary 4',class_id:'Primary 4',date_of_birth:'2015-02-14',student_id:'STU-017',teacher_id:T6,school_id:S1, guardian1_name:'Grace Nyarko',   guardian1_whatsapp:'+233244200017', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000018', first_name:'Patience',last_name:'Sarpong',  class_level:'Primary 4',class_name:'Primary 4',class_id:'Primary 4',date_of_birth:'2015-06-09',student_id:'STU-018',teacher_id:T6,school_id:S1, guardian1_name:'Bernard Sarpong',guardian1_whatsapp:'+233244200018', guardian1_email:'b.sarpong@gmail.com',     is_active:true },
    { id:'c1000000-0000-0000-0000-000000000019', first_name:'Bernard', last_name:'Mensah',   class_level:'Primary 5',class_name:'Primary 5',class_id:'Primary 5',date_of_birth:'2014-09-18',student_id:'STU-019',teacher_id:T6,school_id:S1, guardian1_name:'Adwoa Mensah',   guardian1_whatsapp:'+233244200019', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000020', first_name:'Ruth',    last_name:'Asante',   class_level:'Primary 5',class_name:'Primary 5',class_id:'Primary 5',date_of_birth:'2014-03-27',student_id:'STU-020',teacher_id:T6,school_id:S1, guardian1_name:'Kojo Asante',    guardian1_whatsapp:'+233244200020', guardian1_email:'kojo.asante@gmail.com',   is_active:true },
    { id:'c1000000-0000-0000-0000-000000000021', first_name:'Kwasi',   last_name:'Boateng',  class_level:'Primary 5',class_name:'Primary 5',class_id:'Primary 5',date_of_birth:'2014-11-05',student_id:'STU-021',teacher_id:T6,school_id:S1, guardian1_name:'Ama Boateng',    guardian1_whatsapp:'+233244200021', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000022', first_name:'Naomi',   last_name:'Owusu',    class_level:'Primary 6',class_name:'Primary 6',class_id:'Primary 6',date_of_birth:'2013-07-16',student_id:'STU-022',teacher_id:T6,school_id:S1, guardian1_name:'Ekua Owusu',     guardian1_whatsapp:'+233244200022', guardian1_email:'ekua.owusu@gmail.com',    is_active:true },
    { id:'c1000000-0000-0000-0000-000000000023', first_name:'Michael', last_name:'Amponsah', class_level:'Primary 6',class_name:'Primary 6',class_id:'Primary 6',date_of_birth:'2013-01-28',student_id:'STU-023',teacher_id:T6,school_id:S1, guardian1_name:'Aba Amponsah',   guardian1_whatsapp:'+233244200023', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000024', first_name:'Joyce',   last_name:'Osei',     class_level:'Primary 6',class_name:'Primary 6',class_id:'Primary 6',date_of_birth:'2013-05-11',student_id:'STU-024',teacher_id:T6,school_id:S1, guardian1_name:'Kwabena Osei',   guardian1_whatsapp:'+233244200024', guardian1_email:'kwabena.osei@gmail.com',  is_active:true },
    { id:'c1000000-0000-0000-0000-000000000025', first_name:'Kojo',    last_name:'Appiah',   class_level:'JHS 1',   class_name:'JHS 1',   class_id:'JHS 1',   date_of_birth:'2012-08-20', student_id:'STU-025', teacher_id:T7, school_id:S1, guardian1_name:'Esi Appiah',     guardian1_whatsapp:'+233244200025', guardian1_email:'esi.appiah@gmail.com',    is_active:true },
    { id:'c1000000-0000-0000-0000-000000000026', first_name:'Akosua',  last_name:'Antwi',    class_level:'JHS 1',   class_name:'JHS 1',   class_id:'JHS 1',   date_of_birth:'2012-03-14', student_id:'STU-026', teacher_id:T7, school_id:S1, guardian1_name:'Fiifi Antwi',    guardian1_whatsapp:'+233244200026', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000027', first_name:'Daniel',  last_name:'Frimpong', class_level:'JHS 1',   class_name:'JHS 1',   class_id:'JHS 1',   date_of_birth:'2012-11-30', student_id:'STU-027', teacher_id:T7, school_id:S1, guardian1_name:'Akua Frimpong',  guardian1_whatsapp:'+233244200027', guardian1_email:'akua.frimpong@gmail.com', is_active:true },
    { id:'c1000000-0000-0000-0000-000000000028', first_name:'Akwasi',  last_name:'Darko',    class_level:'JHS 2',   class_name:'JHS 2',   class_id:'JHS 2',   date_of_birth:'2011-06-08', student_id:'STU-028', teacher_id:T7, school_id:S1, guardian1_name:'Ama Darko',      guardian1_whatsapp:'+233244200028', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000029', first_name:'Abigail', last_name:'Amoako',   class_level:'JHS 2',   class_name:'JHS 2',   class_id:'JHS 2',   date_of_birth:'2011-10-22', student_id:'STU-029', teacher_id:T7, school_id:S1, guardian1_name:'Yaw Amoako',     guardian1_whatsapp:'+233244200029', guardian1_email:'yaw.amoako@gmail.com',    is_active:true },
    { id:'c1000000-0000-0000-0000-000000000030', first_name:'Nii',     last_name:'Mensah',   class_level:'JHS 2',   class_name:'JHS 2',   class_id:'JHS 2',   date_of_birth:'2011-02-16', student_id:'STU-030', teacher_id:T7, school_id:S1, guardian1_name:'Adwoa Mensah',   guardian1_whatsapp:'+233244200030', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000031', first_name:'Thomas',  last_name:'Kusi',     class_level:'JHS 3',   class_name:'JHS 3',   class_id:'JHS 3',   date_of_birth:'2010-09-05', student_id:'STU-031', teacher_id:T7, school_id:S1, guardian1_name:'Abena Kusi',     guardian1_whatsapp:'+233244200031', guardian1_email:'abena.kusi@gmail.com',    is_active:true },
    { id:'c1000000-0000-0000-0000-000000000032', first_name:'Ama',     last_name:'Bonsu',    class_level:'JHS 3',   class_name:'JHS 3',   class_id:'JHS 3',   date_of_birth:'2010-01-19', student_id:'STU-032', teacher_id:T7, school_id:S1, guardian1_name:'Kofi Bonsu',     guardian1_whatsapp:'+233244200032', guardian1_email:null,                      is_active:true },
    { id:'c1000000-0000-0000-0000-000000000033', first_name:'Samuel',  last_name:'Asare',    class_level:'JHS 3',   class_name:'JHS 3',   class_id:'JHS 3',   date_of_birth:'2010-07-31', student_id:'STU-033', teacher_id:T7, school_id:S1, guardian1_name:'Maame Asare',    guardian1_whatsapp:'+233244200033', guardian1_email:'maame2.asare@gmail.com',  is_active:true },
    { id:'c2000000-0000-0000-0000-000000000001', first_name:'Peter',   last_name:'Mensah',   class_level:'Primary 1',class_name:'Primary 1',class_id:'Primary 1',date_of_birth:'2018-03-10',student_id:'STU-S2-001',teacher_id:T8,school_id:S2, guardian1_name:'Isaac Mensah',   guardian1_whatsapp:'+233244300001', guardian1_email:'isaac.mensah@gmail.com',  is_active:true },
    { id:'c2000000-0000-0000-0000-000000000002', first_name:'Hannah',  last_name:'Boateng',  class_level:'Primary 1',class_name:'Primary 1',class_id:'Primary 1',date_of_birth:'2018-07-25',student_id:'STU-S2-002',teacher_id:T8,school_id:S2, guardian1_name:'Ruth Boateng',   guardian1_whatsapp:'+233244300002', guardian1_email:null,                      is_active:true },
    { id:'c2000000-0000-0000-0000-000000000003', first_name:'Joseph',  last_name:'Owusu',    class_level:'JHS 1',   class_name:'JHS 1',   class_id:'JHS 1',   date_of_birth:'2012-05-18', student_id:'STU-S2-003',teacher_id:null,school_id:S2,guardian1_name:'Comfort Owusu',  guardian1_whatsapp:'+233244300003', guardian1_email:'comfort.owusu@gmail.com', is_active:true },
  ], 'id');

  // ── 05 LESSONS ───────────────────────────────────────────────
  console.log('\n[05] Lessons');
  await upsert('lessons', [
    { id:'f0000000-0000-0000-0000-000000000001', title:'Counting Numbers 1 to 20', subject:'Mathematics', class_level:'KG 1', week:1, lesson_number:1, duration:'30 minutes', slides:[], is_favorite:false, scheduled_date:'2026-05-12', user_id:'b0000000-0000-0000-0000-000000000004', curriculum_info:{curriculum:'NaCCA',strand:'Number',sub_strand:'Counting',week:1} },
    { id:'f0000000-0000-0000-0000-000000000002', title:'The Alphabet — Letters A to M', subject:'English Language', class_level:'KG 2', week:2, lesson_number:1, duration:'30 minutes', slides:[], is_favorite:true, scheduled_date:'2026-05-13', user_id:'fdf6539c-efa5-4205-9b9e-3ee3140d85e7', curriculum_info:{curriculum:'NaCCA',strand:'Reading',sub_strand:'Phonics',week:2} },
    { id:'f0000000-0000-0000-0000-000000000003', title:'Addition and Subtraction Within 100', subject:'Mathematics', class_level:'Primary 2', week:3, lesson_number:2, duration:'45 minutes', slides:[], is_favorite:false, scheduled_date:'2026-05-14', user_id:'b0000000-0000-0000-0000-000000000005', curriculum_info:{curriculum:'NaCCA',strand:'Number',sub_strand:'Operations',week:3} },
    { id:'f0000000-0000-0000-0000-000000000004', title:'Nouns and Pronouns', subject:'English Language', class_level:'Primary 3', week:4, lesson_number:1, duration:'45 minutes', slides:[], is_favorite:false, scheduled_date:'2026-05-15', user_id:'b0000000-0000-0000-0000-000000000005', curriculum_info:{curriculum:'NaCCA',strand:'Grammar',sub_strand:'Parts of Speech',week:4} },
    { id:'f0000000-0000-0000-0000-000000000005', title:'The Human Digestive System', subject:'Science', class_level:'Primary 5', week:5, lesson_number:1, duration:'45 minutes', slides:[], is_favorite:true, scheduled_date:'2026-05-12', user_id:'b0000000-0000-0000-0000-000000000006', curriculum_info:{curriculum:'NaCCA',strand:'Life Science',sub_strand:'Human Body',week:5} },
    { id:'f0000000-0000-0000-0000-000000000006', title:'Living and Non-Living Things', subject:'Science', class_level:'Primary 4', week:2, lesson_number:1, duration:'40 minutes', slides:[], is_favorite:false, scheduled_date:'2026-05-13', user_id:'b0000000-0000-0000-0000-000000000006', curriculum_info:{curriculum:'NaCCA',strand:'Life Science',sub_strand:'Classification',week:2} },
    { id:'f0000000-0000-0000-0000-000000000007', title:"Ghana's Independence", subject:'Social Studies', class_level:'JHS 1', week:3, lesson_number:1, duration:'60 minutes', slides:[], is_favorite:false, scheduled_date:'2026-05-14', user_id:'b0000000-0000-0000-0000-000000000007', curriculum_info:{curriculum:'NaCCA',strand:'History',sub_strand:'Governance',week:3} },
    { id:'f0000000-0000-0000-0000-000000000008', title:'Descriptive Writing', subject:'English Language', class_level:'JHS 2', week:4, lesson_number:2, duration:'60 minutes', slides:[], is_favorite:false, scheduled_date:'2026-05-15', user_id:'b0000000-0000-0000-0000-000000000007', curriculum_info:{curriculum:'NaCCA',strand:'Writing',sub_strand:'Creative Writing',week:4} },
  ], 'id');

  // ── 06 TEACHER ATTENDANCE ────────────────────────────────────
  console.log('\n[06] Teacher attendance');
  const att = [];
  const dates = ['2026-04-27','2026-04-28','2026-04-29','2026-04-30','2026-05-01','2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'];
  const patterns = {
    'fdf6539c-efa5-4205-9b9e-3ee3140d85e7': ['present','present','present','present','present','present','present','late','present','present'],
    'b0000000-0000-0000-0000-000000000004': ['present','present','present','present','present','present','present','present','present','present'],
    'b0000000-0000-0000-0000-000000000005': ['present','late','present','present','present','present','late','present','present','present'],
    'b0000000-0000-0000-0000-000000000006': ['present','present','present','sick','present','present','present','present','present','present'],
    'b0000000-0000-0000-0000-000000000007': ['absent','present','present','present','present','absent','present','present','present','present'],
  };
  for (const [tid, statuses] of Object.entries(patterns)) {
    for (let i = 0; i < dates.length; i++) {
      att.push({ teacher_id:tid, date:dates[i], status:statuses[i], school_id:S1, recorded_by:'41370924-e180-4985-b0d5-e618c2a35e9e' });
    }
  }
  await upsert('teacher_attendance', att, 'teacher_id,date');

  // ── 06 PUNCH CLOCK ───────────────────────────────────────────
  console.log('\n[06] Punch clock');
  await upsert('teacher_punch_clock', [
    // Demo Teacher
    { teacher_id:DT, school_id:S1, date:'2026-04-27', punch_in_time:'2026-04-27T07:35:00Z', punch_out_time:'2026-04-27T15:05:00Z', punch_in_latitude:5.5504, punch_in_longitude:-0.2172, punch_out_latitude:5.5503, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:28, punch_out_distance_meters:22 },
    { teacher_id:DT, school_id:S1, date:'2026-04-28', punch_in_time:'2026-04-28T07:42:00Z', punch_out_time:'2026-04-28T15:10:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2176, punch_out_latitude:5.5505, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:35, punch_out_distance_meters:30 },
    { teacher_id:DT, school_id:S1, date:'2026-04-29', punch_in_time:'2026-04-29T07:38:00Z', punch_out_time:'2026-04-29T15:08:00Z', punch_in_latitude:5.5501, punch_in_longitude:-0.2175, punch_out_latitude:5.5502, punch_out_longitude:-0.2172, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:18, punch_out_distance_meters:25 },
    { teacher_id:DT, school_id:S1, date:'2026-04-30', punch_in_time:'2026-04-30T07:45:00Z', punch_out_time:'2026-04-30T15:12:00Z', punch_in_latitude:5.5505, punch_in_longitude:-0.2174, punch_out_latitude:5.5503, punch_out_longitude:-0.2176, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:33, punch_out_distance_meters:28 },
    { teacher_id:DT, school_id:S1, date:'2026-05-01', punch_in_time:'2026-05-01T07:33:00Z', punch_out_time:'2026-05-01T15:03:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2173, punch_out_latitude:5.5504, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:12, punch_out_distance_meters:20 },
    { teacher_id:DT, school_id:S1, date:'2026-05-04', punch_in_time:'2026-05-04T07:40:00Z', punch_out_time:'2026-05-04T15:07:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2175, punch_out_latitude:5.5501, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:26, punch_out_distance_meters:18 },
    { teacher_id:DT, school_id:S1, date:'2026-05-05', punch_in_time:'2026-05-05T07:36:00Z', punch_out_time:'2026-05-05T15:09:00Z', punch_in_latitude:5.5504, punch_in_longitude:-0.2174, punch_out_latitude:5.5503, punch_out_longitude:-0.2176, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:22, punch_out_distance_meters:30 },
    { teacher_id:DT, school_id:S1, date:'2026-05-06', punch_in_time:'2026-05-06T08:15:00Z', punch_out_time:'2026-05-06T15:05:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2175, punch_out_latitude:5.5504, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:15, punch_out_distance_meters:24 },
    { teacher_id:DT, school_id:S1, date:'2026-05-07', punch_in_time:'2026-05-07T07:39:00Z', punch_out_time:'2026-05-07T15:11:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2174, punch_out_latitude:5.5502, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:20, punch_out_distance_meters:16 },
    { teacher_id:DT, school_id:S1, date:'2026-05-08', punch_in_time:'2026-05-08T07:44:00Z', punch_out_time:'2026-05-08T15:06:00Z', punch_in_latitude:5.5505, punch_in_longitude:-0.2172, punch_out_latitude:5.5503, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:38, punch_out_distance_meters:22 },
    // Akosua Mensah — perfect
    { teacher_id:T4, school_id:S1, date:'2026-04-27', punch_in_time:'2026-04-27T07:25:00Z', punch_out_time:'2026-04-27T15:00:00Z', punch_in_latitude:5.5501, punch_in_longitude:-0.2174, punch_out_latitude:5.5502, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:14, punch_out_distance_meters:20 },
    { teacher_id:T4, school_id:S1, date:'2026-04-28', punch_in_time:'2026-04-28T07:28:00Z', punch_out_time:'2026-04-28T15:02:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2173, punch_out_latitude:5.5501, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:10, punch_out_distance_meters:15 },
    { teacher_id:T4, school_id:S1, date:'2026-04-29', punch_in_time:'2026-04-29T07:30:00Z', punch_out_time:'2026-04-29T15:00:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2175, punch_out_latitude:5.5502, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:22, punch_out_distance_meters:18 },
    { teacher_id:T4, school_id:S1, date:'2026-04-30', punch_in_time:'2026-04-30T07:22:00Z', punch_out_time:'2026-04-30T14:58:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2174, punch_out_latitude:5.5503, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:8,  punch_out_distance_meters:25 },
    { teacher_id:T4, school_id:S1, date:'2026-05-01', punch_in_time:'2026-05-01T07:27:00Z', punch_out_time:'2026-05-01T15:01:00Z', punch_in_latitude:5.5501, punch_in_longitude:-0.2173, punch_out_latitude:5.5502, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:16, punch_out_distance_meters:12 },
    { teacher_id:T4, school_id:S1, date:'2026-05-04', punch_in_time:'2026-05-04T07:24:00Z', punch_out_time:'2026-05-04T14:59:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2175, punch_out_latitude:5.5501, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:20, punch_out_distance_meters:17 },
    { teacher_id:T4, school_id:S1, date:'2026-05-05', punch_in_time:'2026-05-05T07:26:00Z', punch_out_time:'2026-05-05T15:03:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2174, punch_out_latitude:5.5502, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:24, punch_out_distance_meters:20 },
    { teacher_id:T4, school_id:S1, date:'2026-05-06', punch_in_time:'2026-05-06T07:29:00Z', punch_out_time:'2026-05-06T15:00:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2173, punch_out_latitude:5.5503, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:12, punch_out_distance_meters:22 },
    { teacher_id:T4, school_id:S1, date:'2026-05-07', punch_in_time:'2026-05-07T07:31:00Z', punch_out_time:'2026-05-07T15:02:00Z', punch_in_latitude:5.5501, punch_in_longitude:-0.2174, punch_out_latitude:5.5502, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:18, punch_out_distance_meters:14 },
    { teacher_id:T4, school_id:S1, date:'2026-05-08', punch_in_time:'2026-05-08T07:23:00Z', punch_out_time:'2026-05-08T14:57:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2175, punch_out_latitude:5.5501, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:10, punch_out_distance_meters:16 },
    // Emmanuel Boateng — late Apr28+May5, early out May7
    { teacher_id:T5, school_id:S1, date:'2026-04-27', punch_in_time:'2026-04-27T07:50:00Z', punch_out_time:'2026-04-27T15:15:00Z', punch_in_latitude:5.5504, punch_in_longitude:-0.2175, punch_out_latitude:5.5503, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:40, punch_out_distance_meters:32 },
    { teacher_id:T5, school_id:S1, date:'2026-04-28', punch_in_time:'2026-04-28T08:22:00Z', punch_out_time:'2026-04-28T15:10:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2173, punch_out_latitude:5.5504, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:28, punch_out_distance_meters:36 },
    { teacher_id:T5, school_id:S1, date:'2026-04-29', punch_in_time:'2026-04-29T07:48:00Z', punch_out_time:'2026-04-29T15:18:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2176, punch_out_latitude:5.5503, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:44, punch_out_distance_meters:30 },
    { teacher_id:T5, school_id:S1, date:'2026-04-30', punch_in_time:'2026-04-30T07:52:00Z', punch_out_time:'2026-04-30T15:12:00Z', punch_in_latitude:5.5505, punch_in_longitude:-0.2174, punch_out_latitude:5.5504, punch_out_longitude:-0.2176, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:55, punch_out_distance_meters:42 },
    { teacher_id:T5, school_id:S1, date:'2026-05-01', punch_in_time:'2026-05-01T07:46:00Z', punch_out_time:'2026-05-01T15:09:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2175, punch_out_latitude:5.5502, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:32, punch_out_distance_meters:26 },
    { teacher_id:T5, school_id:S1, date:'2026-05-04', punch_in_time:'2026-05-04T07:53:00Z', punch_out_time:'2026-05-04T15:16:00Z', punch_in_latitude:5.5504, punch_in_longitude:-0.2174, punch_out_latitude:5.5503, punch_out_longitude:-0.2176, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:38, punch_out_distance_meters:44 },
    { teacher_id:T5, school_id:S1, date:'2026-05-05', punch_in_time:'2026-05-05T08:18:00Z', punch_out_time:'2026-05-05T15:11:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2173, punch_out_latitude:5.5504, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:22, punch_out_distance_meters:38 },
    { teacher_id:T5, school_id:S1, date:'2026-05-06', punch_in_time:'2026-05-06T07:47:00Z', punch_out_time:'2026-05-06T15:14:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2174, punch_out_latitude:5.5502, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:30, punch_out_distance_meters:24 },
    { teacher_id:T5, school_id:S1, date:'2026-05-07', punch_in_time:'2026-05-07T07:51:00Z', punch_out_time:'2026-05-07T13:45:00Z', punch_in_latitude:5.5504, punch_in_longitude:-0.2175, punch_out_latitude:5.5503, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:46, punch_out_distance_meters:34 },
    { teacher_id:T5, school_id:S1, date:'2026-05-08', punch_in_time:'2026-05-08T07:49:00Z', punch_out_time:'2026-05-08T15:08:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2174, punch_out_latitude:5.5504, punch_out_longitude:-0.2176, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:28, punch_out_distance_meters:50 },
    // Grace Darko — no Apr30 (sick)
    { teacher_id:T6, school_id:S1, date:'2026-04-27', punch_in_time:'2026-04-27T07:38:00Z', punch_out_time:'2026-04-27T15:05:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2174, punch_out_latitude:5.5502, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:24, punch_out_distance_meters:20 },
    { teacher_id:T6, school_id:S1, date:'2026-04-28', punch_in_time:'2026-04-28T07:40:00Z', punch_out_time:'2026-04-28T15:08:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2173, punch_out_latitude:5.5503, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:16, punch_out_distance_meters:22 },
    { teacher_id:T6, school_id:S1, date:'2026-04-29', punch_in_time:'2026-04-29T07:35:00Z', punch_out_time:'2026-04-29T15:10:00Z', punch_in_latitude:5.5504, punch_in_longitude:-0.2175, punch_out_latitude:5.5502, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:36, punch_out_distance_meters:18 },
    { teacher_id:T6, school_id:S1, date:'2026-05-01', punch_in_time:'2026-05-01T07:42:00Z', punch_out_time:'2026-05-01T15:06:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2175, punch_out_latitude:5.5504, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:28, punch_out_distance_meters:32 },
    { teacher_id:T6, school_id:S1, date:'2026-05-04', punch_in_time:'2026-05-04T07:37:00Z', punch_out_time:'2026-05-04T15:04:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2174, punch_out_latitude:5.5503, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:14, punch_out_distance_meters:26 },
    { teacher_id:T6, school_id:S1, date:'2026-05-05', punch_in_time:'2026-05-05T07:41:00Z', punch_out_time:'2026-05-05T15:09:00Z', punch_in_latitude:5.5501, punch_in_longitude:-0.2173, punch_out_latitude:5.5502, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:20, punch_out_distance_meters:16 },
    { teacher_id:T6, school_id:S1, date:'2026-05-06', punch_in_time:'2026-05-06T07:36:00Z', punch_out_time:'2026-05-06T15:07:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2174, punch_out_latitude:5.5501, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:26, punch_out_distance_meters:18 },
    { teacher_id:T6, school_id:S1, date:'2026-05-07', punch_in_time:'2026-05-07T07:39:00Z', punch_out_time:'2026-05-07T15:05:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2175, punch_out_latitude:5.5503, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:18, punch_out_distance_meters:24 },
    { teacher_id:T6, school_id:S1, date:'2026-05-08', punch_in_time:'2026-05-08T07:43:00Z', punch_out_time:'2026-05-08T15:11:00Z', punch_in_latitude:5.5504, punch_in_longitude:-0.2174, punch_out_latitude:5.5502, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:34, punch_out_distance_meters:20 },
    // Kwame Owusu — no Apr27+May4 (absent)
    { teacher_id:T7, school_id:S1, date:'2026-04-28', punch_in_time:'2026-04-28T07:55:00Z', punch_out_time:'2026-04-28T15:20:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2175, punch_out_latitude:5.5502, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:42, punch_out_distance_meters:28 },
    { teacher_id:T7, school_id:S1, date:'2026-04-29', punch_in_time:'2026-04-29T07:52:00Z', punch_out_time:'2026-04-29T15:17:00Z', punch_in_latitude:5.5504, punch_in_longitude:-0.2174, punch_out_latitude:5.5503, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:36, punch_out_distance_meters:40 },
    { teacher_id:T7, school_id:S1, date:'2026-04-30', punch_in_time:'2026-04-30T07:58:00Z', punch_out_time:'2026-04-30T15:19:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2173, punch_out_latitude:5.5504, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:20, punch_out_distance_meters:36 },
    { teacher_id:T7, school_id:S1, date:'2026-05-01', punch_in_time:'2026-05-01T07:54:00Z', punch_out_time:'2026-05-01T15:15:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2174, punch_out_latitude:5.5502, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:30, punch_out_distance_meters:22 },
    { teacher_id:T7, school_id:S1, date:'2026-05-05', punch_in_time:'2026-05-05T07:56:00Z', punch_out_time:'2026-05-05T15:16:00Z', punch_in_latitude:5.5501, punch_in_longitude:-0.2174, punch_out_latitude:5.5503, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:16, punch_out_distance_meters:34 },
    { teacher_id:T7, school_id:S1, date:'2026-05-06', punch_in_time:'2026-05-06T07:53:00Z', punch_out_time:'2026-05-06T15:18:00Z', punch_in_latitude:5.5502, punch_in_longitude:-0.2175, punch_out_latitude:5.5501, punch_out_longitude:-0.2174, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:22, punch_out_distance_meters:18 },
    { teacher_id:T7, school_id:S1, date:'2026-05-07', punch_in_time:'2026-05-07T07:57:00Z', punch_out_time:'2026-05-07T15:14:00Z', punch_in_latitude:5.5504, punch_in_longitude:-0.2173, punch_out_latitude:5.5502, punch_out_longitude:-0.2175, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:46, punch_out_distance_meters:28 },
    { teacher_id:T7, school_id:S1, date:'2026-05-08', punch_in_time:'2026-05-08T07:55:00Z', punch_out_time:'2026-05-08T15:17:00Z', punch_in_latitude:5.5503, punch_in_longitude:-0.2174, punch_out_latitude:5.5504, punch_out_longitude:-0.2173, punch_in_verified:true, punch_out_verified:true, punch_in_distance_meters:32, punch_out_distance_meters:44 },
  ], 'teacher_id,date');

  // ── 07 LEAVE TYPES ───────────────────────────────────────────
  console.log('\n[07] Leave types');
  await upsert('leave_types', [
    { id:'d0000000-0000-0000-0000-000000000001', school_id:null, name:'Annual Leave',    description:'Standard annual leave entitlement', days_allowed:10, requires_documentation:false, is_paid:true,  color:'#3B82F6', is_active:true },
    { id:'d0000000-0000-0000-0000-000000000002', school_id:null, name:'Sick Leave',      description:'Medical leave',                     days_allowed:5,  requires_documentation:false, is_paid:true,  color:'#EF4444', is_active:true },
    { id:'d0000000-0000-0000-0000-000000000003', school_id:null, name:'Maternity Leave', description:'Paid maternity leave',               days_allowed:84, requires_documentation:true,  is_paid:true,  color:'#EC4899', is_active:true },
    { id:'d0000000-0000-0000-0000-000000000004', school_id:null, name:'Study Leave',     description:'Unpaid professional development',    days_allowed:5,  requires_documentation:true,  is_paid:false, color:'#8B5CF6', is_active:true },
  ], 'id');

  // ── 07 LEAVE REQUESTS ────────────────────────────────────────
  console.log('\n[07] Leave requests');
  await upsert('leave_requests', [
    { id:'e0000000-0000-0000-0000-000000000001', school_id:S1, teacher_id:T6, teacher_name:'Grace Darko',      leave_type_id:'d0000000-0000-0000-0000-000000000002', leave_type_name:'Sick Leave',    start_date:'2026-05-13', end_date:'2026-05-14', total_days:2, reason:'Recurring fever and headache.', status:'pending' },
    { id:'e0000000-0000-0000-0000-000000000002', school_id:S1, teacher_id:T5, teacher_name:'Emmanuel Boateng', leave_type_id:'d0000000-0000-0000-0000-000000000001', leave_type_name:'Annual Leave',  start_date:'2026-05-20', end_date:'2026-05-22', total_days:3, reason:"Family travel — aunt's traditional marriage ceremony.", status:'pending' },
    { id:'e0000000-0000-0000-0000-000000000003', school_id:S1, teacher_id:DT, teacher_name:'Demo Teacher',     leave_type_id:'d0000000-0000-0000-0000-000000000001', leave_type_name:'Annual Leave',  start_date:'2026-04-07', end_date:'2026-04-09', total_days:3, reason:'Easter family travel.', status:'approved', reviewed_by:'41370924-e180-4985-b0d5-e618c2a35e9e', reviewed_by_name:'School Admin', reviewed_at:'2026-04-03T10:00:00Z', review_notes:'Approved. Ensure lesson notes are left for substitute.' },
    { id:'e0000000-0000-0000-0000-000000000004', school_id:S1, teacher_id:T4, teacher_name:'Akosua Mensah',    leave_type_id:'d0000000-0000-0000-0000-000000000002', leave_type_name:'Sick Leave',    start_date:'2026-03-10', end_date:'2026-03-10', total_days:1, reason:'Sudden illness.', status:'approved', reviewed_by:'41370924-e180-4985-b0d5-e618c2a35e9e', reviewed_by_name:'School Admin', reviewed_at:'2026-03-10T08:30:00Z', review_notes:'Approved. Get well soon.' },
    { id:'e0000000-0000-0000-0000-000000000005', school_id:S1, teacher_id:T7, teacher_name:'Kwame Owusu',      leave_type_id:'d0000000-0000-0000-0000-000000000004', leave_type_name:'Study Leave',   start_date:'2026-05-18', end_date:'2026-05-22', total_days:5, reason:'Social Studies curriculum workshop.', status:'rejected', reviewed_by:'41370924-e180-4985-b0d5-e618c2a35e9e', reviewed_by_name:'School Admin', reviewed_at:'2026-05-08T14:00:00Z', review_notes:'Rejected — exam period. Reapply after term ends.' },
  ], 'id');

  // ── 07 LEAVE BALANCES ────────────────────────────────────────
  console.log('\n[07] Leave balances');
  await upsert('leave_balances', [
    { school_id:S1, teacher_id:DT, leave_type_id:'d0000000-0000-0000-0000-000000000001', year:2026, total_days:10, used_days:3, remaining_days:7 },
    { school_id:S1, teacher_id:DT, leave_type_id:'d0000000-0000-0000-0000-000000000002', year:2026, total_days:5,  used_days:0, remaining_days:5 },
    { school_id:S1, teacher_id:T4, leave_type_id:'d0000000-0000-0000-0000-000000000001', year:2026, total_days:10, used_days:0, remaining_days:10 },
    { school_id:S1, teacher_id:T4, leave_type_id:'d0000000-0000-0000-0000-000000000002', year:2026, total_days:5,  used_days:1, remaining_days:4 },
    { school_id:S1, teacher_id:T5, leave_type_id:'d0000000-0000-0000-0000-000000000001', year:2026, total_days:10, used_days:0, remaining_days:10 },
    { school_id:S1, teacher_id:T5, leave_type_id:'d0000000-0000-0000-0000-000000000002', year:2026, total_days:5,  used_days:0, remaining_days:5 },
    { school_id:S1, teacher_id:T6, leave_type_id:'d0000000-0000-0000-0000-000000000001', year:2026, total_days:10, used_days:0, remaining_days:10 },
    { school_id:S1, teacher_id:T6, leave_type_id:'d0000000-0000-0000-0000-000000000002', year:2026, total_days:5,  used_days:1, remaining_days:4 },
    { school_id:S1, teacher_id:T7, leave_type_id:'d0000000-0000-0000-0000-000000000001', year:2026, total_days:10, used_days:0, remaining_days:10 },
    { school_id:S1, teacher_id:T7, leave_type_id:'d0000000-0000-0000-0000-000000000002', year:2026, total_days:5,  used_days:0, remaining_days:5 },
  ], 'school_id,teacher_id,leave_type_id,year');

  // ── 08 QUESTIONS ─────────────────────────────────────────────
  console.log('\n[08] Questions');
  const SA = 'c7730aab-5b4e-4ad8-8c85-1081b2abb054';
  await upsert('questions', [
    { id:'2a000000-0000-0000-0000-000000000001', created_by:SA, question_text:'What is 24 × 5?',                                                           question_type:'multiple_choice', difficulty:'medium', marks:2, curriculum_type:'NaCCA', subject:'Mathematics',     grade_level:'Primary 4', strand:'Number',       sub_strand:'Multiplication',       explanation:'24 × 5 = 120',                                              is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000002', created_by:SA, question_text:'What is the perimeter of a square with side length 6 cm?',                  question_type:'multiple_choice', difficulty:'medium', marks:2, curriculum_type:'NaCCA', subject:'Mathematics',     grade_level:'Primary 4', strand:'Geometry',     sub_strand:'Perimeter',            explanation:'Perimeter = 4 × 6 = 24 cm',                                 is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000003', created_by:SA, question_text:'The product of any number and zero is always zero.',                        question_type:'true_false',      difficulty:'easy',   marks:1, curriculum_type:'NaCCA', subject:'Mathematics',     grade_level:'Primary 4', strand:'Number',       sub_strand:'Properties of Operations',explanation:'Any number × 0 = 0',                                        is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000004', created_by:SA, question_text:'Which fraction is larger: 3/4 or 2/3?',                                     question_type:'multiple_choice', difficulty:'medium', marks:2, curriculum_type:'NaCCA', subject:'Mathematics',     grade_level:'Primary 5', strand:'Number',       sub_strand:'Fractions',            explanation:'3/4=9/12, 2/3=8/12, so 3/4 is larger',                     is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000005', created_by:SA, question_text:'What is 156 ÷ 12?',                                                         question_type:'multiple_choice', difficulty:'medium', marks:2, curriculum_type:'NaCCA', subject:'Mathematics',     grade_level:'Primary 5', strand:'Number',       sub_strand:'Division',             explanation:'156 ÷ 12 = 13',                                             is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000006', created_by:SA, question_text:'The sum of angles in any triangle is 180°.',                                question_type:'true_false',      difficulty:'easy',   marks:1, curriculum_type:'NaCCA', subject:'Mathematics',     grade_level:'Primary 5', strand:'Geometry',     sub_strand:'Angles',               explanation:'Interior angles of a triangle always sum to 180°',          is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000007', created_by:SA, question_text:'What is the area of a rectangle 8 cm long and 5 cm wide?',                  question_type:'multiple_choice', difficulty:'easy',   marks:2, curriculum_type:'NaCCA', subject:'Mathematics',     grade_level:'JHS 1',     strand:'Geometry',     sub_strand:'Area',                 explanation:'Area = 8 × 5 = 40 cm²',                                     is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000008', created_by:SA, question_text:'What is 15% of 200?',                                                       question_type:'multiple_choice', difficulty:'medium', marks:2, curriculum_type:'NaCCA', subject:'Mathematics',     grade_level:'JHS 1',     strand:'Number',       sub_strand:'Percentages',          explanation:'15/100 × 200 = 30',                                         is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000009', created_by:SA, question_text:'Which of the following words is a noun?',                                   question_type:'multiple_choice', difficulty:'easy',   marks:1, curriculum_type:'NaCCA', subject:'English Language',grade_level:'Primary 3', strand:'Grammar',      sub_strand:'Parts of Speech',      explanation:'"Teacher" is a noun — it names a person',                   is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000010', created_by:SA, question_text:'Which word is a synonym for "happy"?',                                      question_type:'multiple_choice', difficulty:'easy',   marks:1, curriculum_type:'NaCCA', subject:'English Language',grade_level:'Primary 3', strand:'Vocabulary',   sub_strand:'Synonyms',             explanation:'"Joyful" means the same as "happy"',                        is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000011', created_by:SA, question_text:'An adjective is a word that describes a noun.',                             question_type:'true_false',      difficulty:'easy',   marks:1, curriculum_type:'NaCCA', subject:'English Language',grade_level:'Primary 3', strand:'Grammar',      sub_strand:'Parts of Speech',      explanation:'Adjectives modify or describe nouns',                       is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000012', created_by:SA, question_text:'Choose the correct verb tense: "Yesterday, she ___ to school."',            question_type:'multiple_choice', difficulty:'medium', marks:2, curriculum_type:'NaCCA', subject:'English Language',grade_level:'JHS 1',     strand:'Grammar',      sub_strand:'Verb Tenses',          explanation:'"Yesterday" signals past tense — "went" is correct',        is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000013', created_by:SA, question_text:'Which sentence uses correct punctuation?',                                  question_type:'multiple_choice', difficulty:'medium', marks:2, curriculum_type:'NaCCA', subject:'English Language',grade_level:'JHS 1',     strand:'Writing',      sub_strand:'Punctuation',          explanation:'A question starts with capital letter and ends with ?',    is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000014', created_by:SA, question_text:'Every complete sentence must have a subject and a predicate.',              question_type:'true_false',      difficulty:'easy',   marks:1, curriculum_type:'NaCCA', subject:'English Language',grade_level:'JHS 1',     strand:'Grammar',      sub_strand:'Sentence Structure',   explanation:'Subject + predicate = complete sentence',                   is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000015', created_by:SA, question_text:'What is the plural of "child"?',                                            question_type:'multiple_choice', difficulty:'easy',   marks:1, curriculum_type:'NaCCA', subject:'English Language',grade_level:'JHS 1',     strand:'Grammar',      sub_strand:'Plurals',              explanation:'"Child" is irregular — plural is "children"',               is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000016', created_by:SA, question_text:'Which gas do plants absorb during photosynthesis?',                         question_type:'multiple_choice', difficulty:'medium', marks:2, curriculum_type:'NaCCA', subject:'Science',         grade_level:'Primary 4', strand:'Life Science', sub_strand:'Photosynthesis',        explanation:'Plants absorb CO₂ and release O₂',                          is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000017', created_by:SA, question_text:'Which of the following animals is a mammal?',                               question_type:'multiple_choice', difficulty:'easy',   marks:1, curriculum_type:'NaCCA', subject:'Science',         grade_level:'Primary 4', strand:'Life Science', sub_strand:'Classification',        explanation:'Bats are warm-blooded mammals',                             is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000018', created_by:SA, question_text:'The sun is a planet.',                                                      question_type:'true_false',      difficulty:'easy',   marks:1, curriculum_type:'NaCCA', subject:'Science',         grade_level:'Primary 4', strand:'Earth Science',sub_strand:'Solar System',          explanation:'The sun is a STAR, not a planet',                           is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000019', created_by:SA, question_text:'Which organ in the human body pumps blood through the circulatory system?', question_type:'multiple_choice', difficulty:'easy',   marks:1, curriculum_type:'NaCCA', subject:'Science',         grade_level:'Primary 5', strand:'Life Science', sub_strand:'Human Body',            explanation:'The heart pumps blood throughout the body',                 is_approved:true },
    { id:'2a000000-0000-0000-0000-000000000020', created_by:SA, question_text:'At what temperature does water boil at sea level?',                        question_type:'multiple_choice', difficulty:'easy',   marks:1, curriculum_type:'NaCCA', subject:'Science',         grade_level:'Primary 5', strand:'Physical Science',sub_strand:'States of Matter',   explanation:'Water boils at 100°C at standard atmospheric pressure',     is_approved:true },
  ], 'id');

  // ── 08 QUESTION OPTIONS ──────────────────────────────────────
  console.log('\n[08] Question options');
  // Delete existing options first to avoid duplicates on re-run
  const qids = Array.from({length:20},(_,i)=>`2a000000-0000-0000-0000-${String(i+1).padStart(12,'0')}`);
  await sb.from('question_options').delete().in('question_id', qids);

  const opts = [
    ['2a000000-0000-0000-0000-000000000001',[['120',true],['96',false],['110',false],['108',false]]],
    ['2a000000-0000-0000-0000-000000000002',[['24 cm',true],['12 cm',false],['36 cm',false],['18 cm',false]]],
    ['2a000000-0000-0000-0000-000000000003',[['True',true],['False',false]]],
    ['2a000000-0000-0000-0000-000000000004',[['3/4',true],['2/3',false],['They are equal',false],['Cannot be compared',false]]],
    ['2a000000-0000-0000-0000-000000000005',[['13',true],['12',false],['14',false],['15',false]]],
    ['2a000000-0000-0000-0000-000000000006',[['True',true],['False',false]]],
    ['2a000000-0000-0000-0000-000000000007',[['40 cm²',true],['26 cm²',false],['13 cm²',false],['80 cm²',false]]],
    ['2a000000-0000-0000-0000-000000000008',[['30',true],['25',false],['35',false],['20',false]]],
    ['2a000000-0000-0000-0000-000000000009',[['run',false],['beautiful',false],['teacher',true],['quickly',false]]],
    ['2a000000-0000-0000-0000-000000000010',[['sad',false],['joyful',true],['angry',false],['tired',false]]],
    ['2a000000-0000-0000-0000-000000000011',[['True',true],['False',false]]],
    ['2a000000-0000-0000-0000-000000000012',[['go',false],['went',true],['goes',false],['going',false]]],
    ['2a000000-0000-0000-0000-000000000013',[['where are you going.',false],['Where are you going?',true],['where are you going?',false],['Where are you going.',false]]],
    ['2a000000-0000-0000-0000-000000000014',[['True',true],['False',false]]],
    ['2a000000-0000-0000-0000-000000000015',[['childs',false],['childes',false],['children',true],['childrens',false]]],
    ['2a000000-0000-0000-0000-000000000016',[['Oxygen',false],['Carbon dioxide',true],['Nitrogen',false],['Hydrogen',false]]],
    ['2a000000-0000-0000-0000-000000000017',[['Snake',false],['Frog',false],['Bat',true],['Eagle',false]]],
    ['2a000000-0000-0000-0000-000000000018',[['True',false],['False',true]]],
    ['2a000000-0000-0000-0000-000000000019',[['Liver',false],['Lungs',false],['Kidney',false],['Heart',true]]],
    ['2a000000-0000-0000-0000-000000000020',[['90°C',false],['100°C',true],['110°C',false],['80°C',false]]],
  ];
  const allOpts = opts.flatMap(([qid, choices]) =>
    choices.map(([text, correct], i) => ({ question_id:qid, option_text:text, is_correct:correct, option_order:i }))
  );
  const { error: optErr } = await sb.from('question_options').insert(allOpts);
  if (optErr) console.error('  ✗ question_options:', optErr.message);
  else console.log(`  ✓ question_options (${allOpts.length} rows)`);

  // ── 08 TEST PAPERS ───────────────────────────────────────────
  console.log('\n[08] Test papers');
  await upsert('test_papers', [
    { id:'3a000000-0000-0000-0000-000000000001', created_by:T6, title:'Primary 5 Mathematics Mid-Term Test', description:'Covers fractions, division, percentages, and geometry.', subject:'Mathematics',     grade_level:'Primary 5', curriculum_type:'NaCCA', duration_minutes:40, total_marks:10, school_name:'Ananse Academy', term:'Third Term', academic_year:'2025/2026', instructions:'Answer ALL questions. Show working where required.', is_published:true, publish_mode:'selected' },
    { id:'3a000000-0000-0000-0000-000000000002', created_by:T7, title:'JHS 1 English Language End of Term Exam', description:'Covers grammar, vocabulary, and punctuation.', subject:'English Language', grade_level:'JHS 1',     curriculum_type:'NaCCA', duration_minutes:60, total_marks:8,  school_name:'Ananse Academy', term:'Third Term', academic_year:'2025/2026', instructions:'Answer ALL questions. Choose the BEST answer.', is_published:true, publish_mode:'selected' },
  ], 'id');

  // Test paper questions
  await sb.from('test_paper_questions').delete().in('test_paper_id', ['3a000000-0000-0000-0000-000000000001','3a000000-0000-0000-0000-000000000002']);
  const { error: tpqErr } = await sb.from('test_paper_questions').insert([
    { test_paper_id:'3a000000-0000-0000-0000-000000000001', question_id:'2a000000-0000-0000-0000-000000000004', question_order:1 },
    { test_paper_id:'3a000000-0000-0000-0000-000000000001', question_id:'2a000000-0000-0000-0000-000000000005', question_order:2 },
    { test_paper_id:'3a000000-0000-0000-0000-000000000001', question_id:'2a000000-0000-0000-0000-000000000006', question_order:3 },
    { test_paper_id:'3a000000-0000-0000-0000-000000000001', question_id:'2a000000-0000-0000-0000-000000000007', question_order:4 },
    { test_paper_id:'3a000000-0000-0000-0000-000000000001', question_id:'2a000000-0000-0000-0000-000000000008', question_order:5 },
    { test_paper_id:'3a000000-0000-0000-0000-000000000002', question_id:'2a000000-0000-0000-0000-000000000009', question_order:1 },
    { test_paper_id:'3a000000-0000-0000-0000-000000000002', question_id:'2a000000-0000-0000-0000-000000000012', question_order:2 },
    { test_paper_id:'3a000000-0000-0000-0000-000000000002', question_id:'2a000000-0000-0000-0000-000000000013', question_order:3 },
    { test_paper_id:'3a000000-0000-0000-0000-000000000002', question_id:'2a000000-0000-0000-0000-000000000014', question_order:4 },
    { test_paper_id:'3a000000-0000-0000-0000-000000000002', question_id:'2a000000-0000-0000-0000-000000000015', question_order:5 },
  ]);
  if (tpqErr) console.error('  ✗ test_paper_questions:', tpqErr.message);
  else console.log('  ✓ test_paper_questions (10 rows)');

  // ── 09 BILLING ───────────────────────────────────────────────
  console.log('\n[09] Billing');
  const lineItems = [
    {id:'1',name:'School Fees',amount:800,isOptional:false},
    {id:'2',name:'PTA Levies',amount:50,isOptional:false},
    {id:'3',name:'Library Levy',amount:20,isOptional:false},
    {id:'4',name:'Sports Fund',amount:30,isOptional:true},
  ];
  const schDisc = [{id:'disc1',discount_type_id:'4a000000-0000-0000-0000-000000000001',discount_name:'Scholarship Discount',discount_value:20,is_percentage:true}];

  await upsert('discount_types', [
    { id:'4a000000-0000-0000-0000-000000000001', school_id:S1, name:'Scholarship Discount', description:'Applied to scholarship programme students', discount_type:'percentage', default_value:20 },
  ], 'id');

  await upsert('student_bills', [
    { id:'5a000000-0000-0000-0000-000000000001', bill_code:'BL-ANANSE-001', school_id:S1, student_id:'c1000000-0000-0000-0000-000000000001', student_name:'Kwame Mensah',   class_id:'KG 1',    class_name:'KG 1',    term:'Third Term', academic_year:'2025/2026', line_items:lineItems, subtotal:900, discounts:[], total_discount:0,   previous_balance:0, total_amount:900, amount_paid:0,   balance:900, status:'pending',  due_date:'2026-05-30', sent_via_whatsapp:false },
    { id:'5a000000-0000-0000-0000-000000000002', bill_code:'BL-ANANSE-002', school_id:S1, student_id:'c1000000-0000-0000-0000-000000000004', student_name:'Akua Owusu',     class_id:'KG 2',    class_name:'KG 2',    term:'Third Term', academic_year:'2025/2026', line_items:lineItems, subtotal:900, discounts:[], total_discount:0,   previous_balance:0, total_amount:900, amount_paid:0,   balance:900, status:'pending',  due_date:'2026-05-30', sent_via_whatsapp:false },
    { id:'5a000000-0000-0000-0000-000000000003', bill_code:'BL-ANANSE-003', school_id:S1, student_id:'c1000000-0000-0000-0000-000000000007', student_name:'Emmanuel Appiah',class_id:'Primary 1',class_name:'Primary 1',term:'Third Term', academic_year:'2025/2026', line_items:lineItems, subtotal:900, discounts:[], total_discount:0,   previous_balance:0, total_amount:900, amount_paid:500, balance:400, status:'partial',  due_date:'2026-05-30', sent_via_whatsapp:true  },
    { id:'5a000000-0000-0000-0000-000000000004', bill_code:'BL-ANANSE-004', school_id:S1, student_id:'c1000000-0000-0000-0000-000000000013', student_name:'Kweku Asare',    class_id:'Primary 3',class_name:'Primary 3',term:'Third Term', academic_year:'2025/2026', line_items:lineItems, subtotal:900, discounts:[], total_discount:0,   previous_balance:0, total_amount:900, amount_paid:0,   balance:900, status:'pending',  due_date:'2026-05-30', sent_via_whatsapp:false },
    { id:'5a000000-0000-0000-0000-000000000005', bill_code:'BL-ANANSE-005', school_id:S1, student_id:'c1000000-0000-0000-0000-000000000016', student_name:'Maame Adomako',  class_id:'Primary 4',class_name:'Primary 4',term:'Third Term', academic_year:'2025/2026', line_items:lineItems, subtotal:900, discounts:[], total_discount:0,   previous_balance:0, total_amount:900, amount_paid:900, balance:0,   status:'paid',     due_date:'2026-05-30', sent_via_whatsapp:true  },
    { id:'5a000000-0000-0000-0000-000000000006', bill_code:'BL-ANANSE-006', school_id:S1, student_id:'c1000000-0000-0000-0000-000000000019', student_name:'Bernard Mensah', class_id:'Primary 5',class_name:'Primary 5',term:'Third Term', academic_year:'2025/2026', line_items:lineItems, subtotal:900, discounts:[], total_discount:0,   previous_balance:0, total_amount:900, amount_paid:900, balance:0,   status:'paid',     due_date:'2026-05-30', sent_via_whatsapp:true  },
    { id:'5a000000-0000-0000-0000-000000000007', bill_code:'BL-ANANSE-007', school_id:S1, student_id:'c1000000-0000-0000-0000-000000000022', student_name:'Naomi Owusu',    class_id:'Primary 6',class_name:'Primary 6',term:'Third Term', academic_year:'2025/2026', line_items:lineItems, subtotal:900, discounts:schDisc, total_discount:160, previous_balance:0, total_amount:740, amount_paid:600, balance:140, status:'partial',  due_date:'2026-05-30', sent_via_whatsapp:true  },
    { id:'5a000000-0000-0000-0000-000000000008', bill_code:'BL-ANANSE-008', school_id:S1, student_id:'c1000000-0000-0000-0000-000000000025', student_name:'Kojo Appiah',    class_id:'JHS 1',   class_name:'JHS 1',   term:'Third Term', academic_year:'2025/2026', line_items:lineItems, subtotal:900, discounts:[], total_discount:0,   previous_balance:0, total_amount:900, amount_paid:900, balance:0,   status:'paid',     due_date:'2026-05-30', sent_via_whatsapp:true  },
    { id:'5a000000-0000-0000-0000-000000000009', bill_code:'BL-ANANSE-009', school_id:S1, student_id:'c1000000-0000-0000-0000-000000000028', student_name:'Akwasi Darko',   class_id:'JHS 2',   class_name:'JHS 2',   term:'Third Term', academic_year:'2025/2026', line_items:lineItems, subtotal:900, discounts:[], total_discount:0,   previous_balance:0, total_amount:900, amount_paid:900, balance:0,   status:'paid',     due_date:'2026-05-30', sent_via_whatsapp:true  },
    { id:'5a000000-0000-0000-0000-000000000010', bill_code:'BL-ANANSE-010', school_id:S1, student_id:'c1000000-0000-0000-0000-000000000031', student_name:'Thomas Kusi',    class_id:'JHS 3',   class_name:'JHS 3',   term:'Third Term', academic_year:'2025/2026', line_items:lineItems, subtotal:900, discounts:[], total_discount:0,   previous_balance:0, total_amount:900, amount_paid:0,   balance:900, status:'overdue',  due_date:'2026-04-30', sent_via_whatsapp:false },
  ], 'bill_code');

  await upsert('fee_payments', [
    { id:'6a000000-0000-0000-0000-000000000001', bill_id:'5a000000-0000-0000-0000-000000000003', student_id:'c1000000-0000-0000-0000-000000000007', amount:500, payment_method:'momo', payment_status:'success', receipt_number:'RCP-2026-001', receipt_sent:true, payment_date:'2026-05-01', notes:'Partial payment via MTN MoMo' },
    { id:'6a000000-0000-0000-0000-000000000002', bill_id:'5a000000-0000-0000-0000-000000000005', student_id:'c1000000-0000-0000-0000-000000000016', amount:900, payment_method:'momo', payment_status:'success', receipt_number:'RCP-2026-002', receipt_sent:true, payment_date:'2026-04-25', notes:'Full payment via MTN MoMo' },
    { id:'6a000000-0000-0000-0000-000000000003', bill_id:'5a000000-0000-0000-0000-000000000006', student_id:'c1000000-0000-0000-0000-000000000019', amount:900, payment_method:'cash', payment_status:'success', receipt_number:'RCP-2026-003', receipt_sent:true, payment_date:'2026-04-22', notes:'Full payment — cash at school office' },
    { id:'6a000000-0000-0000-0000-000000000004', bill_id:'5a000000-0000-0000-0000-000000000007', student_id:'c1000000-0000-0000-0000-000000000022', amount:600, payment_method:'bank', payment_status:'success', receipt_number:'RCP-2026-004', receipt_sent:true, payment_date:'2026-04-29', notes:'Bank transfer — scholarship applied' },
    { id:'6a000000-0000-0000-0000-000000000005', bill_id:'5a000000-0000-0000-0000-000000000008', student_id:'c1000000-0000-0000-0000-000000000025', amount:900, payment_method:'momo', payment_status:'success', receipt_number:'RCP-2026-005', receipt_sent:true, payment_date:'2026-04-28', notes:'Full payment via Vodafone Cash' },
    { id:'6a000000-0000-0000-0000-000000000006', bill_id:'5a000000-0000-0000-0000-000000000009', student_id:'c1000000-0000-0000-0000-000000000028', amount:900, payment_method:'momo', payment_status:'success', receipt_number:'RCP-2026-006', receipt_sent:true, payment_date:'2026-05-03', notes:'Full payment via MTN MoMo' },
  ], 'id');

  console.log('\n✅ Seed complete.');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
