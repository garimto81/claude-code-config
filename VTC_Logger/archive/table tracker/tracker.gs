/**
 * tracker_gs.gs - Poker Tracker (Google Apps Script)
 *
 * VERSION: See version.js for current version
 * Do not modify version here - use version.js instead
 *
 * @see version.js - SINGLE SOURCE OF TRUTH for version info
 * @see docs/CHANGELOG.md - Full version history
 */

/* ===== 버전 관리 ===== */
// version.js에서 버전 정보 로드 (Google Apps Script 환경)
let TRACKER_VERSION = 'v3.6.3'; // Fallback version
try {
  // version.js가 같은 프로젝트에 있다면 로드 시도
  // Google Apps Script는 require() 미지원이므로 수동 동기화 필요
  TRACKER_VERSION = 'v3.6.3'; // version.js의 VERSION.current와 수동 동기화
} catch (e) {
  Logger.log('version.js 로드 실패, fallback 버전 사용: ' + TRACKER_VERSION);
}

/* ===== 설정 ===== */
const TYPE_SHEET_NAME = 'Type';
const PLAYER_PHOTOS_SHEET_NAME = 'PlayerPhotos';  // Phase 3.3: 사진 URL 영구 저장
const MAX_SEATS_PER_TABLE = 9;
const CACHE_TTL = 30000; // 30초 (Performance: 1초→30초, 캐시 히트율 80%)
const MAX_LOCK_WAIT = 10000; // 10초

/* ===== Imgur API 설정 (Phase 3.2) ===== */
// Imgur Anonymous Upload Client ID
// 테스트용 공개 Client ID (나중에 본인 ID로 교체 권장)
// 본인 ID 발급: https://imgur.com/account/settings/apps → Add application
const IMGUR_CLIENT_ID = '546c25a59c58ad7';

/* ===== 로깅 ===== */
const LOG_LEVEL = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
const CURRENT_LOG_LEVEL = LOG_LEVEL.INFO;

function log_(level, functionName, message, data = null) {
  if (level > CURRENT_LOG_LEVEL) return;

  const timestamp = new Date().toISOString();
  const levelName = Object.keys(LOG_LEVEL).find(k => LOG_LEVEL[k] === level);

  let logMsg = `[${timestamp}] [${levelName}] ${functionName}: ${message}`;
  if (data) logMsg += ` | ${JSON.stringify(data)}`;

  console.log(logMsg);
}

/* ===== 설정 관리 ===== */
const APP_SPREADSHEET_ID = '19e7eDjoZRFZooghZJF3XmOZzZcgmqsp9mFAfjvJWhj4';

function setupSpreadsheetId(spreadsheetId) {
  // 상수로 관리하므로 설정 불필요
  log_(LOG_LEVEL.INFO, 'setupSpreadsheetId', 'APP_SPREADSHEET_ID 상수 사용 중');
  return APP_SPREADSHEET_ID;
}

function getSpreadsheetId_() {
  return APP_SPREADSHEET_ID;
}

function appSS_() {
  return SpreadsheetApp.openById(APP_SPREADSHEET_ID);
}

/* ===== 입력 검증 ===== */
function validateTableId_(tableId) {
  const id = String(tableId || '').trim();

  if (!id) throw new Error('테이블 ID가 비어있습니다.');
  if (id.length > 50) throw new Error('테이블 ID가 너무 깁니다. (최대 50자)');
  if (!/^[A-Z0-9_-]+$/i.test(id)) {
    throw new Error('테이블 ID는 영문, 숫자, -, _ 만 사용 가능합니다.');
  }

  return id.toUpperCase();
}

function validateSeatNo_(seatNo) {
  const seat = normalizeSeat_(seatNo);

  if (!/^S[1-9]$/.test(seat)) {
    throw new Error('좌석 번호는 S1-S9 형식이어야 합니다.');
  }

  return seat;
}

function validatePlayerName_(name) {
  const n = String(name || '').trim();

  if (!n) throw new Error('플레이어 이름이 비어있습니다.');
  if (n.length > 100) throw new Error('플레이어 이름이 너무 깁니다. (최대 100자)');

  // XSS 방지
  const sanitized = n.replace(/<[^>]*>/g, '');

  return sanitized;
}

/**
 * Poker Room 이름 검증
 * @param {string} room - 검증할 Poker Room 이름
 * @return {string} 정제된 Poker Room 이름
 */
function validatePokerRoom_(room) {
  const r = String(room || '').trim();
  if (r.length > 50) {
    throw new Error('Poker Room 이름이 너무 깁니다 (최대 50자)');
  }
  // HTML 태그 제거 (XSS 방지)
  return r.replace(/<[^>]*>/g, '');
}

/**
 * Table Name 검증
 * @param {string} name - 검증할 Table Name
 * @return {string} 정제된 Table Name
 */
function validateTableName_(name) {
  const n = String(name || '').trim();
  if (n.length > 50) {
    throw new Error('Table Name이 너무 깁니다 (최대 50자)');
  }
  // HTML 태그 제거 (XSS 방지)
  return n.replace(/<[^>]*>/g, '');
}

function validateChips_(chips) {
  const c = toInt_(chips);

  if (c < 0) throw new Error('칩 수는 음수일 수 없습니다.');
  if (c > 10000000000) throw new Error('칩 수가 너무 큽니다.');

  return c;
}

function normalizeSeat_(seatNo) {
  let seat = String(seatNo || '').trim().toUpperCase();
  seat = seat.replace(/^S/i, '');

  if (/^\d+$/.test(seat)) {
    return 'S' + seat;
  }

  return 'S' + seat;
}

function normalizeSeatRaw_(seatNo) {
  return String(seatNo || '').trim().replace(/^S/i, '');
}

function toInt_(v) {
  if (v == null) return 0;
  const s = String(v).replace(/[^\d-]/g, '').trim();
  if (!s) return 0;
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

/* ===== 동시성 제어 ===== */
function withScriptLock_(fn) {
  const L = LockService.getScriptLock();
  const MAX_ATTEMPTS = 3;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      const waitTime = MAX_LOCK_WAIT * (i + 1);
      L.waitLock(waitTime);

      try {
        return fn();
      } finally {
        try { L.releaseLock(); }
        catch (e) { log_(LOG_LEVEL.WARN, 'withScriptLock_', 'Lock 해제 실패', e); }
      }

    } catch (e) {
      const backoff = 200 + 300 * i;
      Utilities.sleep(backoff);

      if (i === MAX_ATTEMPTS - 1) {
        throw new Error(`동시 접근 제한: 잠시 후 다시 시도하세요.`);
      }
    }
  }
}

/* ===== 캐싱 (Performance: CacheService + 30초 TTL) ===== */
let sheetCache = null;
let cacheTimestamp = 0;

function getSheetData_(forceRefresh = false) {
  const CACHE_KEY = 'sheetData_v1';
  const cache = CacheService.getScriptCache();

  // [Performance] CacheService 우선 조회 (다중 사용자 공유)
  if (!forceRefresh) {
    try {
      const cached = cache.get(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // sh (Sheet 객체)는 캐시 불가능하므로 매번 다시 가져옴
        const ss = appSS_();
        const sh = ss.getSheetByName(TYPE_SHEET_NAME);
        if (sh) {
          parsed.sh = sh;
          log_(LOG_LEVEL.INFO, 'getSheetData_', 'CacheService HIT');
          return parsed;
        }
      }
    } catch (e) {
      log_(LOG_LEVEL.WARN, 'getSheetData_', 'CacheService 읽기 실패', { error: e.message });
    }
  }

  // [Fallback] 메모리 캐시 조회 (동일 인스턴스 내)
  const now = Date.now();
  if (!forceRefresh && sheetCache && (now - cacheTimestamp < CACHE_TTL)) {
    log_(LOG_LEVEL.INFO, 'getSheetData_', '메모리 캐시 HIT');
    return sheetCache;
  }

  // 새로 읽기
  log_(LOG_LEVEL.INFO, 'getSheetData_', '시트 데이터 새로 읽기');
  const ss = appSS_();
  const sh = ss.getSheetByName(TYPE_SHEET_NAME);
  if (!sh) throw new Error('Type 시트가 없습니다.');

  const data = readAll_Optimized_(sh);

  // Type 시트 구조 (실시간 테이블 배치)
  // K열 Keyplayer는 헤더 무관하게 인덱스 10으로 고정
  // N열 PhotoURL은 헤더 무관하게 인덱스 13으로 고정 (읽기 전용, PlayerPhotos 우선)
  // Phase 3.6.3: PlayerType은 Type 시트에 없음 → PlayerPhotos 시트에서만 읽음
  const cols = {
    pokerRoom: findColIndex_(data.header, ['PokerRoom', 'Poker Room', 'poker_room']),
    tableName: findColIndex_(data.header, ['TableName', 'Table Name', 'table_name']),
    tableId: findColIndex_(data.header, ['TableId', 'Table Id', 'table_id']),
    tableNo: findColIndex_(data.header, ['TableNo', 'Table No.', 'table_no']),
    seatId: findColIndex_(data.header, ['SeatId', 'Seat Id', 'seat_id']),
    seatNo: findColIndex_(data.header, ['SeatNo', 'Seat No.', 'Seat', 'seat_no']),
    playerId: findColIndex_(data.header, ['PlayerId', 'Player Id', 'player_id']),
    playerName: findColIndex_(data.header, ['PlayerName', 'Player Name', 'Players', 'Player', 'Name']),
    nationality: findColIndex_(data.header, ['Nationality', 'Nation', 'Country']),
    chipCount: findColIndex_(data.header, ['ChipCount', 'Chips', 'Stack', 'Starting Chips']),
    keyplayer: 10,     // K열 고정 (헤더 이름 무관)
    photoUrl: 13       // N열 고정 (Phase 3.1, 레거시)
  };

  // 디버깅: 헤더와 첫 번째 데이터 행 확인
  log_(LOG_LEVEL.INFO, 'getSheetData_', 'Type 시트 구조 확인', {
    totalColumns: data.header.length,
    headerN: data.header[13],
    firstRowN: data.rows.length > 0 ? data.rows[0][13] : 'NO_DATA'
  });

  if (cols.tableNo === -1 || cols.seatNo === -1 || cols.playerName === -1) {
    throw new Error('Type 시트에 필수 컬럼(TableNo, SeatNo, PlayerName)이 없습니다.');
  }

  const result = { sh, data, cols };

  // [Performance] CacheService에 저장 (TTL: 30초)
  try {
    // sh는 직렬화 불가능하므로 제외
    const cacheData = { data, cols };
    cache.put(CACHE_KEY, JSON.stringify(cacheData), Math.floor(CACHE_TTL / 1000));
  } catch (e) {
    log_(LOG_LEVEL.WARN, 'getSheetData_', 'CacheService 쓰기 실패', { error: e.message });
  }

  // 메모리 캐시에도 저장
  sheetCache = result;
  cacheTimestamp = now;

  return result;
}

