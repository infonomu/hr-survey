/**
 * survey-questions.js
 * ═══════════════════════════════════════════════════
 * 연구 설문 질문 정의 (단일 소스 - 절대 수정 금지)
 * 모든 설문 페이지가 이 파일을 공유하여 동일한 질문을 렌더링합니다.
 * ═══════════════════════════════════════════════════
 */

const SURVEY_CONFIG = {
  totalPages: 6,
  surveyId: 'hr-saas-2026',
  googleScriptUrl: 'https://script.google.com/macros/s/AKfycbxhFA8gA6zytZoH-KDRdy4PPbndj9QgtLLzcmjZbdA7co9I9VdbaVD7bsCNKhMsL3Dc/exec',
  stepLabels: [
    '기업 및 응답자 정보',
    'HR SaaS 도입 수준 (독립변수)',
    'HR 아웃소싱 (조절변수)',
    'HRM 공식화 — 채용·평가 (종속변수)',
    'HRM 공식화 — 보상·훈련 (종속변수)',
    '보고서 수령 정보'
  ]
};

// 사업자등록번호 유효성 검증 (10자리 체크섬)
function validateBizRegNumber(num) {
  const digits = String(num).replace(/\D/g, '');
  if (digits.length !== 10) return false;
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * weights[i];
  sum += Math.floor((parseInt(digits[8], 10) * 5) / 10);
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(digits[9], 10);
}

/**
 * 설문 폼 전체 HTML을 생성하여 #survey-mount 에 삽입
 */
