const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const screenshotDir = path.join(__dirname, 'screenshots');
  const fs = require('fs');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  async function shot(name) {
    await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), fullPage: false });
    console.log(`[SCREENSHOT] ${name}.png`);
  }

  try {
    // ── STEP 1: 파일 열기 ──
    console.log('=== STEP 1: 파일 열기 ===');
    await page.goto('file:///C:/Users/user/projects/hr-survey/surveys/hr-saas-survey.html');
    await page.waitForTimeout(2000);
    await shot('01_landing');

    // ── STEP 2: 히어로 섹션 확인 + "지금 설문 참여하기" 클릭 ──
    console.log('=== STEP 2: 히어로 섹션 확인 ===');
    const heroVisible = await page.isVisible('.hero');
    console.log(`히어로 섹션 표시: ${heroVisible}`);
    await page.click('a.cta-btn');
    await page.waitForTimeout(1500);
    await shot('02_survey_start');

    // ── STEP 3: PAGE 1 ──
    console.log('=== STEP 3: PAGE 1 - 기업 및 응답자 정보 ===');
    await page.selectOption('#q1', { label: '서비스업 (IT·소프트웨어)' });
    await page.selectOption('#q2', { label: '10 ~ 19명' });
    await page.selectOption('#q3', { label: '5 ~ 10년 미만' });
    await page.selectOption('#q4', { label: 'HR팀장 / 인사관리자' });
    await page.click('input[name="q5"][value="4"]');
    await page.waitForTimeout(500);
    await shot('03_page1_filled');

    // 다음 버튼 클릭
    await page.click('.survey-page[data-page="1"] .btn-next');
    await page.waitForTimeout(1000);
    await shot('04_page2_start');

    // ── STEP 4: PAGE 2 - HR SaaS 도입 수준 ──
    console.log('=== STEP 4: PAGE 2 - HR SaaS 도입 수준 ===');
    // 채용: "아니오" (기본 체크됨 - 그대로)
    // 근태: "예" 선택
    await page.click('input[name="yn_근태"][value="Y"]');
    await page.waitForTimeout(300);
    // 근태 활용 빈도: "④ 자주" (value="4")
    await page.click('input[name="freq_근태"][value="4"]');
    await page.waitForTimeout(300);

    // 급여: "예" 선택
    await page.click('input[name="yn_급여"][value="Y"]');
    await page.waitForTimeout(300);
    // 급여 활용 빈도: "⑤ 완전 정착" (value="5")
    await page.click('input[name="freq_급여"][value="5"]');
    await page.waitForTimeout(300);

    // 평가, 교육: "아니오" (기본 - 그대로)
    await page.waitForTimeout(500);
    await shot('05_page2_filled');

    // 다음 버튼 클릭
    await page.click('.survey-page[data-page="2"] .btn-next');
    await page.waitForTimeout(1000);
    await shot('06_page3_start');

    // ── STEP 5: PAGE 3 - HR 아웃소싱 ──
    console.log('=== STEP 5: PAGE 3 - HR 아웃소싱 ===');
    // Q7: "필요 시 활용한다 (비정기적)" value="2"
    await page.click('input[name="q7"][value="2"]');
    await page.waitForTimeout(300);

    // Q8-Q11 리커트: 모두 "③ 보통" (value="3")
    await page.click('input[name="ho1"][value="3"]');
    await page.click('input[name="ho2"][value="3"]');
    await page.click('input[name="ho3"][value="3"]');
    await page.click('input[name="ho4"][value="3"]');
    await page.waitForTimeout(500);
    await shot('07_page3_filled');

    // 다음 버튼 클릭
    await page.click('.survey-page[data-page="3"] .btn-next');
    await page.waitForTimeout(1000);
    await shot('08_page4_start');

    // ── STEP 6: PAGE 4 - HRM 공식화 1 ──
    console.log('=== STEP 6: PAGE 4 - HRM 공식화 (채용·평가) ===');
    // Q12-Q14 (채용): 모두 "③" (value="3")
    await page.click('input[name="hrm_r1"][value="3"]');
    await page.click('input[name="hrm_r2"][value="3"]');
    await page.click('input[name="hrm_r3"][value="3"]');

    // Q15-Q17 (성과평가): 모두 "②" (value="2")
    await page.click('input[name="hrm_a1"][value="2"]');
    await page.click('input[name="hrm_a2"][value="2"]');
    await page.click('input[name="hrm_a3"][value="2"]');
    await page.waitForTimeout(500);
    await shot('09_page4_filled');

    // 다음 버튼 클릭
    await page.click('.survey-page[data-page="4"] .btn-next');
    await page.waitForTimeout(1000);
    await shot('10_page5_start');

    // ── STEP 7: PAGE 5 - HRM 공식화 2 ──
    console.log('=== STEP 7: PAGE 5 - HRM 공식화 (보상·훈련) ===');
    // Q18-Q20 (보상): 모두 "④" (value="4")
    await page.click('input[name="hrm_c1"][value="4"]');
    await page.click('input[name="hrm_c2"][value="4"]');
    await page.click('input[name="hrm_c3"][value="4"]');

    // Q21-Q23 (훈련): 모두 "②" (value="2")
    await page.click('input[name="hrm_t1"][value="2"]');
    await page.click('input[name="hrm_t2"][value="2"]');
    await page.click('input[name="hrm_t3"][value="2"]');
    await page.waitForTimeout(500);
    await shot('11_page5_filled');

    // 다음 버튼 클릭
    await page.click('.survey-page[data-page="5"] .btn-next');
    await page.waitForTimeout(1000);
    await shot('12_page6_start');

    // ── STEP 8: PAGE 6 - 보고서 수령 ──
    console.log('=== STEP 8: PAGE 6 - 보고서 수령 정보 ===');
    await page.fill('#emailInput', 'test-survey@example.com');
    await page.fill('#phoneInput', '010-1234-5678');
    await page.check('#consentCheck');
    await page.waitForTimeout(500);
    await shot('13_page6_filled');

    // 설문 제출하기 버튼 클릭
    console.log('=== 설문 제출 클릭 ===');
    await page.click('.btn-submit');
    await page.waitForTimeout(5000);
    await shot('14_submitted');

    // ── STEP 9: 감사 페이지 확인 ──
    console.log('=== STEP 9: 감사 페이지 확인 ===');
    const thankyouVisible = await page.isVisible('#thankyouPage');
    console.log(`감사 페이지 표시: ${thankyouVisible}`);
    await shot('15_thankyou');

    console.log('\n=== 테스트 완료 ===');
    console.log('브라우저를 열어둡니다. 수동으로 닫아주세요.');

    // 브라우저를 닫지 않고 대기
    await page.waitForTimeout(600000);

  } catch (err) {
    console.error('테스트 오류:', err.message);
    await shot('error_state');
    // 오류가 나도 브라우저를 열어둠
    await page.waitForTimeout(600000);
  }
})();