function invalidateCache_() {
  // 메모리 캐시 무효화
  sheetCache = null;

  // CacheService 캐시 무효화
  try {
    const cache = CacheService.getScriptCache();
    cache.remove('sheetData_v1');
    log_(LOG_LEVEL.INFO, 'invalidateCache_', 'CacheService 캐시 제거 완료');
  } catch (e) {
    log_(LOG_LEVEL.WARN, 'invalidateCache_', 'CacheService 제거 실패', { error: e.message });
  }
}

/* ===== 최적화된 시트 읽기 ===== */
function readAll_Optimized_(sh) {
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();

  if (lastRow < 1 || lastCol < 1) {
    return { header: [], rows: [], map: {} };
  }

  const values = sh.getRange(1, 1, lastRow, lastCol).getValues();

  if (values.length < 2) {
    return { header: values[0] || [], rows: [], map: {} };
  }

  // Phase 3.6.2: "Confirmed Players" 제목 행 자동 스킵
  let headerRowIndex = 0;
  if (values[0][0] === 'Confirmed Players' || String(values[0][0]).includes('Confirmed')) {
    log_(LOG_LEVEL.INFO, 'readAll_Optimized_', '제목 행 감지, Row 2를 헤더로 사용');
    headerRowIndex = 1;
  }

  const header = values[headerRowIndex];
  const rows = values.slice(headerRowIndex + 1);
  const map = {};
  header.forEach((h, i) => map[String(h).trim()] = i);

  return { header, rows, map };
}

function findColIndex_(headerRow, aliases) {
  return headerRow.findIndex(h =>
    aliases.some(a => String(h).trim().toLowerCase() === a.toLowerCase())
  );
}

/* ===== 공통 헬퍼 ===== */
function findPlayerRow_(data, cols, tableId, seatNo) {
  // TableNo, SeatNo는 이제 숫자형
  const tableNum = toInt_(tableId);
  const seatNum = toInt_(seatNo);

  return data.rows.findIndex(r => {
    const tableMatch = toInt_(r[cols.tableNo]) === tableNum;
    const seatMatch = toInt_(r[cols.seatNo]) === seatNum;
    return tableMatch && seatMatch;
  });
}

/* ===== 표준 응답 ===== */
function successResponse_(data = {}) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: TRACKER_VERSION
    }
  };
}

function errorResponse_(functionName, error) {
  const errorId = Utilities.getUuid();

  log_(LOG_LEVEL.ERROR, functionName, error.message || error, { errorId });

  return {
    success: false,
    error: {
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      errorId
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: TRACKER_VERSION
    }
  };
}

/* ===== PlayerPhotos 시트 관리 (Phase 3.3) ===== */

/**
 * PlayerPhotos 시트 초기화 (없으면 생성)
 * @return {Sheet} PlayerPhotos 시트 객체
 */