function renderSurveyForm() {
  const mount = document.getElementById('survey-mount');
  if (!mount) return;

  mount.innerHTML = `
<section class="survey-section" id="survey">
  <div class="survey-wrapper">

    <div class="progress-header">
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" id="progressBar" style="width:16.66%"></div>
      </div>
      <div class="progress-labels">
        <span class="progress-step-label" id="progressLabel">섹션 1 / 6 — 기업 및 응답자 정보</span>
        <span id="progressPct">17%</span>
      </div>
    </div>

    <!-- ───── PAGE 1: 기본 정보 ───── -->
    <div class="survey-page active" data-page="1">
      <div class="survey-page-header">
        <div class="page-num">섹션 01 / 06</div>
        <h3>기업 및 응답자 기본 정보</h3>
        <p>귀사와 응답자에 대한 기본 정보를 입력해 주세요. (통제변수)</p>
      </div>

      <div class="q-block" data-required="select">
        <div class="q-label"><span class="q-num">Q1.</span> 귀사의 주요 업종을 선택해 주세요. <span class="q-required">*</span></div>
        <select class="q-select" id="q1">
          <option value="">— 선택해 주세요 —</option>
          <option>제조업</option><option>도·소매업</option><option>서비스업 (IT·소프트웨어)</option>
          <option>서비스업 (일반)</option><option>건설업</option><option>의료·보건업</option>
          <option>교육·연구업</option><option>금융·보험업</option><option>운수·물류업</option><option>기타</option>
        </select>
        <div class="q-error">필수 응답 항목입니다.</div>
      </div>

      <div class="q-block" data-required="select">
        <div class="q-label"><span class="q-num">Q2.</span> 귀사의 상시 근로자 수는 몇 명입니까? <span class="q-required">*</span></div>
        <select class="q-select" id="q2">
          <option value="">— 선택해 주세요 —</option>
          <option>5 ~ 9명</option><option>10 ~ 19명</option><option>20 ~ 29명</option>
          <option>30 ~ 39명</option><option>40 ~ 49명</option>
        </select>
        <div class="q-error">필수 응답 항목입니다.</div>
      </div>

      <div class="q-block" data-required="select">
        <div class="q-label"><span class="q-num">Q3.</span> 귀사의 설립 연수는 몇 년입니까? <span class="q-required">*</span></div>
        <select class="q-select" id="q3">
          <option value="">— 선택해 주세요 —</option>
          <option>3년 미만</option><option>3 ~ 5년 미만</option><option>5 ~ 10년 미만</option>
          <option>10 ~ 20년 미만</option><option>20년 이상</option>
        </select>
        <div class="q-error">필수 응답 항목입니다.</div>
      </div>

      <div class="q-block" data-required="select">
        <div class="q-label"><span class="q-num">Q4.</span> 귀하의 직무/직급을 선택해 주세요. <span class="q-required">*</span></div>
        <select class="q-select" id="q4">
          <option value="">— 선택해 주세요 —</option>
          <option>CEO / 대표이사</option><option>임원 (COO, 이사 등)</option>
          <option>HR팀장 / 인사관리자</option><option>HR 담당자 (팀원)</option>
          <option>총무·경영지원 담당자</option><option>기타 (인사업무 담당)</option>
        </select>
        <div class="q-error">필수 응답 항목입니다.</div>
      </div>

      <div class="q-block" data-required="radio" data-group="q5">
        <div class="q-label"><span class="q-num">Q5.</span> 경영진(대표 또는 임원)의 HR 디지털화에 대한 관심도는 어느 수준입니까? <span class="q-required">*</span>
          <span style="display:inline-block; background:#f0f4ff; border:1px solid #c5cae9; border-radius:4px; padding:2px 8px; font-size:11.5px; color:#3949ab; font-weight:normal; margin-left:6px; vertical-align:middle;">HR 디지털화 = HR SaaS·급여 프로그램·근태 앱 등 IT 도구 도입</span>
        </div>
        <div class="q-options">
          <label class="q-option"><input type="radio" name="q5" value="1"> ① 관심 없음 — HR 시스템 도입은 불필요하다고 생각한다</label>
          <label class="q-option"><input type="radio" name="q5" value="2"> ② 낮음 — 필요성은 인식하나 우선순위가 낮다</label>
          <label class="q-option"><input type="radio" name="q5" value="3"> ③ 보통 — 기회가 되면 검토할 의향이 있다</label>
          <label class="q-option"><input type="radio" name="q5" value="4"> ④ 높음 — 적극적으로 검토하거나 추진 중이다</label>
          <label class="q-option"><input type="radio" name="q5" value="5"> ⑤ 매우 높음 — 이미 도입했거나 전략 과제로 추진하고 있다</label>
        </div>
        <div class="q-error">필수 응답 항목입니다.</div>
      </div>

      <div class="survey-nav">
        <span></span>
        <span class="nav-page-indicator">1 / 6</span>
        <button class="btn-next" onclick="survey.nextPage(1)">다음 →</button>
      </div>
    </div>

    <!-- ───── PAGE 2: HR SaaS 도입 수준 (독립변수) ───── -->
    <div class="survey-page" data-page="2">
      <div class="survey-page-header">
        <div class="page-num">섹션 02 / 06</div>
        <h3>HR SaaS 도입 수준</h3>
        <p>귀사의 HR 업무 영역별 클라우드 HR 솔루션 도입 및 활용 현황을 응답해 주세요. <strong>미도입 기업도 모든 항목에 응답해 주시기 바랍니다.</strong></p>
      </div>

      <div style="background:#F0F4FF; border-left:4px solid var(--navy); border-radius:0 6px 6px 0; padding:18px 20px; margin-bottom:20px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <span style="background:var(--navy); color:#fff; font-size:11px; font-weight:700; padding:3px 8px; border-radius:3px; letter-spacing:0.5px;">HR SaaS 란?</span>
          <span style="font-size:12px; color:var(--text-muted);">Software as a Service — 인터넷으로 쓰는 인사관리 프로그램</span>
        </div>
        <p style="font-size:14px; color:var(--text); line-height:1.75; margin:0 0 10px;">
          <strong>HR SaaS</strong>는 별도 설치 없이 <strong>인터넷 브라우저나 앱으로 바로 쓸 수 있는 인사·급여·근태 관리 프로그램</strong>입니다.<br>
          월 구독료를 내거나 사용량만큼 비용을 지불하는 <em>클라우드 기반 HR 솔루션</em>이에요.
        </p>
        <div style="margin-bottom:12px;">
          <span style="font-size:12.5px; color:var(--text-muted); margin-right:6px; font-weight:600;">대표 예시</span>
          <span style="display:inline-block; background:#fff; border:1px solid #c5cae9; border-radius:20px; padding:3px 12px; font-size:12.5px; color:#3949ab; font-weight:600; margin:3px 3px;">이지인사</span>
          <span style="display:inline-block; background:#fff; border:1px solid #c5cae9; border-radius:20px; padding:3px 12px; font-size:12.5px; color:#3949ab; font-weight:600; margin:3px 3px;">플렉스(flex)</span>
          <span style="display:inline-block; background:#fff; border:1px solid #c5cae9; border-radius:20px; padding:3px 12px; font-size:12.5px; color:#3949ab; font-weight:600; margin:3px 3px;">시프티(Shiftee)</span>
          <span style="display:inline-block; background:#fff; border:1px solid #c5cae9; border-radius:20px; padding:3px 12px; font-size:12.5px; color:#3949ab; font-weight:600; margin:3px 3px;">더존 iCUBE</span>
          <span style="display:inline-block; background:#fff; border:1px solid #c5cae9; border-radius:20px; padding:3px 12px; font-size:12.5px; color:#3949ab; font-weight:600; margin:3px 3px;">그리팅</span>
          <span style="display:inline-block; background:#f5f5f5; border:1px solid #ddd; border-radius:20px; padding:3px 12px; font-size:12px; color:#888; margin:3px 3px;">그 외 유사 솔루션 포함</span>
        </div>
        <div style="display:flex; gap:16px; flex-wrap:wrap;">
          <div style="background:#E8F5E9; border-radius:6px; padding:8px 14px; font-size:13px; flex:1; min-width:220px;">
            <span style="color:#2d6a4f; font-weight:700;">✔ 해당됩니다</span><br>
            <span style="color:#444;">위와 같은 클라우드 HR 프로그램을 현재 사용 중이거나, 과거에 사용한 적 있는 경우</span>
          </div>
          <div style="background:#FFF3E0; border-radius:6px; padding:8px 14px; font-size:13px; flex:1; min-width:220px;">
            <span style="color:#8B4513; font-weight:700;">✘ 해당 안 됩니다</span><br>
            <span style="color:#444;">엑셀·수기 장부로만 관리하거나, 설치형 오프라인 프로그램(CD/EXE)만 사용하는 경우</span>
          </div>
        </div>
      </div>

      <div class="q-block" data-adoption>
        <div class="q-label"><span class="q-num">Q6.</span> 아래 각 HR 업무 영역에서 HR SaaS의 도입 여부와 활용 빈도를 선택해 주세요. <span class="q-required">*</span></div>
        <div class="likert-desc" style="margin-bottom:6px">
          <strong>도입 여부:</strong> 해당 영역에 HR SaaS를 현재 사용하고 있는지 선택 &nbsp;|&nbsp;
          <strong>활용 빈도 (도입한 경우):</strong> ① 거의 안 씀 &nbsp;② 가끔(월 1~2회) &nbsp;③ 정기적(주 1회) &nbsp;④ 자주(주 3회 이상) &nbsp;⑤ 핵심 업무로 완전 정착
        </div>
        <table class="adoption-table" id="adoptionTable">
          <thead>
            <tr>
              <th rowspan="2">HR 업무 영역</th>
              <th colspan="2" class="section-yn">도입 여부</th>
              <th colspan="5" class="section-freq">활용 빈도 (도입한 경우만 선택)</th>
            </tr>
            <tr>
              <th class="section-yn">예</th>
              <th class="section-yn">아니오</th>
              <th class="section-freq">①<span class="scale-label">거의<br>안 씀</span></th>
              <th class="section-freq">②<span class="scale-label">가끔<br>(월1~2회)</span></th>
              <th class="section-freq">③<span class="scale-label">정기적<br>(주1회)</span></th>
              <th class="section-freq">④<span class="scale-label">자주<br>(주3회+)</span></th>
              <th class="section-freq">⑤<span class="scale-label">완전<br>정착</span></th>
            </tr>
          </thead>
          <tbody>
            ${renderAdoptionRow('채용', '채용 관리', '공고·지원서·면접 일정 등')}
            ${renderAdoptionRow('근태', '근태·출퇴근 관리', '근태 기록·휴가 신청 등')}
            ${renderAdoptionRow('급여', '급여·비용 처리', '급여 계산·명세서 발행 등')}
            ${renderAdoptionRow('평가', '성과평가', '목표 설정·평가 기록 등')}
            ${renderAdoptionRow('교육', '교육·훈련 관리', '교육 계획·이수 기록 등')}
          </tbody>
        </table>
        <div class="q-error" id="adoptionError">모든 영역의 도입 여부를 선택해 주세요. 도입한 영역은 활용 빈도도 선택해 주세요.</div>
      </div>

      <div class="survey-nav">
        <button class="btn-prev" onclick="survey.prevPage(2)">← 이전</button>
        <span class="nav-page-indicator">2 / 6</span>
        <button class="btn-next" onclick="survey.nextPage(2)">다음 →</button>
      </div>
    </div>

    <!-- ───── PAGE 3: HR 아웃소싱 ───── -->
    <div class="survey-page" data-page="3">
      <div class="survey-page-header">
        <div class="page-num">섹션 03 / 06</div>
        <h3>HR 아웃소싱 (외부 전문가 활용)</h3>
        <p>노무사, HR 컨설턴트 등 외부 전문가 활용 현황에 대해 응답해 주세요. (조절변수 · 직접효과 변수)</p>
      </div>

      <div class="q-block" data-required="radio" data-group="q7">
        <div class="q-label"><span class="q-num">Q7.</span> 현재 귀사는 노무사, HR 컨설턴트 등 외부 전문가를 활용하고 있습니까? <span class="q-required">*</span></div>
        <div class="q-options">
          <label class="q-option"><input type="radio" name="q7" value="1"> 정기적으로 활용하고 있다 (월 1회 이상)</label>
          <label class="q-option"><input type="radio" name="q7" value="2"> 필요 시 활용한다 (비정기적)</label>
          <label class="q-option"><input type="radio" name="q7" value="3"> 과거에 활용한 적 있으나 현재는 아니다</label>
          <label class="q-option"><input type="radio" name="q7" value="4"> 활용한 적 없다</label>
        </div>
        <div class="q-error">필수 응답 항목입니다.</div>
      </div>

      <div class="q-block" data-likert="ho">
        <div class="q-label"><span class="q-num">Q8–Q11.</span> 다음 각 항목에 대해 귀하의 동의 정도를 표시해 주세요. <span class="q-required">*</span></div>
        <div class="likert-desc">① 전혀 그렇지 않다 &nbsp;② 그렇지 않다 &nbsp;③ 보통이다 &nbsp;④ 그렇다 &nbsp;⑤ 매우 그렇다</div>
        <table class="likert-table">
          <thead><tr><th>문항</th><th>①<span class="scale-label">전혀<br>아님</span></th><th>②<span class="scale-label">그렇지<br>않다</span></th><th>③<span class="scale-label">보통</span></th><th>④<span class="scale-label">그렇다</span></th><th>⑤<span class="scale-label">매우<br>그렇다</span></th></tr></thead>
          <tbody>
            ${renderLikertRow('ho1', '우리 회사는 HR 관련 의사결정 시 외부 전문가의 조언을 적극 활용한다.')}
            ${renderLikertRow('ho2', '외부 전문가 활용이 우리 회사 HR 관리의 체계화에 도움이 되었다.')}
            ${renderLikertRow('ho3', '외부 HR 전문가는 우리 회사 인사 관련 규정·절차 정비에 실질적인 도움을 주었다.')}
            ${renderLikertRow('ho4', '앞으로도 외부 HR 전문가 서비스를 지속적으로 활용할 의향이 있다.')}
          </tbody>
        </table>
        <div class="q-error">모든 항목을 응답해 주세요.</div>
      </div>

      <div class="survey-nav">
        <button class="btn-prev" onclick="survey.prevPage(3)">← 이전</button>
        <span class="nav-page-indicator">3 / 6</span>
        <button class="btn-next" onclick="survey.nextPage(3)">다음 →</button>
      </div>
    </div>

    <!-- ───── PAGE 4: HRM 공식화 — 채용·평가 ───── -->
    <div class="survey-page" data-page="4">
      <div class="survey-page-header">
        <div class="page-num">섹션 04 / 06</div>
        <h3>HRM 공식화 수준 (1) — 채용 · 성과평가</h3>
        <p>각 HR 관행이 귀사에서 현재 어떤 방식으로 운영되고 있는지, 아래 5단계 중 가장 가까운 수준을 선택해 주세요. 아직 해당 관행이 없다면 ①을 선택하시면 됩니다.</p>
      </div>

      <div style="background:var(--navy); color:var(--white); padding:16px 20px; margin-bottom:18px; border-left:4px solid var(--gold); font-size:13px; line-height:2;">
        <strong style="color:var(--gold-light); display:block; margin-bottom:6px;">📋 응답 기준 (Kotey &amp; Slade, 2005 소기업 공식화 척도)</strong>
        <span style="opacity:0.9">① 해당 관행이 전혀 없음</span><br>
        <span style="opacity:0.9">② 사업주·경영자가 그때그때 개인 판단으로 운영 <span style="opacity:0.6">(비공식·비일관)</span></span><br>
        <span style="opacity:0.9">③ 일관된 방식은 있으나 문서화되어 있지 않음 <span style="opacity:0.6">(비공식·일관)</span></span><br>
        <span style="opacity:0.9">④ 일부 문서화되어 있으나 완전하지 않음 <span style="opacity:0.6">(부분 공식화)</span></span><br>
        <span style="opacity:0.9">⑤ 서면 규정·매뉴얼로 완전히 문서화되어 체계적으로 운영 <span style="opacity:0.6">(완전 공식화)</span></span>
      </div>

      <div class="q-block" data-likert="hrm_r">
        <div class="q-label"><span class="q-num">Q12–Q14.</span> 채용 관행의 공식화 수준을 선택해 주세요. <span class="q-required">*</span></div>
        <div class="likert-desc">① 없음 &nbsp;② 비공식·비일관 &nbsp;③ 비공식·일관 &nbsp;④ 부분 공식화 &nbsp;⑤ 완전 공식화</div>
        <table class="likert-table">
          <thead><tr><th>HR 관행 영역</th><th>①<span class="scale-label">없음</span></th><th>②<span class="scale-label">비공식·비일관</span></th><th>③<span class="scale-label">비공식·일관</span></th><th>④<span class="scale-label">부분 공식화</span></th><th>⑤<span class="scale-label">완전 공식화</span></th></tr></thead>
          <tbody>
            ${renderHrmRow('hrm_r1', '지원자 모집 방법 및 채용 경로', '예) 공고 게재, 채용 대행, 지인 추천 등의 운영 방식')}
            ${renderHrmRow('hrm_r2', '지원자 선발 기준 및 면접 평가 방법', '예) 평가 기준, 면접 질문 구성, 참여자 구성 등')}
            ${renderHrmRow('hrm_r3', '신규 입사자 업무 적응 지원 절차', '예) 온보딩 교육, 업무 인수인계, 적응 지원 방식')}
          </tbody>
        </table>
      </div>

      <div class="q-block" data-likert="hrm_a">
        <div class="q-label"><span class="q-num">Q15–Q17.</span> 성과평가 관행의 공식화 수준을 선택해 주세요. <span class="q-required">*</span></div>
        <div class="likert-desc">① 없음 &nbsp;② 비공식·비일관 &nbsp;③ 비공식·일관 &nbsp;④ 부분 공식화 &nbsp;⑤ 완전 공식화</div>
        <table class="likert-table">
          <thead><tr><th>HR 관행 영역</th><th>①<span class="scale-label">없음</span></th><th>②<span class="scale-label">비공식·비일관</span></th><th>③<span class="scale-label">비공식·일관</span></th><th>④<span class="scale-label">부분 공식화</span></th><th>⑤<span class="scale-label">완전 공식화</span></th></tr></thead>
          <tbody>
            ${renderHrmRow('hrm_a1', '직원 성과를 평가하는 방법과 기준', '예) 평가 주기, 평가 항목, 평가자 구성 등')}
            ${renderHrmRow('hrm_a2', '성과평가 결과를 기록하고 관리하는 방법', '예) 평가 결과 보관, 이력 관리, 피드백 방식')}
            ${renderHrmRow('hrm_a3', '성과평가 결과를 인사 결정에 반영하는 방식', '예) 급여 조정, 승진, 배치 결정 시 평가 결과 활용')}
          </tbody>
        </table>
        <div class="q-error">모든 항목을 응답해 주세요.</div>
      </div>

      <div class="survey-nav">
        <button class="btn-prev" onclick="survey.prevPage(4)">← 이전</button>
        <span class="nav-page-indicator">4 / 6</span>
        <button class="btn-next" onclick="survey.nextPage(4)">다음 →</button>
      </div>
    </div>

    <!-- ───── PAGE 5: HRM 공식화 — 보상·훈련 ───── -->
    <div class="survey-page" data-page="5">
      <div class="survey-page-header">
        <div class="page-num">섹션 05 / 06</div>
        <h3>HRM 공식화 수준 (2) — 보상 · 훈련·개발</h3>
        <p>앞 페이지와 동일한 기준으로, 각 HR 관행이 귀사에서 현재 어떤 수준으로 운영되는지 선택해 주세요.</p>
      </div>

      <div style="background:rgba(22,35,71,0.05); border:1px solid var(--border); border-left:4px solid var(--gold); padding:12px 18px; margin-bottom:18px; font-size:12.5px; line-height:1.9; color:var(--text-muted);">
        <strong style="color:var(--navy)">응답 기준:</strong> &nbsp;
        ① 없음 &nbsp;|&nbsp; ② 비공식·비일관 &nbsp;|&nbsp; ③ 비공식·일관 &nbsp;|&nbsp; ④ 부분 공식화 &nbsp;|&nbsp; ⑤ 완전 공식화
      </div>

      <div class="q-block" data-likert="hrm_c">
        <div class="q-label"><span class="q-num">Q18–Q20.</span> 보상 관행의 공식화 수준을 선택해 주세요. <span class="q-required">*</span></div>
        <div class="likert-desc">① 없음 &nbsp;② 비공식·비일관 &nbsp;③ 비공식·일관 &nbsp;④ 부분 공식화 &nbsp;⑤ 완전 공식화</div>
        <table class="likert-table">
          <thead><tr><th>HR 관행 영역</th><th>①<span class="scale-label">없음</span></th><th>②<span class="scale-label">비공식·비일관</span></th><th>③<span class="scale-label">비공식·일관</span></th><th>④<span class="scale-label">부분 공식화</span></th><th>⑤<span class="scale-label">완전 공식화</span></th></tr></thead>
          <tbody>
            ${renderHrmRow('hrm_c1', '직원 급여 수준을 결정하는 기준과 방법', '예) 직급별·경력별 급여 책정 방식, 연봉 협상 기준')}
            ${renderHrmRow('hrm_c2', '복리후생을 제공하는 기준과 방법', '예) 연차·수당·보험 등의 제공 기준 및 안내 방식')}
            ${renderHrmRow('hrm_c3', '임금 인상·조정에 관한 기준과 결정 방식', '예) 인상 시기, 인상 기준(성과·연차 등), 결정 주체')}
          </tbody>
        </table>
      </div>

      <div class="q-block" data-likert="hrm_t">
        <div class="q-label"><span class="q-num">Q21–Q23.</span> 훈련·개발 관행의 공식화 수준을 선택해 주세요. <span class="q-required">*</span></div>
        <div class="likert-desc">① 없음 &nbsp;② 비공식·비일관 &nbsp;③ 비공식·일관 &nbsp;④ 부분 공식화 &nbsp;⑤ 완전 공식화</div>
        <table class="likert-table">
          <thead><tr><th>HR 관행 영역</th><th>①<span class="scale-label">없음</span></th><th>②<span class="scale-label">비공식·비일관</span></th><th>③<span class="scale-label">비공식·일관</span></th><th>④<span class="scale-label">부분 공식화</span></th><th>⑤<span class="scale-label">완전 공식화</span></th></tr></thead>
          <tbody>
            ${renderHrmRow('hrm_t1', '교육훈련 필요성을 파악하고 계획을 수립하는 방법', '예) 연간 교육계획 수립, 직무별 교육 필요성 파악 방식')}
            ${renderHrmRow('hrm_t2', '교육훈련을 실시하고 이수 내용을 관리하는 방법', '예) OJT·외부교육 운영 방식, 이수 기록 관리')}
            ${renderHrmRow('hrm_t3', '교육훈련의 효과를 평가하는 방법', '예) 교육 후 현업 적용도 확인, 직무 역량 향상 평가 방식')}
          </tbody>
        </table>
        <div class="q-error">모든 항목을 응답해 주세요.</div>
      </div>

      <div class="survey-nav">
        <button class="btn-prev" onclick="survey.prevPage(5)">← 이전</button>
        <span class="nav-page-indicator">5 / 6</span>
        <button class="btn-next" onclick="survey.nextPage(5)">다음 →</button>
      </div>
    </div>

    <!-- ───── PAGE 6: 보고서 수령 ───── -->
    <div class="survey-page" data-page="6">
      <div class="survey-page-header">
        <div class="page-num">섹션 06 / 06</div>
        <h3 id="page6Title">보고서 수령 정보</h3>
        <p id="page6Desc">마지막 단계입니다! 보고서와 쿠폰을 받으실 정보를 입력해 주세요.</p>
      </div>
      <div class="email-section-box">
        <h4 id="page6BoxTitle">📬 무료 보고서 및 쿠폰 수령 정보</h4>
        <p id="page6BoxDesc">아래 정보로 ① 무료 노무진단 보고서, ② 고용지원금 안내 보고서를 <strong>이메일</strong>로, ③ 스타벅스 커피 쿠폰을 <strong>카카오톡(휴대폰)</strong>으로 발송해 드립니다.<br>보통 <strong style="color:var(--gold-light)">설문 마감 후 1~2주 이내</strong>에 발송됩니다.</p>

        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:13px; font-weight:600; color:var(--navy); margin-bottom:6px;">
            🏢 사업자등록번호 <span style="color:#f87171;">*</span>
            <span style="font-size:11.5px; font-weight:400; color:var(--text-muted); margin-left:4px;">실제 사업자 응답 확인용</span>
          </label>
          <input type="text" class="q-input" id="bizRegNumber" placeholder="예: 123-45-67890" maxlength="12" inputmode="numeric" autocomplete="off" style="margin-bottom:6px; letter-spacing:1px;">
          <p style="font-size:11.5px; color:var(--text-muted); line-height:1.6; margin:0;">
            ※ 허위응답 방지를 위한 <strong>형식(체크섬) 검증만</strong> 수행하며, 외부 기관에 조회하거나 시트에 저장하지 않습니다.
          </p>
        </div>

        <div style="margin-bottom:14px;" id="emailFieldWrap">
          <label style="display:block; font-size:13px; font-weight:600; color:var(--navy); margin-bottom:6px;">
            📧 이메일 주소 <span style="color:#f87171;">*</span>
            <span style="font-size:11.5px; font-weight:400; color:var(--text-muted); margin-left:4px;" id="emailLabel">노무진단 보고서·고용지원금 보고서 수령용</span>
          </label>
          <input type="email" class="q-input" id="emailInput" placeholder="example@company.com" style="margin-bottom:0;">
        </div>

        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:13px; font-weight:600; color:var(--navy); margin-bottom:6px;">
            ☕ 휴대폰 번호 <span style="color:#f87171;">*</span>
            <span style="font-size:11.5px; font-weight:400; color:var(--text-muted); margin-left:4px;">스타벅스 커피쿠폰 카카오톡 발송용</span>
          </label>
          <input type="tel" class="q-input" id="phoneInput" placeholder="010-0000-0000" style="margin-bottom:0;">
        </div>

        <div class="consent-row">
          <input type="checkbox" id="consentCheck">
          <label for="consentCheck">수집된 이메일·휴대폰 번호는 보고서·쿠폰 발송 목적으로만 사용되며, 연구 종료 후 즉시 파기됩니다. 개인정보 수집·이용에 동의합니다.</label>
        </div>
        <div id="emailError" style="color:#f87171; font-size:12px; margin-top:8px; display:none;"></div>
      </div>
      <div class="q-block" style="margin-top:16px;">
        <div class="q-label"><span class="q-num" style="color:var(--text-muted)">추가</span> 연구와 관련하여 하고 싶은 말씀이 있으시면 자유롭게 적어 주세요. (선택)</div>
        <textarea class="q-input" id="freeText" rows="4" placeholder="HR 관리에서 어려움을 겪는 부분, 디지털 전환 경험, 연구에 대한 의견 등 자유롭게 작성해 주세요."></textarea>
      </div>
      <div style="background:var(--cream-dark); padding:16px 20px; font-size:12.5px; color:var(--text-muted); line-height:1.8; border:1px solid var(--border);">
        본 설문은 한양대학교 대학원 경영학과 석사학위논문 연구를 위해 진행됩니다. 수집된 데이터는 연구 목적 외에 사용되지 않으며, 개인식별 정보는 통계 처리 후 파기됩니다. 연구 관련 문의: <strong style="color:var(--navy)" id="contactInfo">공인노무사 정보람</strong>
      </div>
      <div class="survey-nav">
        <button class="btn-prev" onclick="survey.prevPage(6)">← 이전</button>
        <span class="nav-page-indicator">6 / 6</span>
        <button class="btn-submit" onclick="submitSurvey()">설문 제출하기 ✓</button>
      </div>
    </div>

    <!-- THANK YOU -->
    <div class="thankyou-page" id="thankyouPage">
      <div class="thankyou-icon">✓</div>
      <h2>설문에 참여해 주셔서 감사합니다!</h2>
      <p>귀하의 소중한 응답이 소기업 HR 발전을 위한<br>실증 연구의 토대가 됩니다.</p>
      <p style="font-size:14px; color:var(--gold); font-weight:600; margin-top:6px;" id="thankyouSub">입력하신 이메일·휴대폰으로 보고서와 쿠폰이 발송됩니다.</p>
      <div class="thankyou-note" id="thankyouNote">
        <strong style="color:var(--gold-light)">📋 다음 단계 안내</strong><br><br>
        설문 마감 후 1~2주 이내에<br>
        <strong>① 무료 노무진단 보고서</strong>, <strong>② 고용지원금 안내 보고서</strong> → 입력하신 <strong>이메일</strong>로 발송<br>
        <strong>③ 스타벅스 커피 쿠폰</strong> → 입력하신 <strong>휴대폰(카카오톡)</strong>으로 발송<br><br>
        문의사항이 있으시면 <span id="contactEmail"></span> 으로 연락 주시기 바랍니다.
      </div>
      <div style="margin-top:28px; background:var(--cream); border:1px solid var(--border); padding:24px 28px; text-align:center;">
        <p style="font-size:15px; font-weight:600; color:var(--navy); margin-bottom:6px;">주변 기업의 대표님 또는 인사담당자님께<br>이 설문을 소개해 주세요!</p>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">더 많은 참여가 소기업 HR 발전에 큰 힘이 됩니다.</p>
        <div style="display:flex; align-items:center; gap:8px; max-width:420px; margin:0 auto;">
          <input type="text" id="shareUrl" readonly style="flex:1; padding:10px 14px; border:1px solid var(--border); background:var(--white); font-size:13px; color:var(--text); border-radius:2px; cursor:text;">
          <button onclick="copyShareUrl()" id="copyBtn" style="background:var(--navy); color:var(--white); border:none; padding:10px 20px; font-family:'Noto Sans KR',sans-serif; font-size:13px; font-weight:600; cursor:pointer; border-radius:2px; white-space:nowrap; transition:all 0.2s;">URL 복사</button>
        </div>
        <p id="copyConfirm" style="font-size:12px; color:var(--success); margin-top:8px; display:none;">복사되었습니다!</p>
      </div>
    </div>

  </div>
</section>

<!-- Loading overlay -->
<div class="submit-loading" id="submitLoading">
  <div class="submit-loading-inner">
    <div class="spinner"></div>
    <p style="font-size:15px; font-weight:600; color:var(--navy);">설문을 제출하고 있습니다...</p>
    <p style="font-size:13px; color:var(--text-muted); margin-top:6px;">잠시만 기다려 주세요.</p>
  </div>
</div>
`;

  // Adoption table: freq 토글 이벤트 바인딩
  mount.querySelectorAll('.yn-radio').forEach(radio => {
    radio.addEventListener('change', function() {
      const row = this.closest('tr');
      const freqRadios = row.querySelectorAll('.freq-radio');
      const isYes = this.value === 'Y';
      freqRadios.forEach(r => {
        r.disabled = !isYes;
        if (!isYes) r.checked = false;
      });
      row.style.opacity = isYes ? '1' : '0.85';
    });
  });
}

