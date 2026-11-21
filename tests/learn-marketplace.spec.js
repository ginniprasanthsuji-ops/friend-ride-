import { test, expect } from '@playwright/test';

test('Learn tab is injected and opens Lakshya Setu', async ({ page }) => {
  const errors=[]; const consoleErrors=[]; const failedRequests=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if(m.type()==='error')consoleErrors.push(m.text());});
  page.on('requestfailed', r=>failedRequests.push(r.url()+': '+r.failure()?.errorText));
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  console.log('QA DIAGNOSTICS',JSON.stringify({learnScript:await page.locator('script[src*="learn-teach.js"]').count(),learnSection:await page.locator('#learn').count(),navButtons:await page.locator('.premium-bottom button').evaluateAll(bs=>bs.map(b=>b.dataset.page)),pageErrors:errors,consoleErrors,failedRequests}));
  const learnNav=page.locator('.premium-bottom [data-page="learn"]');
  await expect(learnNav).toBeVisible({timeout:10000});
  await learnNav.click();
  await expect(page.locator('#learn')).toBeVisible();
  await expect(page.locator('#learn')).toContainText('LAKSHYA SETU');
  await expect(page.locator('#frLearnStudentPanel')).toBeVisible();
  await page.getByRole('button', {name:/Teacher \/ Teach/}).click();
  await expect(page.locator('#frLearnTeacherPanel')).toBeVisible();
  expect(errors, 'Unexpected page JavaScript errors').toEqual([]);
});

test('Student and teacher registration controls exist', async ({ page }) => {
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await expect(page.locator('.premium-bottom [data-page="learn"]')).toBeVisible({timeout:10000});
  await page.locator('.premium-bottom [data-page="learn"]').click();
  await expect(page.locator('#frLearnStudentPanel button')).toHaveCount(2);
  await page.getByRole('button', {name:/Teacher \/ Teach/}).click();
  await expect(page.locator('#frLearnTeacherPanel select').first()).toBeVisible();
  await expect(page.locator('#frLearnTeacherPanel select')).toHaveCount(5);
  await expect(page.locator('#frLearnTeacherPanel')).toContainText('Teacher Registration');
});


test('Existing FRIEND RIDE page navigation smoke regression', async ({ page }) => {
  await page.goto('/', {waitUntil:'domcontentloaded'});
  const pages=['home','shops','food','marketCart','explore','orders'];
  for (const id of pages) {
    await page.evaluate(id => window.showPage(id), id);
    await expect(page.locator('#'+id)).toHaveClass(/active/);
    await expect(page.locator('#'+id)).toBeVisible();
  }
  await page.locator('.premium-bottom [data-page="menu"]').click();
  await expect(page.locator('#drawerBackdrop')).toHaveClass(/show/);
});


test('Learn & Teach SQL migrations include RLS and owner-update transition guards', async () => {
  const { readFile } = await import('node:fs/promises');
  const base = process.cwd();
  const core = await readFile(base + '/supabase/migrations/20261121090000_learn_teach_marketplace.sql', 'utf8');
  const onePerson = await readFile(base + '/supabase/migrations/20261121110000_one_person_coaching_center.sql', 'utf8');
  const eligibility = await readFile(base + '/supabase/migrations/20261121120000_teacher_eligibility_tiers.sql', 'utf8');
  const hardening = await readFile(base + '/supabase/migrations/20261121130000_learn_teach_owner_update_hardening.sql', 'utf8');
  expect(core).toContain('enable row level security');
  expect(core).toContain("approval_status='approved'");
  expect(core).toContain("status='pending_payment'");
  expect(onePerson).toContain("center_type in ('multi_teacher','one_person')");
  expect(onePerson).toContain('teacher_count = 1');
  expect(onePerson).toContain('daily_hours between 4 and 5');
  expect(eligibility).toContain("owner_eligibility='10th' and owner_teach_up_to in ('6')");
  expect(eligibility).toContain("owner_eligibility='bed' and owner_teach_up_to='subject'");
  expect(hardening).toContain('Enrollment identity, course, fee, and creation time are immutable');
  expect(hardening).toContain('Student may only cancel a pending-payment enrollment');
  expect(hardening).toContain('Student may only cancel an open tuition request');
  expect(hardening).toContain('Request owner may only accept or reject a pending application');
  expect(hardening).toContain("auth.role() = 'service_role'");
  expect(hardening).toContain('fr_learn_teacher_profiles_teaching_range_check');
  expect(hardening).toContain("eligibility_level = '10th' and teach_up_to = '6'");
  expect(hardening).toContain("eligibility_level = 'bed' and teach_up_to = 'subject'");
});


test('Zoom classroom UI appears for student and teacher roles', async ({ page }) => {
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.premium-bottom [data-page="learn"]')).toBeVisible({timeout:10000});
 await page.locator('.premium-bottom [data-page="learn"]').click();
 await expect(page.locator('#frLearnZoomSessions')).toBeVisible();
 await expect(page.locator('#frLearnZoomSessions')).toContainText('90-minute sessions');
 await page.getByRole('button',{name:/Teacher \/ Teach/}).click();
 await expect(page.locator('#frLearnZoomSchedule')).toBeVisible();
 await expect(page.locator('#frZoomEnrollment')).toBeVisible();
 await expect(page.locator('#frZoomEnrollment')).toHaveAttribute('id','frZoomEnrollment');
 await expect(page.locator('#frZoomStart')).toBeVisible();
});

test('Zoom session migration enforces participant RLS and server-only meeting creation', async () => {
 const {readFile}=await import('node:fs/promises'); const base=process.cwd();
 const sql=await readFile(base+'/supabase/migrations/20261121140000_zoom_class_sessions.sql','utf8');
 const hard=await readFile(base+'/supabase/migrations/20261121150000_zoom_session_update_hardening.sql','utf8');
 const fn=await readFile(base+'/supabase/functions/create-zoom-meeting/index.ts','utf8');
 expect(sql).toContain('enable row level security');
 expect(sql).toContain('learn_sessions_participant_select');
 expect(sql).toContain('duration_minutes int not null default 90 check(duration_minutes=90)');
 expect(hard).toContain('drop policy if exists learn_sessions_participant_update');
 expect(hard).toContain('learn_sessions_admin_update');
 const classroom=await readFile(base+'/supabase/migrations/20261121160000_reusable_zoom_classrooms.sql','utf8');
 expect(classroom).toContain('unique(teacher_id, student_id, course_id)');
 expect(classroom).toContain('drop column if exists zoom_start_url');
 expect(fn).toContain('ZOOM_CLIENT_SECRET');
 expect(fn).toContain('waiting_room:true');
 expect(fn).toContain('type:3');
 expect(fn).toContain('ZOOM_HOST_USER');
 expect(fn).toContain('Active student enrollment required');
 expect(fn).toContain('Approved teacher required');
});