function ensurePlayerPhotosSheet_() {
  const ss = appSS_();
  let sheet = ss.getSheetByName(PLAYER_PHOTOS_SHEET_NAME);

  if (!sheet) {
    // 시트 생성
    sheet = ss.insertSheet(PLAYER_PHOTOS_SHEET_NAME);

    // 헤더 설정 (Phase 3.6.0: PlayerType D열 추가)
    const headers = ['PlayerName', 'PhotoURL', 'CreatedAt', 'PlayerType', 'Introduction', 'DisplayOrder', 'UpdatedAt'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // 헤더 스타일 (굵게, 배경색)
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');

    // 컬럼 너비 조정
    sheet.setColumnWidth(1, 150); // PlayerName
    sheet.setColumnWidth(2, 300); // PhotoURL
    sheet.setColumnWidth(3, 180); // CreatedAt
    sheet.setColumnWidth(4, 120); // PlayerType (드롭다운)
    sheet.setColumnWidth(5, 120); // Introduction
    sheet.setColumnWidth(6, 100); // DisplayOrder
    sheet.setColumnWidth(7, 180); // UpdatedAt

    // D열 PlayerType 드롭다운 설정 (Core/Key player/Feature)
    const playerTypeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Core', 'Key player', 'Feature'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, 4, 1000, 1).setDataValidation(playerTypeRule); // D2:D1001

    log_(LOG_LEVEL.INFO, 'ensurePlayerPhotosSheet_', 'PlayerPhotos 시트 생성 완료 (PlayerType 드롭다운 포함)');
  }

  // Phase 3.6.0: 기존 시트 마이그레이션 (4열→7열)
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();

  // Step 1: 4열 시트 (PlayerName, PhotoURL, CreatedAt, UpdatedAt)
  if (lastCol === 4) {
    // G열에 UpdatedAt 이동 (D→G)
    if (lastRow > 1) {
      const updatedAtData = sheet.getRange(2, 4, lastRow - 1, 1).getValues(); // D열 데이터
      sheet.insertColumnAfter(6); // G열 생성
      sheet.getRange(2, 7, lastRow - 1, 1).setValues(updatedAtData); // G열에 복사
    }
    sheet.getRange(1, 7).setValue('UpdatedAt');
    sheet.getRange(1, 7).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    sheet.setColumnWidth(7, 180);

    // D열에 PlayerType 추가
    sheet.getRange(1, 4).setValue('PlayerType');
    sheet.getRange(1, 4).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    sheet.setColumnWidth(4, 120);
    if (lastRow > 1) {
      const defaultValues = Array(lastRow - 1).fill(['Key player']); // 기본값
      sheet.getRange(2, 4, lastRow - 1, 1).setValues(defaultValues);
    }

    // E열에 Introduction 추가
    sheet.insertColumnAfter(4); // E열 생성
    sheet.getRange(1, 5).setValue('Introduction');
    sheet.getRange(1, 5).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    sheet.setColumnWidth(5, 120);
    if (lastRow > 1) {
      const defaultValues = Array(lastRow - 1).fill([false]);
      sheet.getRange(2, 5, lastRow - 1, 1).setValues(defaultValues);
    }

    // F열에 DisplayOrder 추가
    sheet.insertColumnAfter(5); // F열 생성
    sheet.getRange(1, 6).setValue('DisplayOrder');
    sheet.getRange(1, 6).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    sheet.setColumnWidth(6, 100);
    if (lastRow > 1) {
      const defaultValues = Array(lastRow - 1).fill([0]);
      sheet.getRange(2, 6, lastRow - 1, 1).setValues(defaultValues);
    }

    // D열 드롭다운 설정
    const playerTypeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Core', 'Key player', 'Feature'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, 4, 1000, 1).setDataValidation(playerTypeRule);

    log_(LOG_LEVEL.INFO, 'ensurePlayerPhotosSheet_', '4열→7열 마이그레이션 완료 (PlayerType 드롭다운 포함)');
  }

  // Step 2: 6열 시트 (PlayerName, PhotoURL, CreatedAt, UpdatedAt, Introduction, DisplayOrder)
  // → 7열 시트 (PlayerName, PhotoURL, CreatedAt, PlayerType, Introduction, DisplayOrder, UpdatedAt)
  if (lastCol === 6) {
    // G열에 UpdatedAt 이동 (D→G)
    if (lastRow > 1) {
      const updatedAtData = sheet.getRange(2, 4, lastRow - 1, 1).getValues(); // D열 데이터
      sheet.insertColumnAfter(6); // G열 생성
      sheet.getRange(2, 7, lastRow - 1, 1).setValues(updatedAtData); // G열에 복사
    }
    sheet.getRange(1, 7).setValue('UpdatedAt');
    sheet.getRange(1, 7).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    sheet.setColumnWidth(7, 180);

    // D열에 PlayerType 추가
    sheet.getRange(1, 4).setValue('PlayerType');
    sheet.getRange(1, 4).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    sheet.setColumnWidth(4, 120);
    if (lastRow > 1) {
      const defaultValues = Array(lastRow - 1).fill(['Key player']); // 기본값
      sheet.getRange(2, 4, lastRow - 1, 1).setValues(defaultValues);
    }

    // E→F, F→G 이동 (Introduction, DisplayOrder 위치 조정)
    // 이미 G열에 UpdatedAt이 있으므로 E, F만 확인
    sheet.getRange(1, 5).setValue('Introduction');
    sheet.getRange(1, 6).setValue('DisplayOrder');

    // D열 드롭다운 설정
    const playerTypeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Core', 'Key player', 'Feature'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, 4, 1000, 1).setDataValidation(playerTypeRule);

    log_(LOG_LEVEL.INFO, 'ensurePlayerPhotosSheet_', '6열→7열 마이그레이션 완료 (PlayerType 드롭다운 포함)');
  }

  return sheet;
}

/**
 * PlayerPhotos Map 캐시 (PropertiesService, 10분 TTL)
 * @return {Object} { playerName: { photoUrl, playerType, introduction, displayOrder } } Map
 */
function getAllPlayerPhotosMap_Cached() {
  const cache = PropertiesService.getScriptProperties();
  const cacheKey = 'playerPhotosMap_cache_v1';
  const cacheTimeKey = 'playerPhotosMap_cacheTime_v1';
  const CACHE_TTL = 10 * 60 * 1000; // 10분

  try {
    // 캐시 확인
    const cachedData = cache.getProperty(cacheKey);
    const cachedTime = cache.getProperty(cacheTimeKey);

    if (cachedData && cachedTime) {
      const age = Date.now() - parseInt(cachedTime);
      if (age < CACHE_TTL) {
        const cacheAgeSeconds = Math.round(age / 1000);
        log_(LOG_LEVEL.INFO, 'getAllPlayerPhotosMap_Cached', '[Cache HIT] Age: ' + cacheAgeSeconds + 's');
        return JSON.parse(cachedData);
      } else {
        log_(LOG_LEVEL.INFO, 'getAllPlayerPhotosMap_Cached', '[Cache EXPIRED] Age: ' + Math.round(age / 1000) + 's');
      }
    }

    // 캐시 미스: Sheets에서 로드
    log_(LOG_LEVEL.INFO, 'getAllPlayerPhotosMap_Cached', '[Cache MISS] Fetching from Sheets');
    const photoMap = getAllPlayerPhotosMap_Raw_();

    // 캐시 저장 (최대 9KB 제한 고려)
    try {
      cache.setProperties({
        [cacheKey]: JSON.stringify(photoMap),
        [cacheTimeKey]: String(Date.now())
      });
      log_(LOG_LEVEL.INFO, 'getAllPlayerPhotosMap_Cached', '[Cache SAVED] Entries: ' + Object.keys(photoMap).length);
    } catch (cacheError) {
      log_(LOG_LEVEL.WARN, 'getAllPlayerPhotosMap_Cached', '[Cache SAVE FAILED] ' + cacheError.message);
    }

    return photoMap;

  } catch (e) {
    log_(LOG_LEVEL.WARN, 'getAllPlayerPhotosMap_Cached', '[Cache ERROR] Fallback to direct fetch: ' + e.message);
    return getAllPlayerPhotosMap_Raw_();
  }
}

/**
 * 캐시 무효화 (사진/타입 업데이트 시 호출)
 */
function invalidatePlayerPhotosCache_() {
  try {
    const cache = PropertiesService.getScriptProperties();
    cache.deleteProperty('playerPhotosMap_cache_v1');
    cache.deleteProperty('playerPhotosMap_cacheTime_v1');
    log_(LOG_LEVEL.INFO, 'invalidatePlayerPhotosCache_', '[Cache INVALIDATED]');
  } catch (e) {
    log_(LOG_LEVEL.WARN, 'invalidatePlayerPhotosCache_', 'Failed to invalidate cache: ' + e.message);
  }
}

/**
 * PlayerPhotos 시트 전체를 Map으로 배치 로딩 (Raw, 캐시 없음)
 * @return {Object} { playerName: { photoUrl, playerType, introduction, displayOrder } } Map
 * @private
 */
function getAllPlayerPhotosMap_Raw_() {
  try {
    const sheet = ensurePlayerPhotosSheet_();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow < 2) return {}; // 데이터 없음

    // Phase 3.6.0: 7열 구조 (PlayerName, PhotoURL, CreatedAt, PlayerType, Introduction, DisplayOrder, UpdatedAt)
    const colsToRead = Math.min(7, lastCol);
    const data = sheet.getRange(2, 1, lastRow - 1, colsToRead).getValues();
    const photoMap = {};

    // 🔍 DEBUG: 헤더 확인 (참고용)
    const headers = sheet.getRange(1, 1, 1, colsToRead).getValues()[0];
    log_(LOG_LEVEL.DEBUG, 'getAllPlayerPhotosMap_Raw_', '[DEBUG] Headers: ' + JSON.stringify(headers));

    let debugCount = 0;
    data.forEach(row => {
      const playerName = String(row[0] || '').trim();
      const photoUrl = String(row[1] || '').trim();
      // D열(인덱스 3): PlayerType 강제 지정 (헤더 체크 없이)
      const playerType = row.length >= 4 && row[3]
        ? String(row[3]).trim()
        : 'Key player'; // 기본값
      // E열(인덱스 4): Introduction (TRUE/FALSE)
      const introduction = row.length >= 5 && (row[4] === true || String(row[4]).toUpperCase() === 'TRUE');
      // F열(인덱스 5): DisplayOrder
      const displayOrder = row.length >= 6 ? toInt_(row[5]) : 0;
      if (playerName) {
        photoMap[playerName] = {
          photoUrl: photoUrl,
          playerType: playerType,       // D열 (Phase 3.6.0)
          introduction: introduction,    // E열
          displayOrder: displayOrder     // F열
        };

        // 🔍 DEBUG: 첫 5개 엔트리 로그
        if (debugCount < 5) {
          log_(LOG_LEVEL.DEBUG, 'getAllPlayerPhotosMap_Raw_', '[DEBUG] PhotoMap Entry #' + (debugCount + 1) + ': ' + playerName + ' → Type: "' + playerType + '" (D열 원본: "' + row[3] + '")');
          debugCount++;
        }
      }
    });

    log_(LOG_LEVEL.INFO, 'getAllPlayerPhotosMap_Raw_', 'Photo Map 생성 완료', { count: Object.keys(photoMap).length });
    return photoMap;

  } catch (e) {
    log_(LOG_LEVEL.WARN, 'getAllPlayerPhotosMap_Raw_', 'Photo Map 생성 실패', { error: e.message });
    return {};
  }
}

/**
 * PlayerPhotos 시트 전체를 Map으로 배치 로딩 (레거시 호환용)
 * @return {Object} { playerName: { photoUrl, playerType, introduction, displayOrder } } Map
 * @deprecated Use getAllPlayerPhotosMap_Cached() for better performance
 */
function getAllPlayerPhotosMap_() {
  return getAllPlayerPhotosMap_Cached();
}

/**
 * PlayerPhotos 시트에서 사진 URL 조회 (개별 조회용, 레거시)
 * @param {string} playerName - 플레이어 이름
 * @return {string} 사진 URL (없으면 '')
 * @deprecated 배치 조회는 getAllPlayerPhotosMap_() 사용 권장
 */
function getPlayerPhotoUrl_(playerName) {
  try {
    const sheet = ensurePlayerPhotosSheet_();
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) return ''; // 데이터 없음

    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();

    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(playerName).trim()) {
        return String(data[i][1]).trim();
      }
    }

    return ''; // 매칭 없음

  } catch (e) {
    log_(LOG_LEVEL.WARN, 'getPlayerPhotoUrl_', 'URL 조회 실패', { playerName, error: e.message });
    return '';
  }
}

/**
 * PlayerPhotos 시트에 사진 URL 저장 (UPSERT)
 * @param {string} playerName - 플레이어 이름
 * @param {string} photoUrl - 사진 URL
 * @return {boolean} 성공 여부
 */