// ── Helper: Adoption table row ──
function renderAdoptionRow(area, label, sub) {
  return `<tr data-area="${area}">
    <td>${label}<div class="adoption-sub">${sub}</div></td>
    <td><input type="radio" name="yn_${area}" value="Y" class="yn-radio"></td>
    <td><input type="radio" name="yn_${area}" value="N" class="yn-radio" checked></td>
    <td><input type="radio" name="freq_${area}" value="1" class="freq-radio" disabled></td>
    <td><input type="radio" name="freq_${area}" value="2" class="freq-radio" disabled></td>
    <td><input type="radio" name="freq_${area}" value="3" class="freq-radio" disabled></td>
    <td><input type="radio" name="freq_${area}" value="4" class="freq-radio" disabled></td>
    <td><input type="radio" name="freq_${area}" value="5" class="freq-radio" disabled></td>
  </tr>`;
}

// ── Helper: Likert row (5점 동의 척도) ──
function renderLikertRow(name, text) {
  return `<tr><td>${text}</td>${[1,2,3,4,5].map(v => `<td><input type="radio" name="${name}" value="${v}"></td>`).join('')}</tr>`;
}

// ── Helper: HRM 공식화 row ──
function renderHrmRow(name, text, hint) {
  return `<tr><td>${text}<br><span style="font-size:11.5px;color:#888">${hint}</span></td>${[1,2,3,4,5].map(v => `<td><input type="radio" name="${name}" value="${v}"></td>`).join('')}</tr>`;
}

