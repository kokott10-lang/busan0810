/**
 * 독도초등학교 홈페이지 - 예산 아이디어 제안 카카오톡 알림 (Google Apps Script)
 *
 * 홈페이지에서 아이디어가 제출되면 이 웹 앱으로 POST 요청이 오고,
 * 카카오 "나에게 보내기" API로 관리자 본인의 카카오톡에 알림을 보냅니다.
 *
 * 카카오 키와 토큰은 모두 이 스크립트의 "스크립트 속성"에만 저장되므로
 * 홈페이지(공개 소스)에는 노출되지 않습니다.
 *
 * 필요한 스크립트 속성 (프로젝트 설정 > 스크립트 속성):
 *   KAKAO_REST_API_KEY   (필수) 카카오 앱의 REST API 키
 *   KAKAO_CLIENT_SECRET  (선택) 카카오 로그인 Client Secret을 "사용함"으로 켰다면 입력
 *   SITE_URL             (선택) 알림 메시지의 "홈페이지 열기" 버튼 링크
 *
 * 설치 방법은 저장소의 KAKAO_ALERT.md 를 참고하세요.
 */

var KAUTH = 'https://kauth.kakao.com';
var KAPI = 'https://kapi.kakao.com';
var MIN_INTERVAL_SEC = 10;   // 연속 요청(도배) 방지: 최소 전송 간격
var MAX_TEXT = 200;          // 카카오 텍스트 템플릿 최대 길이

function props_() {
  return PropertiesService.getScriptProperties();
}

function webAppUrl_() {
  return ScriptApp.getService().getUrl();
}

/* ------------------------------------------------------------------ *
 * GET: 카카오 로그인 연결(최초 1회) 및 상태 확인
 * ------------------------------------------------------------------ */
function doGet(e) {
  var p = (e && e.parameter) || {};

  // 카카오 로그인 후 redirect_uri 로 돌아온 경우 → 인가 코드를 토큰으로 교환
  if (p.code) {
    try {
      exchangeCode_(p.code);
      return html_('✅ 카카오톡 연결 완료! 이제 아이디어가 제출되면 카카오톡으로 알림이 갑니다.');
    } catch (err) {
      return html_('❌ 연결 실패: ' + esc_(err.message));
    }
  }
  if (p.error) {
    return html_('❌ 카카오 로그인 취소/오류: ' + esc_(p.error_description || p.error));
  }

  // ?setup=1 → 카카오 로그인 화면으로 이동하는 링크 표시
  if (p.setup) {
    var key = props_().getProperty('KAKAO_REST_API_KEY');
    if (!key) return html_('스크립트 속성에 KAKAO_REST_API_KEY 를 먼저 등록하세요.');
    var url = KAUTH + '/oauth/authorize?response_type=code&scope=talk_message' +
      '&client_id=' + encodeURIComponent(key) +
      '&redirect_uri=' + encodeURIComponent(webAppUrl_());
    return html_('<a href="' + url + '" target="_top">👉 카카오 로그인으로 연결하기</a>' +
      '<p style="color:#666">Redirect URI로 등록할 주소: ' + webAppUrl_() + '</p>');
  }

  var connected = !!props_().getProperty('KAKAO_REFRESH_TOKEN');
  return html_(connected ? '카카오톡 알림 서버 동작 중 (연결됨)' :
    '아직 카카오톡이 연결되지 않았습니다. 주소 뒤에 ?setup=1 을 붙여 접속하세요.');
}

/* ------------------------------------------------------------------ *
 * POST: 홈페이지에서 아이디어 제출 시 호출
 * ------------------------------------------------------------------ */
function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var title = clean_(data.title, 60);
    var author = clean_(data.author, 30);
    var phone = clean_(data.phone, 20);
    var desc = clean_(data.desc, 80);
    if (!title || !author) return json_({ ok: false, error: 'invalid payload' });

    // 간단한 도배 방지
    var cache = CacheService.getScriptCache();
    if (cache.get('recent')) return json_({ ok: false, error: 'too many requests' });
    cache.put('recent', '1', MIN_INTERVAL_SEC);

    var text = '💡 새 예산 아이디어 제안\n\n' +
      '제목: ' + title + '\n' +
      '작성자: ' + author + (phone ? ' (' + phone + ')' : '') + '\n' +
      '내용: ' + desc;
    sendToMe_(text);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err.message || err) });
  }
}