function setPlayerPhotoUrl_(playerName, photoUrl) {
  try {
    const sheet = ensurePlayerPhotosSheet_();
    const now = new Date().toISOString();
    const validName = validatePlayerName_(playerName);
    const validUrl = String(photoUrl || '').trim();

    if (validUrl && !validUrl.startsWith('https://')) {
      throw new Error('사진 URL은 HTTPS로 시작해야 합니다.');
    }

    const lastRow = sheet.getLastRow();
    let targetRow = -1;

    // 기존 행 찾기
    if (lastRow >= 2) {
      const names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < names.length; i++) {
        if (String(names[i][0]).trim() === validName) {
          targetRow = i + 2;
          break;
        }
      }
    }

    if (targetRow !== -1) {
      // UPDATE: 기존 행 업데이트
      sheet.getRange(targetRow, 2).setValue(validUrl);  // B열 PhotoURL
      sheet.getRange(targetRow, 7).setValue(now);       // G열 UpdatedAt (Phase 3.6.0)
      log_(LOG_LEVEL.INFO, 'setPlayerPhotoUrl_', 'URL 업데이트', { playerName: validName, row: targetRow });
    } else {
      // INSERT: 새 행 추가 (Phase 3.6.0: 7열 구조)
      // A: PlayerName, B: PhotoURL, C: CreatedAt, D: PlayerType, E: Introduction, F: DisplayOrder, G: UpdatedAt
      sheet.appendRow([validName, validUrl, now, 'Key player', false, 0, now]);
      log_(LOG_LEVEL.INFO, 'setPlayerPhotoUrl_', 'URL 추가', { playerName: validName });
    }

    return true;

  } catch (e) {
    log_(LOG_LEVEL.ERROR, 'setPlayerPhotoUrl_', 'URL 저장 실패', { playerName, error: e.message });
    return false;
  }
}

/* ===== 플레이어 사진 관리 (Phase 3.1-3.2) ===== */

/**
 * Imgur에 이미지 업로드 (Anonymous Upload API)
 * @param {string} playerName - 플레이어 이름 (메타데이터용)
 * @param {string} base64Image - Base64 인코딩된 이미지 데이터
 * @return {Object} 업로드 결과 {success, data: {imgurUrl}}
 */
function uploadToImgur(playerName, base64Image) {
  return withScriptLock_(() => {
    try {
      log_(LOG_LEVEL.INFO, 'uploadToImgur', '이미지 업로드 시작', { playerName });

      // Client ID 검증
      if (!IMGUR_CLIENT_ID || IMGUR_CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
        throw new Error('Imgur Client ID가 설정되지 않았습니다. tracker_gs.js의 IMGUR_CLIENT_ID를 설정하세요.');
      }

      // Base64 검증
      if (!base64Image || base64Image.length < 100) {
        throw new Error('유효하지 않은 이미지 데이터입니다.');
      }

      // Imgur API 호출 (Form-urlencoded payload)
      const payload = 'image=' + encodeURIComponent(base64Image) +
                      '&type=base64' +
                      '&name=' + encodeURIComponent(playerName) +
                      '&title=' + encodeURIComponent(playerName + ' - Poker Tracker');

      const response = UrlFetchApp.fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID ' + IMGUR_CLIENT_ID,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        payload: payload,
        muteHttpExceptions: true
      });

      const statusCode = response.getResponseCode();
      const json = JSON.parse(response.getContentText());

      log_(LOG_LEVEL.INFO, 'uploadToImgur', 'Imgur API 응답', {
        statusCode,
        success: json.success
      });

      if (statusCode !== 200 || !json.success) {
        const errorMsg = json.data && json.data.error
          ? json.data.error
          : 'Imgur 업로드 실패';
        throw new Error(errorMsg);
      }

      const imgurUrl = json.data.link; // https://i.imgur.com/abc123.jpg
      const deleteHash = json.data.deletehash; // 삭제용 (옵션)

      log_(LOG_LEVEL.INFO, 'uploadToImgur', '업로드 완료', { imgurUrl });

      // PlayerPhotos 시트에 자동 저장 (Phase 3.3)
      const saved = setPlayerPhotoUrl_(playerName, imgurUrl);

      if (!saved) {
        log_(LOG_LEVEL.WARN, 'uploadToImgur', 'PlayerPhotos 저장 실패');
      }

      return successResponse_({
        imgurUrl,
        deleteHash,
        saved
      });

    } catch (e) {
      return errorResponse_('uploadToImgur', e);
    }
  });
}

/**
 * PlayerPhotos 시트에 사진 URL 업데이트 (Phase 3.3 리팩토링)
 * @param {string} playerName - 플레이어 이름
 * @param {string} photoUrl - HTTPS 사진 URL
 */
function updateKeyPlayerPhoto(playerName, photoUrl) {
  return withScriptLock_(() => {
    try {
      log_(LOG_LEVEL.INFO, 'updateKeyPlayerPhoto', '사진 업데이트 시작', { playerName, photoUrl });

      // 검증
      const validName = validatePlayerName_(playerName);
      const validUrl = String(photoUrl || '').trim();

      if (validUrl && !validUrl.startsWith('https://')) {
        throw new Error('사진 URL은 HTTPS로 시작해야 합니다.');
      }

      // PlayerPhotos 시트에 저장 (UPSERT)
      const saved = setPlayerPhotoUrl_(validName, validUrl);

      if (!saved) {
        throw new Error('PlayerPhotos 시트에 저장 실패');
      }

      // 캐시 무효화 (즉시 반영)
      invalidatePlayerPhotosCache_();

      log_(LOG_LEVEL.INFO, 'updateKeyPlayerPhoto', '사진 URL 업데이트 완료 (캐시 무효화)', { playerName: validName });

      return successResponse_({ playerName: validName, photoUrl: validUrl });

    } catch (e) {
      return errorResponse_('updateKeyPlayerPhoto', e);
    }
  });
}

/* ===== Firebase 통합 (향후 구현 예정) ===== */
// TODO: Firebase Realtime Database 연동 (Phase 4.0)
// - 실시간 데이터 동기화
// - 브라우저 직접 읽기 (Apps Script Proxy 제거)
// - WebSocket 기반 실시간 업데이트

/* ===== 읽기 함수 ===== */

/**
 * 키 플레이어 목록 반환 (사진 포함, Phase 3.3 PlayerPhotos JOIN)
 * Performance: 배치 로딩으로 N+1 쿼리 제거 (10명 기준 2.5초→0.3초)
 */