/**
 * 설문 초기화 - 각 랜딩 페이지에서 호출
 * @param {string} source - 유입 경로 식별자 (예: 'landing-a', 'email-campaign')
 * @param {object} [options] - 페이지별 옵션
 * @param {string} [options.contactName] - 문의처 이름
 * @param {string} [options.contactEmail] - 문의처 이메일
 * @param {boolean} [options.couponOnly] - true면 커피쿠폰만 (보고서 혜택 숨김)
 */
function initSurvey(source, options) {
  const opts = options || {};
  renderSurveyForm();

  // 페이지별 연락처 설정
  const contactName = opts.contactName || '공인노무사 정보람';
  const contactEmail = opts.contactEmail || 'info_nomu@naver.com';
  const contactInfoEl = document.getElementById('contactInfo');
  const contactEmailEl = document.getElementById('contactEmail');
  if (contactInfoEl) contactInfoEl.textContent = contactName + ' (' + contactEmail + ')';
  if (contactEmailEl) contactEmailEl.textContent = contactEmail;

  // 공유 URL 설정
  const shareUrlEl = document.getElementById('shareUrl');
  if (shareUrlEl) shareUrlEl.value = window.location.href;

  // URL 복사 함수
  window.copyShareUrl = function() {
    const url = document.getElementById('shareUrl');
    const btn = document.getElementById('copyBtn');
    const confirm = document.getElementById('copyConfirm');
    if (url) {
      navigator.clipboard.writeText(url.value).then(function() {
        if (btn) { btn.textContent = '복사 완료!'; btn.style.background = 'var(--success)'; }
        if (confirm) confirm.style.display = 'block';
        setTimeout(function() {
          if (btn) { btn.textContent = 'URL 복사'; btn.style.background = 'var(--navy)'; }
          if (confirm) confirm.style.display = 'none';
        }, 3000);
      });
    }
  };

  // 커피쿠폰만 제공하는 경우: 보고서 관련 문구 교체
  if (opts.couponOnly) {
    const page6Title = document.getElementById('page6Title');
    const page6Desc = document.getElementById('page6Desc');
    const page6BoxTitle = document.getElementById('page6BoxTitle');
    const page6BoxDesc = document.getElementById('page6BoxDesc');
    const emailLabel = document.getElementById('emailLabel');
    const thankyouSub = document.getElementById('thankyouSub');
    const thankyouNote = document.getElementById('thankyouNote');

    if (page6Title) page6Title.textContent = '쿠폰 수령 정보';
    if (page6Desc) page6Desc.textContent = '마지막 단계입니다! 쿠폰을 받으실 정보를 입력해 주세요.';
    if (page6BoxTitle) page6BoxTitle.textContent = '☕ 스타벅스 쿠폰 수령 정보';
    if (page6BoxDesc) page6BoxDesc.innerHTML = '스타벅스 아메리카노 쿠폰을 <strong>카카오톡(휴대폰)</strong>으로 발송해 드립니다.<br>보통 <strong style="color:var(--gold-light)">설문 마감 후 1~2주 이내</strong>에 발송됩니다.';
    if (emailLabel) emailLabel.textContent = '연구 결과 안내용 (선택)';
    if (thankyouSub) thankyouSub.textContent = '입력하신 휴대폰으로 스타벅스 쿠폰이 발송됩니다.';
    if (thankyouNote) thankyouNote.innerHTML = '<strong style="color:var(--gold-light)">☕ 다음 단계 안내</strong><br><br>설문 마감 후 1~2주 이내에<br><strong>스타벅스 커피 쿠폰</strong> → 입력하신 <strong>휴대폰(카카오톡)</strong>으로 발송<br><br>문의사항이 있으시면 ' + contactEmail + ' 으로 연락 주시기 바랍니다.';
  }

  const survey = new SurveyCore({
    ...SURVEY_CONFIG,
  });

  // 사업자등록번호 자동 하이픈 포맷팅 (XXX-XX-XXXXX)
  const bizInput = document.getElementById('bizRegNumber');
  if (bizInput) {
    bizInput.addEventListener('input', function() {
      const d = this.value.replace(/\D/g, '').slice(0, 10);
      let formatted = d;
      if (d.length > 5) formatted = d.slice(0, 3) + '-' + d.slice(3, 5) + '-' + d.slice(5);
      else if (d.length > 3) formatted = d.slice(0, 3) + '-' + d.slice(3);
      this.value = formatted;
    });
  }

  // Page 2: Adoption table 커스텀 검증
  survey.registerValidator(2, function() {
    const areas = ['채용','근태','급여','평가','교육'];
    let valid = true;
    for (const area of areas) {
      const ynChecked = document.querySelector(`input[name="yn_${area}"]:checked`);
      if (!ynChecked) { valid = false; break; }
      if (ynChecked.value === 'Y') {
        const freqChecked = document.querySelector(`input[name="freq_${area}"]:checked`);
        if (!freqChecked) { valid = false; break; }
      }
    }
    const block = document.querySelector('[data-adoption]');
    const errEl = document.getElementById('adoptionError');
    if (!valid) {
      block.classList.add('has-error');
      errEl.style.display = 'block';
    } else {
      block.classList.remove('has-error');
      errEl.style.display = 'none';
    }
    return valid;
  });

  // HRM 공식화 척도 선택 시 응답 기준 설명 표시
  const hrmScaleDesc = {
    '1': '해당 관행이 전혀 없음',
    '2': '사업주·경영자가 그때그때 개인 판단으로 운영 (비공식·비일관)',
    '3': '일관된 방식은 있으나 문서화되어 있지 않음 (비공식·일관)',
    '4': '일부 문서화되어 있으나 완전하지 않음 (부분 공식화)',
    '5': '서면 규정·매뉴얼로 완전히 문서화되어 체계적으로 운영 (완전 공식화)'
  };

  document.querySelectorAll('.q-block[data-likert^="hrm_"]').forEach(block => {
    block.querySelectorAll('tbody tr').forEach(row => {
      // 설명 표시 영역 추가
      const descEl = document.createElement('div');
      descEl.className = 'hrm-scale-desc';
      descEl.style.cssText = 'display:none; font-size:12px; color:var(--navy-light); background:rgba(184,151,46,0.08); border-left:3px solid var(--gold); padding:6px 12px; margin-top:6px; line-height:1.6;';
      row.querySelector('td:first-child').appendChild(descEl);

      row.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
          if (this.checked && hrmScaleDesc[this.value]) {
            descEl.textContent = '→ ' + hrmScaleDesc[this.value];
            descEl.style.display = 'block';
          }
        });
      });
    });
  });

  // Adoption table: yn/freq를 항상 일관된 순서로 포함 (시트 컬럼 정렬 고정용)
  survey.registerCollector('adoption', (data) => {
    const areas = ['채용','근태','급여','평가','교육'];
    for (const area of areas) {
      delete data[`yn_${area}`];
      delete data[`freq_${area}`];
    }
    for (const area of areas) {
      const yn = document.querySelector(`input[name="yn_${area}"]:checked`);
      data[`yn_${area}`] = yn ? yn.value : '';
      const freq = document.querySelector(`input[name="freq_${area}"]:checked`);
      data[`freq_${area}`] = freq ? freq.value : '';
    }
    return null;
  });

  // 사업자등록번호: 원본은 저장하지 않고 검증 통과 여부만 기록
  survey.registerCollector('bizreg', (data) => {
    delete data.bizRegNumber;
    const input = document.getElementById('bizRegNumber');
    data.bizRegValid = input && validateBizRegNumber(input.value) ? 'Y' : 'N';
    return null;
  });

  // source를 데이터에 포함
  survey.registerCollector('source', () => ({ _source: source }));

  // global 참조
  window.survey = survey;

  // submit 함수
  window.submitSurvey = function() {
    survey.submitToGoogleSheets(function() {
      const bizReg = document.getElementById('bizRegNumber').value.trim();
      const email = document.getElementById('emailInput').value.trim();
      const phone = document.getElementById('phoneInput').value.trim().replace(/[-\s]/g, '');
      const consent = document.getElementById('consentCheck').checked;
      const errEl = document.getElementById('emailError');

      if (!validateBizRegNumber(bizReg)) {
        errEl.textContent = '유효한 사업자등록번호를 입력해 주세요. (10자리 숫자)';
        errEl.style.display = 'block';
        return false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errEl.textContent = '유효한 이메일 주소를 입력해 주세요.';
        errEl.style.display = 'block';
        return false;
      }
      if (!phone || !/^01[016789]\d{7,8}$/.test(phone)) {
        errEl.textContent = '유효한 휴대폰 번호를 입력해 주세요. (예: 010-1234-5678)';
        errEl.style.display = 'block';
        return false;
      }
      if (!consent) {
        errEl.textContent = '개인정보 수집·이용에 동의해 주세요.';
        errEl.style.display = 'block';
        return false;
      }
      errEl.style.display = 'none';
      return true;
    });
  };

  return survey;
}
