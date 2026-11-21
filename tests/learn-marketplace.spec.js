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

test('External classroom workflow validates link, enrollment and confirmation', async()=>{
 const {readFile}=await import('node:fs/promises');const base=process.cwd();
 const migration=await readFile(base+'/supabase/migrations/20261121190000_simple_external_classroom_links.sql','utf8');
 const homeworkMigration=await readFile(base+'/supabase/migrations/20261121200000_student_homework_checklist_teacher_approval.sql','utf8');
 const homeworkPolicy=await readFile(base+'/supabase/migrations/20261121210000_homework_student_confirm_policy_fix.sql','utf8');
 const fn=await readFile(base+'/supabase/functions/create-external-classroom-session/index.ts','utf8');
 const confirmFn=await readFile(base+'/supabase/functions/confirm-zoom-session/index.ts','utf8');
 const linkFn=await readFile(base+'/supabase/functions/get-zoom-classroom-link/index.ts','utf8');
 const ui=await readFile(base+'/learn-teach.js','utf8');
 expect(migration).toContain('external_classroom_url');
 expect(fn).toContain('Only HTTP/HTTPS classroom links are accepted');
 expect(fn).toContain('Active student enrollment required');
 expect(fn).toContain('Approved teacher required');
 expect(fn).toContain('status:"pending_confirmation"');
 expect(confirmFn).toContain('Only the enrolled student can confirm this class time');
 expect(linkFn).toContain('Student confirmation required before joining');
 expect(linkFn).toContain('Classroom participant access required');
 expect(linkFn).toContain('Teacher homework approval required before joining');
 expect(homeworkMigration).toContain('fr_learn_homework');
 expect(homeworkMigration).toContain('teacher_approved');
 expect(homeworkPolicy).toContain('student_confirmed=true and teacher_approved=false');
 expect(ui).toContain('create-external-classroom-session');
 expect(ui).toContain('frZoomExternalLink');
 expect(ui).toContain('frLearnSubmitHomework');
 expect(ui).toContain('frLearnApproveHomework');
 expect(ui).toContain('frLearnEnableHourlyReminder');
 expect(ui).toContain('SpeechSynthesisUtterance');
 expect(ui).toContain('Homework approved');
 expect(ui).not.toContain('create-zoom-meeting');
});

test('Classroom workflow uses simple external link, no Zoom OAuth secrets', async ({page})=>{
 const js=await (await page.request.get('/learn-teach.js')).text();
 expect(js).toContain('frZoomExternalLink');
 expect(js).toContain('create-external-classroom-session');
 expect(js).toContain('Join Online Classroom');
 expect(js).not.toContain('create-zoom-meeting');
});

test('Homework approval field guard and Telugu hourly reminder regression', async()=>{
 const {readFile}=await import('node:fs/promises');const base=process.cwd();
 const guard=await readFile(base+'/supabase/migrations/20261121220000_homework_update_field_guard.sql','utf8');
 const roleFix=await readFile(base+'/supabase/migrations/20261121230000_homework_update_guard_service_role_allow.sql','utf8');
 const ui=await readFile(base+'/learn-teach.js','utf8');
 expect(guard).toContain('Student may only update homework checklist and confirmation fields');
 expect(guard).toContain('Teacher may only update approval and feedback fields');
 expect(roleFix).toContain("auth.role()='service_role'");
 expect(ui).toContain('3600000');
 expect(ui).toContain('SpeechSynthesisUtterance');
 expect(ui).toContain('te-IN');
});


test('Service worker renders Telugu student homework push reminder', async()=>{
 const {readFile}=await import('node:fs/promises');const sw=await readFile(process.cwd()+'/service-worker.js','utf8');
 expect(sw).toContain("data.type === 'learn_homework_reminder'");
 expect(sw).toContain('లక్ష్య సేతు • చదువు సమయం');
 expect(sw).toContain('మీ హోంవర్క్ చెక్ లిస్ట్ పూర్తి చేసి పాఠాలు చదవండి');
 expect(sw).toContain('requireInteraction = true');
});


test('Learn & Teach script passes JavaScript syntax compilation', async()=>{
 const {readFile}=await import('node:fs/promises');
 const js=await readFile(process.cwd()+'/learn-teach.js','utf8');
 try { new Function(js); } catch(e) { throw new Error('learn-teach.js syntax error: '+e.message+'; stack='+e.stack); }
});