function getKeyPlayers() {
  try {
    log_(LOG_LEVEL.INFO, 'getKeyPlayers', '키 플레이어 조회 시작');

    const { data, cols } = getSheetData_();

    // [Performance] PlayerPhotos 전체를 1회 배치 로딩
    const photoMap = getAllPlayerPhotosMap_();

    // Phase 3.6.3: 테이블 레벨 타입 전파 (PlayerPhotos 시트 기준)
    const featureTables = new Set();
    const coreTables = new Set();
    let debugCount = 0;

    data.rows.forEach(row => {
      const isKey = row[cols.keyplayer] === true || String(row[cols.keyplayer]).toUpperCase() === 'TRUE';
      if (!isKey) return;

      const playerName = String(row[cols.playerName] || '').trim();
      const tableName = cols.tableName !== -1 ? String(row[cols.tableName] || '').trim() : '';
      let tableNo = cols.tableNo !== -1 ? toInt_(row[cols.tableNo]) : 0;

      // Phase 3.6.3: TableName="feature"면 가상 테이블 번호
      const isFeatureTable = tableName.toLowerCase() === 'feature';
      if (isFeatureTable && tableNo > 0) {
        tableNo = 1000 + tableNo;
      }

      // PlayerPhotos에서 PlayerType 읽기
      const playerData = photoMap[playerName] || { playerType: 'Key player' };
      const playerType = playerData.playerType || 'Key player';

      // 🔍 DEBUG: 타입 체크
      if (debugCount < 3) {
        log_(LOG_LEVEL.DEBUG, 'getKeyPlayers', '[DEBUG] Type Check: ' + playerName + ' → TableName: "' + tableName + '" → PlayerPhotos Type: "' + playerType + '" → Table: ' + tableNo);
        debugCount++;
      }

      if (tableNo > 0) {
        if (playerType === 'Feature' || isFeatureTable || tableName.toLowerCase() === 'feature') {
          featureTables.add(tableNo);
          log_(LOG_LEVEL.DEBUG, 'getKeyPlayers', '[DEBUG] Feature Table 추가: Table #' + tableNo + ' (Player: ' + playerName + ', TableName: ' + tableName + ')');
        } else if (playerType === 'Core' || tableName.toLowerCase() === 'core') {
          coreTables.add(tableNo);
          log_(LOG_LEVEL.DEBUG, 'getKeyPlayers', '[DEBUG] Core Table 추가: Table #' + tableNo + ' (Player: ' + playerName + ', TableName: ' + tableName + ')');
        }
      }
    });

    log_(LOG_LEVEL.INFO, 'getKeyPlayers', '테이블 타입 식별 완료', {
      featureTables: Array.from(featureTables),
      coreTables: Array.from(coreTables)
    });

    const players = data.rows
      .filter(row => {
        // K열(인덱스 10) 값 확인
        const isKey = row[cols.keyplayer] === true ||
          String(row[cols.keyplayer]).toUpperCase() === 'TRUE';
        return isKey;
      })
      .map((row, index) => {
        const playerName = String(row[cols.playerName] || '').trim();
        const tableName = cols.tableName !== -1 ? String(row[cols.tableName] || '').trim() : '';
        let tableNo = cols.tableNo !== -1 ? toInt_(row[cols.tableNo]) : 0;

        // Phase 3.6.3: 가상 테이블 번호 (TableName="feature"인 경우 충돌 방지)
        const isFeatureTable = tableName.toLowerCase() === 'feature';
        const originalTableNo = tableNo;
        if (isFeatureTable && tableNo > 0) {
          tableNo = 1000 + tableNo; // 1→1001, 2→1002
          log_(LOG_LEVEL.DEBUG, 'getKeyPlayers', '[VIRTUAL TABLE] ' + playerName + ': T' + originalTableNo + ' (feature) → Virtual T' + tableNo);
        }

        // PlayerPhotos에서 PlayerType 읽기 (Phase 3.6.2)
        const playerData = photoMap[playerName] || { photoUrl: '', playerType: 'Key player', introduction: false, displayOrder: 0 };
        const photoUrl = playerData.photoUrl || '';
        let playerType = playerData.playerType || 'Key player';
        const isIntroduced = playerData.introduction || false;
        const displayOrder = playerData.displayOrder || (index + 1);

        // Phase 3.6.3: Feature 테이블은 자동으로 PlayerType="Feature" 설정
        if (isFeatureTable) {
          playerType = 'Feature';
        }

        // Phase 3.6.2: 테이블 레벨 타입 전파 (우선순위: Feature > Core)
        if (featureTables.has(tableNo)) {
          playerType = 'Feature';
        } else if (coreTables.has(tableNo)) {
          playerType = 'Core';
        }

        // 🔍 DEBUG: 최종 플레이어 객체 (첫 5개)
        if (index < 5) {
          log_(LOG_LEVEL.DEBUG, 'getKeyPlayers', '[DEBUG] Final Player #' + (index + 1) + ': ' + playerName + ' → TableName: "' + tableName + '" → Table: ' + tableNo + ' → Type: "' + playerType + '"');
        }

        return {
          pokerRoom: cols.pokerRoom !== -1 ? validatePokerRoom_(row[cols.pokerRoom]) : '',
          tableName: tableName,
          tableId: cols.tableId !== -1 ? toInt_(row[cols.tableId]) : 0,
          tableNo: tableNo,              // 가상 테이블 번호 적용
          originalTableNo: originalTableNo, // 원본 테이블 번호 보존
          seatId: cols.seatId !== -1 ? toInt_(row[cols.seatId]) : 0,
          seatNo: cols.seatNo !== -1 ? toInt_(row[cols.seatNo]) : 0,
          playerId: cols.playerId !== -1 ? toInt_(row[cols.playerId]) : 0,
          playerName: playerName,
          nationality: cols.nationality !== -1 ? String(row[cols.nationality] || '').trim() : '',
          chipCount: cols.chipCount !== -1 ? toInt_(row[cols.chipCount]) : 0,
          photoUrl: photoUrl,           // PlayerPhotos 시트 B열
          playerType: playerType,       // PlayerPhotos 시트 D열 또는 Feature 테이블
          introduction: isIntroduced,   // PlayerPhotos 시트 E열
          displayOrder: displayOrder    // PlayerPhotos 시트 F열
        };
      })
      .filter(p => {
        // Phase 3.6.1: Feature 플레이어도 포함하여 반환 (클라이언트에서 분리 렌더링)
        return p.tableNo > 0 && p.seatNo > 0 && p.playerName;
      })
      .sort((a, b) => {
        // Phase 3.6.3: TableName (최우선) → PlayerType → Table 번호 → Introduction → DisplayOrder → PlayerName

        // 1. TableName 알파벳 순 (최우선 그룹핑)
        const aTableName = (a.tableName || '').toLowerCase();
        const bTableName = (b.tableName || '').toLowerCase();
        if (aTableName !== bTableName) {
          return aTableName.localeCompare(bTableName);
        }

        // 2. PlayerType 우선순위 (Core > Key player > Feature)
        // 타입값이 없으면 'Key player'로 처리
        const playerTypeOrder = { 'Core': 1, 'Key player': 2, 'Feature': 3 };
        const aTypeOrder = playerTypeOrder[a.playerType] || 2; // 기본값: Key player
        const bTypeOrder = playerTypeOrder[b.playerType] || 2; // 기본값: Key player
        if (aTypeOrder !== bTypeOrder) {
          return aTypeOrder - bTypeOrder;
        }

        // 3. 테이블 번호 (같은 TableName, PlayerType 내에서 순차 정렬)
        if (a.tableNo !== b.tableNo) {
          return a.tableNo - b.tableNo;
        }

        // 4. Introduction 우선순위 (체크된 플레이어 먼저)
        const hasIntroduction = a.introduction !== undefined || b.introduction !== undefined;
        if (hasIntroduction) {
          if (a.introduction !== b.introduction) {
            return b.introduction ? 1 : -1; // true가 앞으로
          }
        }

        // 5. DisplayOrder 오름차순
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }

        // 6. PlayerName 알파벳 순 (최종 정렬)
        return a.playerName.localeCompare(b.playerName);
      });

    log_(LOG_LEVEL.INFO, 'getKeyPlayers', '키 플레이어 조회 완료', {
      count: players.length,
      firstPlayerPhotoUrl: players.length > 0 ? players[0].photoUrl : 'N/A'
    });

    return successResponse_({ players, count: players.length });

  } catch (e) {
    return errorResponse_('getKeyPlayers', e);
  }
}

/**
 * 테이블 플레이어 목록 반환
 */
function getTablePlayers(tableId) {
  try {
    log_(LOG_LEVEL.INFO, 'getTablePlayers', '테이블 플레이어 조회 시작', { tableId });

    const tableNum = toInt_(tableId);
    const { data, cols } = getSheetData_();

    const playersMap = {};

    data.rows.forEach(row => {
      const t = toInt_(row[cols.tableNo]);
      if (t !== tableNum) return;

      const seatNum = toInt_(row[cols.seatNo]);

      const playerName = String(row[cols.playerName] || '').trim();
      const nationality = cols.nationality !== -1 ? String(row[cols.nationality] || '').trim() : '';
      const chipCount = cols.chipCount !== -1 ? toInt_(row[cols.chipCount]) : 0;
      // K열(인덱스 10) 값 확인
      const keyplayer = row[cols.keyplayer] === true ||
        String(row[cols.keyplayer]).toUpperCase() === 'TRUE';

      if (seatNum > 0 && playerName) {
        const pokerRoom = cols.pokerRoom !== -1 ? validatePokerRoom_(row[cols.pokerRoom]) : '';
        const tableName = cols.tableName !== -1 ? validateTableName_(row[cols.tableName]) : '';
        const tableId = cols.tableId !== -1 ? toInt_(row[cols.tableId]) : 0;
        const seatId = cols.seatId !== -1 ? toInt_(row[cols.seatId]) : 0;
        const playerId = cols.playerId !== -1 ? toInt_(row[cols.playerId]) : 0;

        playersMap[seatNum] = {
          pokerRoom, tableName, tableId, tableNo: tableNum,
          seatId, seatNo: seatNum,
          playerId, playerName, nationality, chipCount, keyplayer
        };
      }
    });

    const players = [];
    for (let i = 1; i <= MAX_SEATS_PER_TABLE; i++) {
      if (playersMap[i]) {
        players.push(playersMap[i]);
      } else {
        players.push({ tableNo: tableNum, seatNo: i, empty: true });
      }
    }

    log_(LOG_LEVEL.INFO, 'getTablePlayers', '테이블 플레이어 조회 완료', { tableId, count: players.length });

    return successResponse_({ players, count: players.length });

  } catch (e) {
    return errorResponse_('getTablePlayers', e);
  }
}

/* ===== 쓰기 함수 ===== */

/**
 * 플레이어 칩 수정
 */
function updatePlayerChips(tableId, seatNo, newChips) {
  return withScriptLock_(() => {
    try {
      log_(LOG_LEVEL.INFO, 'updatePlayerChips', '칩 업데이트 시작', { tableId, seatNo, newChips });

      const validTableId = validateTableId_(tableId);
      const validSeatNo = validateSeatNo_(seatNo);
      const validChips = validateChips_(newChips);

      const { sh, data, cols } = getSheetData_(true);

      const rowIndex = findPlayerRow_(data, cols, validTableId, validSeatNo);

      if (rowIndex === -1) {
        throw new Error('플레이어를 찾을 수 없습니다.');
      }

      const actualRow = rowIndex + 2;
      sh.getRange(actualRow, cols.chipCount + 1).setValue(validChips);

      invalidateCache_();

      log_(LOG_LEVEL.INFO, 'updatePlayerChips', '칩 업데이트 완료');

      return successResponse_();

    } catch (e) {
      return errorResponse_('updatePlayerChips', e);
    }
  });
}

/**
 * 플레이어 추가
 */
