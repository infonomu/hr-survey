/**
 * Google Apps Script - 설문 데이터를 Google Sheets에 저장
 *
 * ═══════════════════════════════════════════════════
 * 설정 방법:
 * ═══════════════════════════════════════════════════
 *
 * 1. Google Sheets 새 스프레드시트 생성
 *    - https://sheets.new 에서 새 시트 생성
 *    - 시트 이름을 설문 ID와 동일하게 설정 (예: "hr-saas-2026")
 *
 * 2. Apps Script 에디터 열기
 *    - Google Sheets 메뉴 > 확장 프로그램 > Apps Script
 *    - 이 파일의 코드를 붙여넣기
 *
 * 3. 배포
 *    - 배포 > 새 배포 > 유형: 웹 앱
 *    - 실행 계정: 본인
 *    - 액세스: 모든 사용자
 *    - "배포" 클릭 후 URL 복사
 *
 * 4. URL을 설문 HTML의 googleScriptUrl에 설정
 *
 * ═══════════════════════════════════════════════════
 */

// 스프레드시트 ID (URL에서 /d/ 와 /edit 사이의 문자열)
const SPREADSHEET_ID = '1E1PFWROpSyYnubThL69vJ0e5sWEGBqWYV_XHdBF2E3A';

/**
 * POST 요청 처리 - 설문 데이터 수신
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const surveyId = data._surveyId || 'default';

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(surveyId);

    // 시트가 없으면 자동 생성
    if (!sheet) {
      sheet = ss.insertSheet(surveyId);
    }

    // 첫 번째 행이 비어있으면 헤더 작성
    if (sheet.getLastRow() === 0) {
      const headers = Object.keys(data);
      headers.unshift('_rowNum');
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // 기존 헤더 가져오기
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // 새로운 키가 있으면 헤더에 추가
    const existingHeaders = new Set(headers);
    for (const key of Object.keys(data)) {
      if (!existingHeaders.has(key)) {
        headers.push(key);
        existingHeaders.add(key);
      }
    }
    // 헤더 업데이트
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // 데이터 행 작성
    const rowNum = sheet.getLastRow();
    const row = headers.map(h => {
      if (h === '_rowNum') return rowNum;
      return data[h] !== undefined ? data[h] : '';
    });

    sheet.appendRow(row);

    // 응답
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', row: rowNum }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET 요청 처리 - 상태 확인용
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Survey API is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * CORS 헤더 설정 (필요시)
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