/* ------------------------------------------------------------------ *
 * 카카오 API
 * ------------------------------------------------------------------ */
function sendToMe_(text) {
  if (text.length > MAX_TEXT) text = text.slice(0, MAX_TEXT - 1) + '…';
  var site = props_().getProperty('SITE_URL') || '';
  var template = {
    object_type: 'text',
    text: text,
    link: { web_url: site, mobile_web_url: site },
    button_title: '홈페이지 열기'
  };
  var res = UrlFetchApp.fetch(KAPI + '/v2/api/talk/memo/default/send', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + getAccessToken_() },
    payload: { template_object: JSON.stringify(template) },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('카카오 메시지 전송 실패: ' + res.getContentText());
  }
}

function getAccessToken_() {
  var p = props_();
  var token = p.getProperty('KAKAO_ACCESS_TOKEN');
  var exp = Number(p.getProperty('KAKAO_ACCESS_EXPIRES') || 0);
  if (token && Date.now() < exp - 60 * 1000) return token;

  var refresh = p.getProperty('KAKAO_REFRESH_TOKEN');
  if (!refresh) throw new Error('카카오톡이 연결되지 않았습니다. 웹 앱 주소에 ?setup=1 로 접속해 연결하세요.');

  var payload = {
    grant_type: 'refresh_token',
    client_id: p.getProperty('KAKAO_REST_API_KEY'),
    refresh_token: refresh
  };
  var secret = p.getProperty('KAKAO_CLIENT_SECRET');
  if (secret) payload.client_secret = secret;
  return saveTokens_(tokenRequest_(payload));
}

function exchangeCode_(code) {
  var p = props_();
  var payload = {
    grant_type: 'authorization_code',
    client_id: p.getProperty('KAKAO_REST_API_KEY'),
    redirect_uri: webAppUrl_(),
    code: code
  };
  var secret = p.getProperty('KAKAO_CLIENT_SECRET');
  if (secret) payload.client_secret = secret;
  saveTokens_(tokenRequest_(payload));
}

function tokenRequest_(payload) {
  var res = UrlFetchApp.fetch(KAUTH + '/oauth/token', {
    method: 'post',
    payload: payload,
    muteHttpExceptions: true
  });
  var body = JSON.parse(res.getContentText());
  if (res.getResponseCode() !== 200) {
    throw new Error(body.error_description || body.error || res.getContentText());
  }
  return body;
}

function saveTokens_(t) {
  var p = props_();
  p.setProperty('KAKAO_ACCESS_TOKEN', t.access_token);
  p.setProperty('KAKAO_ACCESS_EXPIRES', String(Date.now() + t.expires_in * 1000));
  // 리프레시 토큰은 만료가 가까울 때만 새로 내려오므로, 있을 때만 갱신
  if (t.refresh_token) p.setProperty('KAKAO_REFRESH_TOKEN', t.refresh_token);
  return t.access_token;
}

/* ------------------------------------------------------------------ *
 * 유틸 / 테스트
 * ------------------------------------------------------------------ */

/** 편집기에서 직접 실행해 카카오톡 알림이 오는지 확인하는 테스트 함수 */
function testSend() {
  sendToMe_('🔔 테스트 알림입니다. 카카오톡 연동이 정상 동작합니다.');
}

/**
 * 리프레시 토큰은 약 2개월 후 만료됩니다.
 * 이 함수를 "시간 기반 트리거(예: 매주 1회)"로 걸어 두면 토큰이 자동 갱신되어
 * 제안이 한동안 없어도 연결이 끊기지 않습니다.
 */
function keepAlive() {
  props_().deleteProperty('KAKAO_ACCESS_EXPIRES');
  getAccessToken_();
}

function clean_(v, max) {
  v = String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
  return v.length > max ? v.slice(0, max) + '…' : v;
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function html_(body) {
  return HtmlService.createHtmlOutput(
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<div style="font-family:sans-serif;padding:24px;line-height:1.6">' + body + '</div>');
}