function addPlayer(tableId, seatNo, name, nation, chips, isKey) {
  return withScriptLock_(() => {
    try {
      log_(LOG_LEVEL.INFO, 'addPlayer', '플레이어 추가 시작', { tableId, seatNo, name });

      const validTableId = validateTableId_(tableId);
      const validSeatNo = validateSeatNo_(seatNo);
      const validName = validatePlayerName_(name);
      const validChips = validateChips_(chips);

      const { sh, data, cols } = getSheetData_(true);

      const exists = findPlayerRow_(data, cols, validTableId, validSeatNo) !== -1;
      if (exists) {
        throw new Error('해당 좌석에 이미 플레이어가 있습니다.');
      }

      const row = new Array(data.header.length).fill('');
      // Seats.csv 구조 (11개 컬럼)
      if (cols.pokerRoom !== -1) row[cols.pokerRoom] = 'Main';
      if (cols.tableName !== -1) row[cols.tableName] = 'Black';
      if (cols.tableId !== -1) row[cols.tableId] = 0; // TableId는 임포트 시에만 사용
      if (cols.tableNo !== -1) row[cols.tableNo] = toInt_(validTableId);
      if (cols.seatId !== -1) row[cols.seatId] = 0; // SeatId는 임포트 시에만 사용
      if (cols.seatNo !== -1) row[cols.seatNo] = toInt_(validSeatNo);
      if (cols.playerId !== -1) row[cols.playerId] = 0; // PlayerId는 임포트 시에만 사용
      if (cols.playerName !== -1) row[cols.playerName] = validName;
      if (cols.nationality !== -1) row[cols.nationality] = nation || '';
      if (cols.chipCount !== -1) row[cols.chipCount] = validChips;
      row[cols.keyplayer] = Boolean(isKey);  // K열 고정 (항상 존재)

      sh.appendRow(row);

      // 자동 정렬: PokerRoom → TableName → TableNo → SeatNo 순서
      const lastRow = sh.getLastRow();
      if (lastRow > 1) {
        const sortRange = sh.getRange(2, 1, lastRow - 1, sh.getLastColumn());
        sortRange.sort([
          {column: cols.pokerRoom + 1, ascending: true},
          {column: cols.tableName + 1, ascending: true},
          {column: cols.tableNo + 1, ascending: true},
          {column: cols.seatNo + 1, ascending: true}
        ]);
      }

      invalidateCache_();

      log_(LOG_LEVEL.INFO, 'addPlayer', '플레이어 추가 완료');

      return successResponse_();

    } catch (e) {
      return errorResponse_('addPlayer', e);
    }
  });
}

/**
 * 플레이어 삭제
 */
function removePlayer(tableId, seatNo) {
  return withScriptLock_(() => {
    try {
      log_(LOG_LEVEL.INFO, 'removePlayer', '플레이어 삭제 시작', { tableId, seatNo });

      const validTableId = validateTableId_(tableId);
      const validSeatNo = validateSeatNo_(seatNo);

      const { sh, data, cols } = getSheetData_(true);

      const rowIndex = findPlayerRow_(data, cols, validTableId, validSeatNo);

      if (rowIndex === -1) {
        throw new Error('플레이어를 찾을 수 없습니다.');
      }

      const actualRow = rowIndex + 2;
      sh.deleteRow(actualRow);

      invalidateCache_();

      log_(LOG_LEVEL.INFO, 'removePlayer', '플레이어 삭제 완료');

      return successResponse_();

    } catch (e) {
      return errorResponse_('removePlayer', e);
    }
  });
}

/**
 * 플레이어 이동 (테이블/좌석 변경)
 * @param {number} fromTableNo - 출발지 테이블 번호
 * @param {number} fromSeatNo - 출발지 좌석 번호
 * @param {number} toTableNo - 목적지 테이블 번호
 * @param {number} toSeatNo - 목적지 좌석 번호
 * @return {Object} 성공/실패 응답
 */
function movePlayer(fromTableNo, fromSeatNo, toTableNo, toSeatNo) {
  return withScriptLock_(() => {
    try {
      log_(LOG_LEVEL.INFO, 'movePlayer', '플레이어 이동 시작', {
        from: `T${fromTableNo} S${fromSeatNo}`,
        to: `T${toTableNo} S${toSeatNo}`
      });

      // 검증
      const validFromTableNo = toInt_(fromTableNo);
      const validFromSeatNo = toInt_(fromSeatNo);
      const validToTableNo = toInt_(toTableNo);
      const validToSeatNo = toInt_(toSeatNo);

      if (validFromTableNo <= 0 || validFromSeatNo <= 0) {
        throw new Error('출발지 테이블/좌석 번호가 유효하지 않습니다.');
      }

      if (validToTableNo <= 0 || validToSeatNo <= 0) {
        throw new Error('목적지 테이블/좌석 번호가 유효하지 않습니다.');
      }

      if (validFromTableNo === validToTableNo && validFromSeatNo === validToSeatNo) {
        throw new Error('출발지와 목적지가 동일합니다.');
      }

      const { sh, data, cols } = getSheetData_(true);

      // 1. 출발지 플레이어 존재 확인
      const fromRowIndex = findPlayerRow_(data, cols, validFromTableNo, validFromSeatNo);
      if (fromRowIndex === -1) {
        throw new Error('출발지에 플레이어가 없습니다.');
      }

      // 2. 출발지 플레이어 데이터 읽기
      const fromRow = data.rows[fromRowIndex];
      const playerData = {
        pokerRoom: cols.pokerRoom !== -1 ? fromRow[cols.pokerRoom] : 'Main',
        tableName: cols.tableName !== -1 ? fromRow[cols.tableName] : 'Black',
        tableId: cols.tableId !== -1 ? fromRow[cols.tableId] : 0,
        seatId: cols.seatId !== -1 ? fromRow[cols.seatId] : 0,
        playerId: cols.playerId !== -1 ? fromRow[cols.playerId] : 0,
        playerName: cols.playerName !== -1 ? fromRow[cols.playerName] : '',
        nationality: cols.nationality !== -1 ? fromRow[cols.nationality] : '',
        chipCount: cols.chipCount !== -1 ? fromRow[cols.chipCount] : 0,
        keyplayer: fromRow[cols.keyplayer],
        photoUrl: cols.photoUrl !== -1 ? fromRow[cols.photoUrl] : ''
      };

      // 3. 목적지에 플레이어 있으면 삭제 (덮어쓰기)
      const toRowIndex = findPlayerRow_(data, cols, validToTableNo, validToSeatNo);
      if (toRowIndex !== -1) {
        const toActualRow = toRowIndex + 2;
        sh.deleteRow(toActualRow);

        // 데이터 다시 읽기 (행 삭제 후 인덱스 변경됨)
        const refreshedData = getSheetData_(true);
        const newFromRowIndex = findPlayerRow_(refreshedData.data, refreshedData.cols, validFromTableNo, validFromSeatNo);

        if (newFromRowIndex === -1) {
          throw new Error('출발지 플레이어를 다시 찾을 수 없습니다.');
        }

        // 4. 출발지 행 삭제
        const fromActualRow = newFromRowIndex + 2;
        sh.deleteRow(fromActualRow);
      } else {
        // 목적지가 비어있으면 바로 출발지 삭제
        const fromActualRow = fromRowIndex + 2;
        sh.deleteRow(fromActualRow);
      }

      // 5. 목적지에 새 데이터 쓰기
      const newRow = new Array(data.header.length).fill('');
      if (cols.pokerRoom !== -1) newRow[cols.pokerRoom] = playerData.pokerRoom;
      if (cols.tableName !== -1) newRow[cols.tableName] = playerData.tableName;
      if (cols.tableId !== -1) newRow[cols.tableId] = playerData.tableId;
      if (cols.tableNo !== -1) newRow[cols.tableNo] = validToTableNo; // 목적지 테이블
      if (cols.seatId !== -1) newRow[cols.seatId] = playerData.seatId;
      if (cols.seatNo !== -1) newRow[cols.seatNo] = validToSeatNo; // 목적지 좌석
      if (cols.playerId !== -1) newRow[cols.playerId] = playerData.playerId;
      if (cols.playerName !== -1) newRow[cols.playerName] = playerData.playerName;
      if (cols.nationality !== -1) newRow[cols.nationality] = playerData.nationality;
      if (cols.chipCount !== -1) newRow[cols.chipCount] = playerData.chipCount;
      newRow[cols.keyplayer] = playerData.keyplayer;
      if (cols.photoUrl !== -1) newRow[cols.photoUrl] = playerData.photoUrl;

      sh.appendRow(newRow);

      // 6. 자동 정렬
      const lastRow = sh.getLastRow();
      if (lastRow > 1) {
        const sortRange = sh.getRange(2, 1, lastRow - 1, sh.getLastColumn());
        sortRange.sort([
          {column: cols.pokerRoom + 1, ascending: true},
          {column: cols.tableName + 1, ascending: true},
          {column: cols.tableNo + 1, ascending: true},
          {column: cols.seatNo + 1, ascending: true}
        ]);
      }

      invalidateCache_();

      log_(LOG_LEVEL.INFO, 'movePlayer', '플레이어 이동 완료', {
        playerName: playerData.playerName
      });

      return successResponse_({
        playerName: playerData.playerName,
        from: { tableNo: validFromTableNo, seatNo: validFromSeatNo },
        to: { tableNo: validToTableNo, seatNo: validToSeatNo }
      });

    } catch (e) {
      return errorResponse_('movePlayer', e);
    }
  });
}

/**
 * 배치 칩 업데이트 (최적화)
 */
function batchUpdateChips(updates) {
  return withScriptLock_(() => {
    try {
      log_(LOG_LEVEL.INFO, 'batchUpdateChips', '배치 업데이트 시작', { count: updates.length });

      if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error('업데이트 목록이 비어있습니다.');
      }

      const { sh, data, cols } = getSheetData_(true);

      // 업데이트 대상 수집
      const updateMap = new Map();

      updates.forEach(u => {
        const validTableId = validateTableId_(u.tableId);
        const validSeatNo = validateSeatNo_(u.seatNo);
        const validChips = validateChips_(u.chips);

        const rowIndex = findPlayerRow_(data, cols, validTableId, validSeatNo);

        if (rowIndex !== -1) {
          const actualRow = rowIndex + 2;
          updateMap.set(actualRow, validChips);
        }
      });

      if (updateMap.size === 0) {
        return successResponse_({ updated: 0 });
      }

      // 연속 범위 병합
      const rows = Array.from(updateMap.keys()).sort((a, b) => a - b);
      const ranges = [];
      let start = rows[0];
      let end = rows[0];
      let values = [[updateMap.get(start)]];

      for (let i = 1; i < rows.length; i++) {
        if (rows[i] === end + 1) {
          end = rows[i];
          values.push([updateMap.get(rows[i])]);
        } else {
          ranges.push({
            range: sh.getRange(start, cols.chips + 1, end - start + 1, 1),
            values
          });
          start = rows[i];
          end = rows[i];
          values = [[updateMap.get(rows[i])]];
        }
      }

      ranges.push({
        range: sh.getRange(start, cols.chips + 1, end - start + 1, 1),
        values
      });

      // 배치 업데이트
      ranges.forEach(r => r.range.setValues(r.values));

      invalidateCache_();

      log_(LOG_LEVEL.INFO, 'batchUpdateChips', '배치 업데이트 완료', { updated: updateMap.size });

      return successResponse_({ updated: updateMap.size });

    } catch (e) {
      return errorResponse_('batchUpdateChips', e);
    }
  });
}

/**
 * 키 플레이어 소개 체크박스 업데이트 (Phase 3.5.1: PlayerPhotos 기반)
 * @param {string} playerName - 플레이어 이름
 * @param {boolean} isIntroduced - 소개 여부 (true=체크, false=미체크)
 * @return {Object} 성공/실패 응답
 */
function updateIntroduction(playerName, isIntroduced) {
  return withScriptLock_(() => {
    try {
      log_(LOG_LEVEL.INFO, 'updateIntroduction', '소개 상태 업데이트 시작', { playerName, isIntroduced });

      const validName = validatePlayerName_(playerName);
      const sheet = ensurePlayerPhotosSheet_();
      const now = new Date().toISOString();
      const lastRow = sheet.getLastRow();
      let targetRow = -1;

      // PlayerPhotos 시트에서 플레이어 찾기
      if (lastRow >= 2) {
        const names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (let i = 0; i < names.length; i++) {
          if (String(names[i][0]).trim() === validName) {
            targetRow = i + 2;
            break;
          }
        }
      }

      if (targetRow !== -1) {
        // UPDATE: 기존 행의 Introduction 업데이트 (Phase 3.6.0)
        sheet.getRange(targetRow, 5).setValue(Boolean(isIntroduced));  // E열 Introduction
        sheet.getRange(targetRow, 7).setValue(now);                    // G열 UpdatedAt
        log_(LOG_LEVEL.INFO, 'updateIntroduction', 'Introduction 업데이트', { playerName: validName, row: targetRow });
      } else {
        // INSERT: 새 플레이어 추가 (PhotoURL 없이) (Phase 3.6.0: 7열 구조)
        // A: PlayerName, B: PhotoURL, C: CreatedAt, D: PlayerType, E: Introduction, F: DisplayOrder, G: UpdatedAt
        sheet.appendRow([validName, '', now, 'Key player', Boolean(isIntroduced), 0, now]);
        log_(LOG_LEVEL.INFO, 'updateIntroduction', 'Introduction 추가', { playerName: validName });
      }

      invalidateCache_();
      invalidatePlayerPhotosCache_(); // PlayerPhotos 캐시도 무효화

      log_(LOG_LEVEL.INFO, 'updateIntroduction', '소개 상태 업데이트 완료 (캐시 무효화)');
      return successResponse_();

    } catch (e) {
      return errorResponse_('updateIntroduction', e);
    }
  });
}

/* ===== 데이터 무결성 검증 ===== */

function validateSheetIntegrity() {
  try {
    const { data, cols } = getSheetData_(true);

    const errors = [];
    const seen = new Set();

    data.rows.forEach((row, idx) => {
      const rowNum = idx + 2;

      // 필수 필드
      if (!row[cols.table]) errors.push(`행 ${rowNum}: 테이블 번호 누락`);
      if (!row[cols.seat]) errors.push(`행 ${rowNum}: 좌석 번호 누락`);
      if (!row[cols.player]) errors.push(`행 ${rowNum}: 플레이어 이름 누락`);

      // 좌석 범위
      const seat = normalizeSeat_(row[cols.seat]);
      if (!/^S[1-9]$/.test(seat)) {
        errors.push(`행 ${rowNum}: 잘못된 좌석 번호 "${seat}"`);
      }

      // 칩 음수
      if (cols.chips !== -1 && toInt_(row[cols.chips]) < 0) {
        errors.push(`행 ${rowNum}: 음수 칩 수`);
      }

      // 중복
      const key = `${row[cols.table]}_${row[cols.seat]}`.toUpperCase();
      if (seen.has(key)) {
        errors.push(`행 ${rowNum}: 중복된 테이블/좌석 조합`);
      }
      seen.add(key);
    });

    return successResponse_({ valid: errors.length === 0, errors });

  } catch (e) {
    return errorResponse_('validateSheetIntegrity', e);
  }
}

/* ===== 디버그 ===== */

function debugGetAllTypeData() {
  try {
    const ss = appSS_();
    const sh = ss.getSheetByName(TYPE_SHEET_NAME);
    if (!sh) return errorResponse_('debugGetAllTypeData', new Error('Type 시트가 없습니다'));

    const data = sh.getDataRange().getValues();

    return successResponse_({
      sheetName: sh.getName(),
      totalRows: data.length,
      header: data[0],
      firstDataRow: data.length > 1 ? data[1] : null,
      allData: data
    });

  } catch (e) {
    return errorResponse_('debugGetAllTypeData', e);
  }
}

/**
 * 웹앱 진입점
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('tracker')
    .setTitle(`Tracker ${TRACKER_VERSION} - Refactored`)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ===== 일회성 마이그레이션 ===== */

/**
 * [일회성] Type 시트에 Poker Room/Table Name 컬럼 추가
 *
 * 실행 순서:
 * 1. Apps Script 에디터 (https://script.google.com) 접속
 * 2. tracker_gs.js 파일 열기
 * 3. 함수 드롭다운에서 "migrateAddPokerRoomColumns" 선택
 * 4. 실행 버튼 (▶️) 클릭
 * 5. 권한 요청 시 승인
 * 6. 로그 확인 (보기 → 로그)
 *
 * ⚠️ 주의: 이 함수는 1회만 실행하세요. 재실행 시 컬럼이 중복 생성됩니다.
 */
function migrateAddPokerRoomColumns() {
  try {
    const ss = SpreadsheetApp.openById(APP_SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Type');

    if (!sheet) {
      throw new Error('Type 시트를 찾을 수 없습니다.');
    }

    // 1. A/B열에 컬럼 2개 삽입
    sheet.insertColumnsBefore(1, 2);

    // 2. 헤더 설정
    sheet.getRange('A1').setValue('Poker Room');
    sheet.getRange('B1').setValue('Table Name');

    // 3. 기존 데이터 행 수 확인
    const lastRow = sheet.getLastRow();

    if (lastRow > 1) {
      // 4. 기존 데이터에 기본값 설정 (A2:B{lastRow})
      const defaultValues = [];
      for (let i = 2; i <= lastRow; i++) {
        defaultValues.push(['Merit Hall', 'Ocean Blue']); // 기본값
      }
      sheet.getRange(2, 1, lastRow - 1, 2).setValues(defaultValues);
    }

    Logger.log('✅ Poker Room/Table Name 컬럼 추가 완료');
    Logger.log(`📊 총 ${lastRow - 1}개 행에 기본값 설정 완료`);

    return { success: true, message: `컬럼 추가 완료 (${lastRow - 1}개 행)` };

  } catch (err) {
    Logger.log('❌ 에러:', err.message);
    throw err;
  }
}

/**
 * [일회성] Type 시트 N열 데이터를 PlayerPhotos 시트로 마이그레이션 (Phase 3.3)
 *
 * 실행 순서:
 * 1. Apps Script 에디터 (https://script.google.com) 접속
 * 2. tracker_gs.js 파일 열기
 * 3. 함수 드롭다운에서 "migrateTypeSheetNToPlayerPhotos" 선택
 * 4. 실행 버튼 (▶️) 클릭
 * 5. 로그 확인 (보기 → 로그)
 *
 * ⚠️ 주의: 이 함수는 1회만 실행하세요.
 */
function migrateTypeSheetNToPlayerPhotos() {
  try {
    const ss = SpreadsheetApp.openById(APP_SPREADSHEET_ID);
    const typeSheet = ss.getSheetByName('Type');

    if (!typeSheet) {
      throw new Error('Type 시트를 찾을 수 없습니다.');
    }

    const typeLastRow = typeSheet.getLastRow();
    if (typeLastRow < 2) {
      Logger.log('⚠️ Type 시트에 데이터가 없습니다.');
      return { success: true, message: 'Type 시트 데이터 없음' };
    }

    // PlayerPhotos 시트 초기화
    ensurePlayerPhotosSheet_();

    // Type 시트에서 PlayerName(E열=5)과 PhotoURL(N열=14) 읽기
    const playerNameCol = 5;  // E열 (1-based)
    const photoUrlCol = 14;   // N열 (1-based)

    const playerNames = typeSheet.getRange(2, playerNameCol, typeLastRow - 1, 1).getValues();
    const photoUrls = typeSheet.getRange(2, photoUrlCol, typeLastRow - 1, 1).getValues();

    let migratedCount = 0;
    const seen = new Set(); // 중복 방지

    for (let i = 0; i < playerNames.length; i++) {
      const playerName = String(playerNames[i][0] || '').trim();
      const photoUrl = String(photoUrls[i][0] || '').trim();

      if (playerName && photoUrl && !seen.has(playerName)) {
        const saved = setPlayerPhotoUrl_(playerName, photoUrl);
        if (saved) {
          migratedCount++;
          seen.add(playerName);
        }
      }
    }

    Logger.log(`✅ Type 시트 N열에서 PlayerPhotos로 ${migratedCount}개 URL 마이그레이션 완료`);
    Logger.log('📋 다음 단계: CSV 임포트 시 Type 시트가 갱신되어도 사진 URL은 보존됩니다.');

    return { success: true, message: `${migratedCount}개 URL 마이그레이션 완료` };

  } catch (err) {
    Logger.log('❌ 에러:', err.message);
    throw err;
  }
}

/**
 * [일회성] KeyPlayers 시트 데이터를 Type 시트 N열로 마이그레이션
 *
 * 실행 순서:
 * 1. Apps Script 에디터 (https://script.google.com) 접속
 * 2. tracker_gs.js 파일 열기
 * 3. 함수 드롭다운에서 "migrateKeyPlayersToTypeSheetN" 선택
 * 4. 실행 버튼 (▶️) 클릭
 * 5. 로그 확인 (보기 → 로그)
 * 6. 완료 후 KeyPlayers 시트는 수동으로 삭제 또는 보관
 *
 * ⚠️ 주의: 이 함수는 1회만 실행하세요.
 */
function migrateKeyPlayersToTypeSheetN() {
  try {
    const ss = SpreadsheetApp.openById(APP_SPREADSHEET_ID);
    const typeSheet = ss.getSheetByName('Type');
    const keyPlayersSheet = ss.getSheetByName('KeyPlayers');

    if (!typeSheet) {
      throw new Error('Type 시트를 찾을 수 없습니다.');
    }

    if (!keyPlayersSheet) {
      Logger.log('⚠️ KeyPlayers 시트가 없습니다. 마이그레이션 스킵.');
      return { success: true, message: 'KeyPlayers 시트 없음' };
    }

    // KeyPlayers 시트에서 데이터 읽기 (PlayerName, PhotoURL)
    const keyPlayersLastRow = keyPlayersSheet.getLastRow();
    if (keyPlayersLastRow < 2) {
      Logger.log('⚠️ KeyPlayers 시트에 데이터가 없습니다.');
      return { success: true, message: '데이터 없음' };
    }

    const keyPlayersData = keyPlayersSheet.getRange(2, 1, keyPlayersLastRow - 1, 2).getValues();
    const photoMap = {}; // { "박프로": "https://...", ... }

    keyPlayersData.forEach(row => {
      const playerName = String(row[0] || '').trim();
      const photoUrl = String(row[1] || '').trim();
      if (playerName && photoUrl) {
        photoMap[playerName] = photoUrl;
      }
    });

    Logger.log(`📸 KeyPlayers 시트에서 ${Object.keys(photoMap).length}개 사진 URL 읽기 완료`);

    // Type 시트에서 PlayerName 읽기 및 N열에 쓰기
    const typeLastRow = typeSheet.getLastRow();
    if (typeLastRow < 2) {
      Logger.log('⚠️ Type 시트에 데이터가 없습니다.');
      return { success: true, message: 'Type 시트 데이터 없음' };
    }

    // E열(PlayerName)과 N열(PhotoURL) 위치 확인 (0-based: E=4, N=13)
    const playerNameCol = 5; // E열 (1-based)
    const photoUrlCol = 14;  // N열 (1-based)

    const playerNames = typeSheet.getRange(2, playerNameCol, typeLastRow - 1, 1).getValues();
    let updatedCount = 0;

    playerNames.forEach((row, idx) => {
      const playerName = String(row[0] || '').trim();
      const photoUrl = photoMap[playerName];

      if (photoUrl) {
        const targetRow = idx + 2;
        typeSheet.getRange(targetRow, photoUrlCol).setValue(photoUrl);
        updatedCount++;
      }
    });

    Logger.log(`✅ Type 시트 N열에 ${updatedCount}개 사진 URL 마이그레이션 완료`);
    Logger.log('🗑️ KeyPlayers 시트는 수동으로 삭제하거나 보관하세요.');

    return { success: true, message: `${updatedCount}개 URL 마이그레이션 완료` };

  } catch (err) {
    Logger.log('❌ 에러:', err.message);
    throw err;
  }
}

/* ===== 테스트 함수 (Phase 3.2) ===== */

/**
 * Imgur 업로드 권한 테스트
 * Apps Script 에디터에서 실행하여 OAuth 승인 트리거
 *
 * 실행 방법:
 * 1. Apps Script 에디터 접속
 * 2. 함수 드롭다운에서 "testImgurUploadPermission" 선택
 * 3. ▶️ 실행 버튼 클릭
 * 4. "권한 검토" 팝업 → 고급 → 허용 클릭
 * 5. 로그 확인 (보기 → 실행 로그)
 */
function testImgurUploadPermission() {
  try {
    // 1x1 빨간색 PNG (올바른 Base64 인코딩)
    const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    Logger.log('=== Imgur 업로드 권한 테스트 시작 ===');
    Logger.log('Client ID: ' + IMGUR_CLIENT_ID);

    // UrlFetchApp.fetch 호출하여 OAuth 권한 트리거 (Form-urlencoded)
    const payload = 'image=' + encodeURIComponent(testBase64) +
                    '&type=base64' +
                    '&name=OAuth%20Test' +
                    '&title=Permission%20Test';

    const response = UrlFetchApp.fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID ' + IMGUR_CLIENT_ID,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      payload: payload,
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    const json = JSON.parse(response.getContentText());

    Logger.log('✅ UrlFetchApp 권한 승인 완료!');
    Logger.log('응답 코드: ' + statusCode);
    Logger.log('업로드 성공: ' + json.success);

    if (json.success) {
      Logger.log('이미지 URL: ' + json.data.link);
      Logger.log('삭제 해시: ' + json.data.deletehash);
      return '✅ 테스트 성공! 이제 웹앱에서 사진 업로드가 정상 작동합니다.';
    } else {
      Logger.log('⚠️ Imgur API 오류: ' + JSON.stringify(json.data));
      return '⚠️ 권한은 승인되었으나 Imgur API 오류 발생';
    }

  } catch (e) {
    Logger.log('❌ 에러: ' + e.message);
    Logger.log('에러 스택: ' + e.stack);

    if (e.message.includes('권한') || e.message.includes('permission')) {
      return '❌ 권한 오류: Apps Script 에디터에서 "권한 검토" 클릭 후 승인 필요';
    }

    throw e;
  }
}

/* ===== DEBUG: Type 시트 구조 확인 ===== */
function debugTypeSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(TYPE_SHEET_NAME);

  if (!sheet) {
    Logger.log('❌ Type 시트를 찾을 수 없습니다');
    return;
  }

  const data = sheet.getRange(1, 1, 10, 8).getValues();

  Logger.log('=== Type 시트 첫 10행 ===');
  data.forEach((row, i) => {
    Logger.log('Row ' + (i+1) + ': ' + JSON.stringify(row));
  });

  Logger.log('\n=== D열(Type) 확인 ===');
  data.forEach((row, i) => {
    if (i === 0) {
      Logger.log('Header Row 1, D열: "' + row[3] + '"');
    } else if (row[4]) { // E열(Name)이 있는 경우만
      Logger.log('Row ' + (i+1) + ' [' + row[4] + ']: Type(D열) = "' + row[3] + '"');
    }
  });

  Logger.log('\n=== 결론 ===');
  if (data[0][3] === 'Type') {
    Logger.log('✅ Row 1이 헤더입니다. 코드 정상 작동 예상.');
  } else if (data[0][0] === 'Confirmed Players') {
    Logger.log('❌ Row 1이 제목 행입니다. Row 1 삭제 필요!');
  } else {
    Logger.log('⚠️ 예상치 못한 구조. Row 1 데이터: ' + JSON.stringify(data[0]));
  }
}

