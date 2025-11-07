# [PRD] VTC Story Ledger v3.1 - Archive Integration Edition
**프로젝트명**: VTC Story Ledger (현장 스토리-스테이트 로거)
**문서 버전**: 3.1 (2025-01-06)
**핵심 아키텍처**: **Google Apps Script** (Sheets + Lock + Realtime) + **PWA**
**타겟 디바이스**: 스마트폰 (iOS/Android)

---

## 📊 Executive Summary

### 버전 변경 사항 (v3.0 → v3.1)
- ✅ **아키텍처 변경**: Supabase → **Google Apps Script** (기존 Archive 앱 기술 스택 재활용)
- ✅ **사용자 피드백 반영**: 테이블 중심 → **KP 중심 설계**
- ✅ **시간 목표 재설정**: 핸드당 3분 → **12분** (현실적 목표)
- ✅ **Archive 앱 혁신 기술 5가지 통합**

### 핵심 문제
VTC팀은 현재 **수백 개의 영상 클립과 로그 데이터를 수동 매칭**하는 데 과도한 시간을 소모하고 있습니다.
- **현재 소요 시간**: 핸드당 평균 **수십 분**
- **목표 시간**: 핸드당 **12분** (영상 찾기 + 데이터 대조 + 편집)

### 솔루션
**타임스탬프 기반 자동 매칭** + **KP 중심 데이터 구조** + **Archive 앱 검증된 기술**을 통해:
1. 영상(`C0001.MP4`, 생성시간: `14:32:15`) ↔ 로그(`created_at: 14:32:15`) **±60초 범위 자동 추천** (수동 확정)
2. 10명 이상의 로거가 **Lock 기반 충돌 방지**로 동시 작업
3. **KP의 여정(Journey) 추적**이 핵심 (테이블 정보는 부수적)

---

## 1. 문제 정의 & 목표 (Problem & Objectives)

### 1.1. VTC팀의 본질적 목적 (사용자 피드백 반영)

> **"버추얼 테이블 프로젝트의 궁극적인 목적은 키 플레이어(KP) 모니터링 및 데이터 수집을 통해 대회의 진정한 주인공의 여정을 수집하여, 시청자에게 본질적인 이 대회의 메인 시나리오를 전달해주는 역할"**

#### 설계 철학 변경
- ❌ 테이블 중심 설계 (v3.0)
- ✅ **KP 중심 설계** (v3.1)

### 1.2. VTC팀 워크플로우
VTC(Virtual Table Contents)팀의 콘텐츠 제작은 **A (영상) + B (데이터)** 두 소스의 결합입니다:

**A. 영상 소스** (헌터가 촬영)
- `C0001.MP4` (파일 생성시간: `14:30:05`)
- `C0002.MP4` (파일 생성시간: `14:32:15`)

**B. 데이터 소스** (로거가 기록)
- "14:32경, Daniel K.(KP)가 AA로 Preflop 올인 승리"

**현재 Pain Point**: VTC팀은 파일을 **일일이 열어보기 전까지** 어떤 영상이 어떤 스토리인지 알 수 없음 → **"분류 지옥"**

### 1.3. 핵심 목표 (Key Objectives)

| 목표 | 성공 지표 | 변경 사항 (v3.0 → v3.1) |
|------|-----------|------------------------|
| **시간 절약** | 핸드당 작업시간 **수십분 → 12분** | 목표 현실화 |
| **타임스탬프 정확도** | 영상-데이터 매칭 오차 **±60초 이내** | 자동 추천 → 수동 확정 |
| **동시 사용자 지원** | **10명** 동시 접속 시 충돌 없음 | 50명 → 10명 (현실화) |
| **오프라인 내구성** | 네트워크 단절 시 **로컬 저장 → 자동 동기화** | 유지 |
| **데이터 무결성** | 자동 번호 발급 + 하이브리드 캐싱 | Archive 앱 기술 활용 |

---

## 2. 사용자 & 역할 (Users & Roles)

### 2.1. Primary Users

#### 로거 (Logger) - 현장 데이터 기록자
- **기술 수준**: 모바일 앱 초심자 포함 (간단한 디자인 필수)
- **사용 환경**:
  - 어두운 토너먼트 현장 (다크모드 필수)
  - 불안정한 Wi-Fi (오프라인 모드 필수)
  - 8시간 연속 사용 (배터리 최적화 필수)
- **핵심 니즈**: "빠르고 간단하게 KP 데이터 입력"
- **물리적 특징**: **같은 공간에 함께 있음** → 구두 조율로 충돌 방지 가능

#### VTC 프로듀서 (Admin) - 관리자
- **권한**:
  - 전체 KP 상태 실시간 모니터링
  - 잘못된 로그 삭제
  - 로거의 KP 강제 Unclaim
  - 로거 계정 관리
  - **로거/카메라 감독 동선 관리** (물리적 충돌 방지)

### 2.2. Secondary Users

#### VTC 편집팀 (Consumer) - 데이터 소비자
- Google Sheets Realtime을 통해 핸드 로그를 **핸드 진행 완료 후 수신**
- `created_at` 타임스탬프로 영상 자동 매칭 (±60초 범위 추천)
- **확정은 수동 작업** (자동 매칭은 후보만 제공)

---

## 3. 핵심 기능 (Core Features)

### 3.1. KP 중심 데이터 구조 (사용자 피드백 반영)

#### 기존 설계 (v3.0 - 테이블 중심)
```
tables (current_logger_id) ← 삭제
  ↓
hands (table_id, kp_id)
```

#### 신규 설계 (v3.1 - KP 중심)
```
kp_players (current_logger_id, last_chip_update_at) ← 핵심 엔티티
  ↓
hands (kp_id, opponents[], chips_at_street_start)
  ↓
hand_streets (hand_id, street, pot_size, actions[])
```

**설계 원칙**:
- ✅ KP가 **핵심 엔티티** (Primary Key)
- ✅ 테이블 정보는 **부수적** (Secondary Attribute)
- ✅ "KP의 여정" 추적이 목적

---

### 3.2. Lock 기반 동시성 제어 (Archive: Table Tracker + Soft Sender)

**문제**: 10명의 로거가 동시에 같은 KP를 로깅하려는 충돌

**Archive 솔루션** (검증됨):
```javascript
// 출처: archive/soft sender/sender.gs:845-1006
function updateVirtual(payload) {
  const lock = LockService.getScriptLock();

  try {
    // 최대 30초 대기 (Race Condition 방지)
    if (!lock.tryLock(30000)) {
      throw new Error('LOCK_TIMEOUT: 다른 사용자가 처리 중입니다.');
    }

    // 🔒 Lock 보호 구간: KP Claim 충돌 방지
    const kpRow = findKPRow(kpName);
    if (kpRow.current_logger_id && kpRow.current_logger_id !== loggerId) {
      throw new Error('KP_ALREADY_CLAIMED');
    }

    sheet.getRange(kpRow.index, LOGGER_COL).setValue(loggerId);

  } finally {
    lock.releaseLock();
  }
}
```

**VTC Logger 적용**:
```
[로거 A] Daniel K. 선택
  ↓
[Apps Script Lock] tryLock(30초)
  ↓ (성공 시)
[Sheets] A열(KP), B열(Logger ID), C열(Last Update) 업데이트
  ↓
[Realtime 폴링] 5초마다 모든 로거가 A~C열 읽기
  ↓
[로거 B의 UI] Daniel K. → [Logged by: A] (비활성화)
```

**장점**:
- ✅ PostgreSQL 불필요 (Sheets만으로 해결)
- ✅ Archive 앱에서 검증됨 (실제 프로덕션 사용 중)
- ✅ 30초 타임아웃으로 데드락 방지

---

### 3.3. 하이브리드 캐싱 (Archive: Soft Sender)

**문제**: Sheets 읽기 성능 (10명 동시 접속 시 느림)

**Archive 솔루션** (검증됨):
```javascript
// 출처: archive/soft sender/sender.gs:541-607
function getCachedColumnC(cueId, ss, sh) {
  const cache = CacheService.getScriptCache();
  const props = PropertiesService.getScriptProperties();
  const cacheKey = `KP_LIST_${today}`;

  // Step 1: CacheService 확인 (6시간 TTL)
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Step 2: PropertiesService 백업 확인 (일일 백업)
  const backup = props.getProperty(cacheKey);
  if (backup) {
    cache.put(cacheKey, backup, 21600); // 복원
    return JSON.parse(backup);
  }

  // Step 3: Sheets 로드 + 이중 저장
  const data = sh.getRange(2, 1, lastRow, 10).getValues();
  const jsonStr = JSON.stringify(data);

  cache.put(cacheKey, jsonStr, 21600); // 6시간
  props.setProperty(cacheKey, jsonStr); // 백업

  return data;
}
```

**VTC Logger 적용**:
- KP 리스트를 CacheService (6시간 TTL) + PropertiesService (일일 백업) 이중 캐싱
- 성능: Sheets 읽기 ~2000ms → 캐시 히트 ~50ms (40배 개선)
- 캐시 무효화: CSV 업로드 시 `cache.remove(cacheKey)` 호출

---

### 3.4. 자동 번호 발급 시스템 (Archive: Soft Sender)

**문제**: 핸드 로그 ID를 어떻게 생성? (UUID vs. 순차 번호)

**Archive 솔루션** (검증됨):
```javascript
// 출처: archive/soft sender/sender.gs:644-788
function reserveSCNumber(cueId, targetRow) {
  const props = PropertiesService.getScriptProperties();

  // O(1) 카운터 증가 (Sheet 스캔 불필요)
  const current = parseInt(props.getProperty('HAND_COUNTER') || '0', 10);
  const nextNum = current + 1;
  props.setProperty('HAND_COUNTER', String(nextNum));

  // 2시간마다 Sheet와 동기화 (Drift 방지)
  if (now - lastSync > 7200000) {
    const maxFromSheet = Math.max(...scanLastRows());
    props.setProperty('HAND_COUNTER', String(Math.max(maxFromSheet, nextNum)));
  }

  return nextNum; // HAND-001, HAND-002, ...
}
```

**VTC Logger 적용**:
- 핸드 로그 ID: `HAND-001`, `HAND-002`, ...
- 성능: Sheet 스캔 ~2000ms → Properties 카운터 ~50ms (40배 개선)
- 안전성: 2시간마다 Sheet와 동기화 (Drift 방지)

**장점**:
- ✅ 순차 번호로 VTC팀이 진행 상황 직관적 파악
- ✅ Archive 앱에서 검증됨 (SC 번호 발급 시스템)

---

### 3.5. Progress 로그 시스템 (Archive: Soft Sender)

**문제**: 로딩 중 사용자가 "멈춤" 느낌 → 불안감

**Archive 솔루션** (검증됨):
```javascript
// 출처: archive/soft sender/sender.gs:836-842
const progressLogs = [];
const addLog = (step, message, duration) => {
  progressLogs.push({ step, message, duration });
  Logger.log(`${step} ${message} (${duration}ms)`);
};

// 사용 예시
addLog('🔌', '[1/7] Google Sheets 연결 중...', null);
addLog('✅', '연결 완료', new Date().getTime() - t0);
...
addLog('🎉', '[7/7] 완료 (총 1.2초)', totalTime);

return { ok: true, logs: progressLogs, totalTime };
```

**VTC Logger 적용**:
```
🔌 [1/7] Google Sheets 연결 중...
✅ 연결 완료 (120ms)
📊 [2/7] KP 데이터 로드 중...
✅ 10명 로드 완료 (340ms)
🔍 [3/7] 시간 매칭 중...
✅ 14:32 매칭 완료 (80ms)
🔢 [4/7] 핸드 번호 발급 중...
✅ HAND-042 발급 완료 (50ms)
📝 [5/7] 데이터 준비 중...
✅ 준비 완료 (30ms)
💾 [6/7] Google Sheets 업데이트 중...
✅ 6개 셀 업데이트 완료 (280ms)
🎉 [7/7] 완료 (총 0.9초)
```

**장점**:
- ✅ 사용자에게 진행 상황 실시간 표시 (UX 대폭 개선)
- ✅ 에러 발생 시 어느 단계에서 실패했는지 명확히 표시
- ✅ Archive 앱에서 검증됨 (프로덕션 사용 중)

---

### 3.6. Imgur API 사진 업로드 (Archive: Table Tracker)

**문제**: KP 프로필 사진을 어디에 저장? (Google Drive는 권한 복잡)

**Archive 솔루션** (검증됨):
```javascript
// 출처: archive/table tracker/tracker.gs:732-800
function uploadToImgur(playerName, base64Image) {
  const response = UrlFetchApp.fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      'Authorization': 'Client-ID ' + IMGUR_CLIENT_ID,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: 'image=' + encodeURIComponent(base64Image) + '&type=base64'
  });

  const json = JSON.parse(response.getContentText());
  const imgurUrl = json.data.link; // https://i.imgur.com/abc123.jpg

  // PlayerPhotos 시트 자동 저장
  setPlayerPhotoUrl_(playerName, imgurUrl);

  return { ok: true, imgurUrl };
}
```

**VTC Logger 적용**:
1. PWA에서 카메라 촬영 (`<input type="file" accept="image/*" capture="environment">`)
2. FileReader로 Base64 인코딩
3. Apps Script `uploadToImgur()` 호출
4. Imgur 직접 이미지 링크 반환 (`https://i.imgur.com/abc123.jpg`)
5. `PlayerPhotos` 시트 (A: PlayerName, B: PhotoURL) 자동 저장

**장점**:
- ✅ 무료 (Imgur Anonymous API)
- ✅ Google Drive 권한 불필요
- ✅ HTTPS 직접 링크 (CORS 이슈 없음)
- ✅ Archive 앱에서 검증됨 (프로덕션 사용 중)

---

### 3.7. 오프라인 모드 (v3.0 유지)

**구현**: PWA + IndexedDB

#### 워크플로우
```
[로거 입력] → [IndexedDB 즉시 저장]
  ↓ (오프라인)
[UI에 "동기화 대기 중" 배지 표시]
  ↓ (온라인 복귀 감지)
[Apps Script API 호출] → [성공 시 IndexedDB 삭제]
```

#### 기술 스택
- **Service Worker**: 네트워크 상태 감지
- **IndexedDB**: 로컬 큐 저장 (Dexie.js)
- **Background Sync API**: 브라우저가 온라인 복귀 시 자동 실행

---

### 3.8. CSV 업로드로 플레이어 리스트 자동 업데이트 (사용자 피드백 반영)

**파일 형식** (사용자 제공):
```csv
Player Name,Table,Seat,IsKP
Daniel K.,4,7,Y
John P.,7,3,N
...
```

**Apps Script 파싱 로직**:
```javascript
function importFromCSV(csvData) {
  const rows = Utilities.parseCsv(csvData);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Type');

  rows.slice(1).forEach(row => {
    sheet.appendRow([
      row[0], // Player Name
      row[1], // Table
      row[2], // Seat
      row[3] === 'Y' // IsKP
    ]);
  });

  // 캐시 무효화 (즉시 반영)
  CacheService.getScriptCache().remove('KP_LIST_' + today);
}
```

**Admin UI**:
```html
<input type="file" id="csvUpload" accept=".csv">
<button onclick="uploadCSV()">📤 플레이어 리스트 업로드</button>
```

---

### 3.9. 스트릿 자동 확장 입력 (사용자 피드백 반영)

**문제**: 로거가 Preflop에서 입력 시작 → Flop, Turn, River까지 이어서 입력하기 불편

**솔루션**: 자동 확장 폼

#### 워크플로우
```
[로거] Preflop 데이터 입력 완료
  ↓
[버튼] [다음 스트릿 계속 →]
  ↓
[Flop 폼 자동 생성] (Preflop 칩 데이터 상속)
  ↓ (입력 완료)
[버튼] [다음 스트릿 계속 →]
  ↓
[Turn 폼 자동 생성] ...
```

#### 데이터 구조
```json
{
  "hand_id": "HAND-042",
  "kp_id": "daniel-k",
  "start_street": "Preflop",
  "streets": [
    {
      "street": "Preflop",
      "pot_before": 3000,
      "pot_after": 12000,
      "kp_action": "raise",
      "board": []
    },
    {
      "street": "Flop",
      "pot_before": 12000, // ← Preflop의 pot_after 자동 상속
      "pot_after": 30000,
      "kp_action": "bet",
      "board": ["K♦", "Q♠", "J♥"]
    },
    ...
  ]
}
```

**장점**:
- ✅ 로거 작업량 대폭 단축
- ✅ 칩 계산 자동화 (이전 스트릿 pot_after → 현재 스트릿 pot_before)

---

## 4. 데이터베이스 스키마 (Google Sheets)

### 4.1. `Type` 시트 (플레이어 명부 + KP 상태)

**구조**:
| A: PlayerName | B: Table | C: Seat | D: IsKP | E: LoggerID | F: LastUpdate | G: ChipCount |
|---------------|----------|---------|---------|-------------|---------------|--------------|
| Daniel K.     | 4        | 7       | Y       | logger-A    | 14:32:15      | 1250000      |
| John P.       | 7        | 3       | N       |             |               |              |

**특징**:
- CSV 업로드로 A~D열 업데이트
- E열(LoggerID): Lock 시스템으로 KP Claim 추적
- F열(LastUpdate): 최근 업데이트 시간 (Stale 감지)

---

### 4.2. `HandLogs` 시트 (핸드 로그)

**구조**:
| A: HandID | B: CreatedAt | C: KP | D: Opponents | E: Streets | F: Result |
|-----------|--------------|-------|--------------|------------|-----------|
| HAND-001  | 14:32:15     | Daniel K. | John P., Mike T. | [JSON]     | KP Win    |

**E열 Streets JSON 예시**:
```json
[
  {"street": "Preflop", "pot_before": 3000, "pot_after": 12000, "kp_action": "raise"},
  {"street": "Flop", "pot_before": 12000, "pot_after": 30000, "kp_action": "bet", "board": ["K♦", "Q♠", "J♥"]},
  {"street": "Turn", "pot_before": 30000, "pot_after": 60000, "kp_action": "bet", "board": ["K♦", "Q♠", "J♥", "9♣"]},
  {"street": "River", "pot_before": 60000, "pot_after": 120000, "kp_action": "all-in", "result": "win"}
]
```

---

### 4.3. `PlayerPhotos` 시트 (KP 사진 URL)

**구조** (Archive: Table Tracker 방식):
| A: PlayerName | B: PhotoURL |
|---------------|-------------|
| Daniel K.     | https://i.imgur.com/abc123.jpg |

**업데이트 방식**:
- Imgur 업로드 성공 시 자동 저장 (`setPlayerPhotoUrl_()`)
- PWA에서 실시간 읽기 (캐싱)

---

## 5. 사용자 스토리 (User Stories)

### 5.1. 골든 패스 (Golden Path)

#### Story 1: 로거의 정상 로깅
```
As a 로거,
I want to KP를 선택하고 핸드 결과를 빠르게 입력하여
So that VTC팀이 영상과 자동 매칭할 수 있는 데이터를 전송한다.

Workflow:
1. [KP 선택] Daniel K. 탭
   ↓
2. [Lock 획득] Apps Script Lock 30초 대기
   ↓ (성공 시)
3. [UI 업데이트] Daniel K. → [Logged by: 나]
   ↓
4. [입력 시작] Preflop 데이터 입력
   ↓
5. [자동 확장] [다음 스트릿 계속 →] 버튼 → Flop 폼 생성
   ↓
6. [전송] 진행 상태 7단계 표시
   ↓
7. [완료] HAND-042 발급 + "✅ 0.9초 완료" 토스트

Acceptance Criteria:
✓ KP 선택 후 2초 이내에 Lock 획득
✓ 진행 상태 7단계 실시간 표시
✓ 전송 성공 시 햅틱 피드백 (진동 1회)
```

---

### 5.2. 엣지 케이스 (Edge Cases)

#### Story 2: 로거가 실수로 잘못된 KP 선택
```
Workflow:
[Daniel K. 선택] → [실수 발견] → [← 뒤로 버튼]
  ↓
[확인 대화상자] "Daniel K. Unclaim하시겠습니까?"
  ↓
[예] → E열(LoggerID) = NULL → 다른 KP 선택 가능
```

#### Story 3: 동시 Claim 충돌 (물리적 조율 실패 시)
```
Scenario: 로거 A와 B가 0.5초 차이로 동시에 Daniel K. 선택

[로거 A] 14:32:15.100 → Lock 획득 성공
[로거 B] 14:32:15.600 → Lock 대기 (최대 30초)
  ↓
[로거 A] 입력 완료 후 Unclaim (14:32:45)
  ↓
[로거 B] Lock 획득 성공 (30초 이내)

만약 30초 초과 시:
[로거 B UI] ⚠️ "다른 사용자가 처리 중입니다. 잠시 후 다시 시도하세요."
```

#### Story 4: 오프라인 → 온라인 복귀
```
Scenario: 로거가 네트워크 단절 상태에서 3개 핸드 입력

[14:30] 네트워크 단절
  ↓
[로거 입력] HAND-040, 041, 042 → IndexedDB에 저장
  ↓
[UI] 상단에 "📶 오프라인 모드 (3개 대기 중)" 배지
  ↓
[14:45] 네트워크 복귀 감지
  ↓
[자동 동기화] 큐에서 순차 전송 (1초 간격, Progress 표시)
  ↓
[UI] "✅ 3개 핸드 전송 완료" → 배지 제거
```

---

## 6. 수락 기준 (Acceptance Criteria)

### 6.1. 성능 요구사항

| 지표 | 목표 | 측정 방법 | Archive 검증 |
|------|------|-----------|--------------|
| **KP Claim 응답 시간** | ≤ 2초 | Lock 획득 → UI 업데이트 | ✅ Soft Sender |
| **실시간 동기화 지연** | ≤ 5초 | 폴링 간격 | ✅ Table Tracker |
| **타임스탬프 정확도** | 서버 시간 ±100ms | `created_at` vs. Apps Script `new Date()` | ✅ Soft Sender |
| **동시 사용자 부하** | 10명 | 실제 토너먼트 테스트 | ✅ Table Tracker (10명 검증) |
| **캐시 히트율** | ≥ 80% | CacheService 로그 | ✅ Soft Sender (80% 검증) |

### 6.2. 기능 요구사항

#### 필수 (P0)
- ✅ Lock 기반 KP Claim 충돌 방지 (Archive 검증)
- ✅ 하이브리드 캐싱 (CacheService + Properties, Archive 검증)
- ✅ 자동 번호 발급 (Properties 카운터, Archive 검증)
- ✅ Progress 로그 시스템 (7단계, Archive 검증)
- ✅ Imgur API 사진 업로드 (Archive 검증)
- ✅ 오프라인 모드 + 자동 동기화
- ✅ 스트릿 자동 확장 입력
- ✅ CSV 업로드 플레이어 리스트

#### 권장 (P1)
- ⭕ PWA 설치 프롬프트
- ⭕ 다크 모드 + 햅틱 피드백
- ⭕ Admin 대시보드 (로거 활동 모니터)

#### 제외 (Out of Scope)
- ❌ 로거 간 채팅/메모 기능
- ❌ AI 자동 로깅 (OCR)
- ❌ 블록체인 타임스탬프 (속도 영향 우려)

---

## 7. 기술 스택 (Technology Stack)

### 7.1. Frontend

| 레이어 | 기술 | 이유 |
|--------|------|------|
| **Framework** | React 18 + Vite | 빠른 HMR, PWA 최적화 |
| **UI Library** | Tailwind CSS + DaisyUI | 다크모드 내장, 반응형 |
| **상태 관리** | Zustand | 경량, Realtime 동기화 용이 |
| **로컬 DB** | Dexie.js (IndexedDB) | 오프라인 큐, 자동 동기화 |
| **PWA** | Vite PWA Plugin | Service Worker 자동 생성 |

### 7.2. Backend

| 서비스 | 역할 | Archive 검증 |
|--------|------|--------------|
| **Google Apps Script** | 핵심 비즈니스 로직 | ✅ Table Tracker + Soft Sender |
| **Google Sheets** | 데이터 저장소 | ✅ Archive 전체 |
| **LockService** | 동시성 제어 | ✅ Soft Sender |
| **CacheService** | 캐싱 (6시간 TTL) | ✅ Soft Sender |
| **PropertiesService** | 카운터 + 백업 캐시 | ✅ Soft Sender |
| **Imgur API** | 사진 업로드 | ✅ Table Tracker |

### 7.3. 배포

- **Frontend 호스팅**: Vercel / Netlify (무료 티어)
- **Apps Script**: Google Cloud Project (무료 할당량 충분)
- **도메인**: `vtc-logger.vercel.app`

---

## 8. 보안 & 규정 준수 (Security & Compliance)

### 8.1. 인증 & 권한

#### Google Apps Script 권한
```javascript
// doGet() - 웹앱 배포 시 실행
function doGet(e) {
  const userEmail = Session.getEffectiveUser().getEmail();

  // 허용된 도메인만 접근 가능
  if (!userEmail.endsWith('@allowed-domain.com')) {
    return HtmlService.createHtmlOutput('Access Denied');
  }

  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

### 8.2. 데이터 보존 정책
- **핸드 로그**: 영구 보관 (삭제 권한: Admin만)
- **KP 상태**: 토너먼트 종료 후 수동 초기화

### 8.3. 보안 체크리스트
- ✅ HTTPS 강제 (Apps Script 웹앱 기본)
- ✅ 사용자 인증 (Google 계정)
- ✅ Sheet 권한 제어 (Editor/Viewer)
- ✅ Lock으로 Race Condition 방지 (Archive 검증)
- ✅ 입력 검증 (Apps Script 서버 사이드)

---

## 9. 마일스톤 & 일정 (Milestones)

### Phase 1: MVP (4주)
- ✅ Google Apps Script 기본 구조 (Lock, 캐싱, 번호 발급) - Archive 코드 재활용
- ✅ PWA 기본 UI (KP 선택, 핸드 입력)
- ✅ 오프라인 모드 (IndexedDB)

### Phase 2: 고급 기능 (3주)
- ✅ Imgur API 사진 업로드 - Archive 코드 재활용
- ✅ 스트릿 자동 확장 입력
- ✅ CSV 플레이어 리스트 업로드
- ✅ Progress 로그 시스템 - Archive 코드 재활용

### Phase 3: 최적화 & 테스트 (2주)
- ✅ 배터리 최적화 (폴링 간격 조정)
- ✅ 실제 토너먼트 테스트 (10명 동시 사용)
- ✅ 사용자 매뉴얼

**총 소요 기간**: 9주

---

## 10. 성공 지표 (Success Metrics)

### 10.1. 정량 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| **핸드당 작업시간** | 수십분 | 12분 | VTC팀 피드백 |
| **데이터 손실률** | N/A | 0% | 오프라인 테스트 |
| **충돌 발생률** | N/A | <0.1% | 동시 Claim 테스트 |
| **타임스탬프 오차** | N/A | ±60초 | 영상 매칭 검증 |
| **캐시 히트율** | N/A | ≥80% | Archive 검증 (80%) |

### 10.2. 정성 지표
- ✅ 로거: "5분 안에 사용법 습득"
- ✅ VTC팀: "수동 매칭 작업 시간 대폭 감소"
- ✅ Admin: "실시간 관제로 문제 예방"

---

## 11. Archive 앱 기술 검증 요약

### 11.1. 검증된 기술 (프로덕션 사용 중)

| 기술 | 출처 | 검증 내용 | VTC Logger 적용 |
|------|------|-----------|----------------|
| **Lock 동시성 제어** | Soft Sender | 30초 타임아웃, Race Condition 방지 | ✅ KP Claim 충돌 방지 |
| **하이브리드 캐싱** | Soft Sender | CacheService (6h) + Properties 백업 | ✅ 성능 40배 개선 |
| **자동 번호 발급** | Soft Sender | Properties 카운터, 2시간 동기화 | ✅ 핸드 ID 생성 |
| **Progress 로그** | Soft Sender | 7단계 진행 상태 표시 | ✅ UX 대폭 개선 |
| **Imgur API** | Table Tracker | Anonymous 업로드, HTTPS 직접 링크 | ✅ KP 사진 저장 |
| **Sparse Column Reads** | Hand Logger v3.5.0 | 20개 → 11개 컬럼 읽기 | ✅ 45% 성능 개선 ⭐ |
| **스마트 적응형 로딩** | Hand Logger v3.6.0 | 300ms 미만 작업 숨김 | ✅ 깜빡임 제거 ⭐ |
| **Batched API** | Hand Logger v3.4.0 | 다중 요청 단일 호출 | ✅ 60% 네트워크 절감 ⭐ |

### 11.2. 검증된 성능 지표

| 지표 | Archive 실측 | Hand Logger 실측 (v3.6.2) | VTC Logger 예상 |
|------|--------------|---------------------------|----------------|
| **Lock 획득 시간** | ~50ms | N/A | ~50ms |
| **캐시 히트 속도** | ~50ms | ~20ms (CacheService) | ~50ms |
| **Sheets 읽기 (캐시 미스)** | ~2000ms | ~2000ms | ~2000ms |
| **번호 발급 속도** | ~50ms | N/A | ~50ms |
| **초기 로딩 시간** | N/A | **0.475초** (76% 개선) ⭐ | **< 1초** |
| **쿼리 성능 (50건)** | N/A | **0.275초** (45% 개선) ⭐ | **< 0.5초** |
| **동시 사용자** | 10명 검증 | 36개 테이블 지원 | 10명 목표 |

### 11.3. Hand Logger v3.6.2 핵심 기술 (VTC Logger 적용 필수) ⭐

#### 1️⃣ **Sparse Column Reads** (v3.5.0)
**문제**: Sheets API는 컬럼 단위로 과금 → 불필요한 컬럼 읽기는 낭비

**Hand Logger 솔루션**:
```javascript
// Before: 20개 컬럼 전체 읽기
const hands = sheet.getRange(2, 1, lastRow, 20).getValues();

// After: 11개 필수 컬럼만 읽기 (45% 절감)
const columns = [1, 2, 3, 4, 5, 6, 7, 10, 12, 15, 18]; // A, B, C, ...
const hands = columns.map(col => sheet.getRange(2, col, lastRow, 1).getValues());
```

**VTC Logger 적용**:
- KP 리스트 로드 시 필수 컬럼만 읽기 (Name, Table, Seat, IsKP, LoggerID, LastUpdate)
- 불필요한 메타데이터 컬럼 제외 (PokerRoom, TableName 등은 상세 화면에서만 로드)
- 성능: 2000ms → 1100ms (45% 개선 기대)

---

#### 2️⃣ **스마트 적응형 로딩 UI** (v3.6.0)
**문제**: 모든 작업에 무조건 로딩 UI 표시 → 빠른 작업도 깜빡임 발생 → 체감 속도 저하

**Hand Logger 솔루션** (Micro-Delay 패턴):
```javascript
function showLoading(message, options = {}) {
  const { compact = false, haptic = null, threshold = 300 } = options;

  // 300ms 미만 작업은 로딩 표시 생략
  const startTime = Date.now();
  const showTimer = setTimeout(() => {
    // 실제 로딩 UI 표시 (300ms 경과 후)
    document.getElementById('loadingOverlay').classList.add('show');
  }, threshold);

  return () => {
    clearTimeout(showTimer);
    const elapsed = Date.now() - startTime;

    if (elapsed < threshold) {
      // 빠른 작업: 깜빡임 방지 (로딩 표시 안 함)
      return;
    }

    // 느린 작업: 로딩 숨김
    document.getElementById('loadingOverlay').classList.remove('show');

    // 햅틱 피드백 (중요 작업만)
    if (haptic) {
      navigator.vibrate(haptic === 'MEDIUM' ? [50] : [30, 30, 30]);
    }
  };
}

// 사용 예시
const hideLoading = showLoading('데이터 로드 중...', { threshold: 300 });
const data = await fetchData();
hideLoading();
```

**효과**:
- ✅ 체감 속도 67% 개선 (깜빡임 제거)
- ✅ 코드 복잡도 38% 감소 (단일 함수)
- ✅ 사용자 경험 대폭 개선

**VTC Logger 적용**:
- KP 선택: 캐시 히트 시 로딩 표시 생략 (50ms < 300ms)
- 핸드 전송: 항상 로딩 표시 (2초 > 300ms) + 햅틱 피드백

---

#### 3️⃣ **Batched API** (v3.4.0)
**문제**: 초기 로드 시 다중 API 호출 (Roster + CONFIG + KP List) → N회 왕복

**Hand Logger 솔루션**:
```javascript
// Apps Script: 단일 엔드포인트로 모든 데이터 반환
function doBatch(requests) {
  const results = {};

  requests.forEach(req => {
    switch(req.action) {
      case 'getConfig':
        results.config = getConfig();
        break;
      case 'getRoster':
        results.roster = getCachedTypeRows();
        break;
      case 'getKPList':
        results.kpList = getKPList();
        break;
    }
  });

  return { ok: true, data: results };
}

// 클라이언트: 단일 호출
const response = await google.script.run.doBatch([
  { action: 'getConfig' },
  { action: 'getRoster' },
  { action: 'getKPList' }
]);

// 모든 데이터 한 번에 수신
const { config, roster, kpList } = response.data;
```

**효과**:
- ✅ 네트워크 왕복 60% 절감 (3회 → 1회)
- ✅ 초기 로딩 시간 40% 단축

**VTC Logger 적용**:
- 앱 시작 시 단일 `initApp()` API로 모든 초기 데이터 로드
- KP 선택 시 단일 `claimKP()` API로 Claim + 로그 기록 + 상태 업데이트

---

#### 4️⃣ **Bottom Sheet 카드 선택 UI** (Hand Logger UX)
**문제**: 카드 선택 UI가 복잡하고 터치 영역이 작음

**Hand Logger 솔루션** (모바일 최적화):
```html
<!-- Bottom Sheet: 하단에서 슬라이드 업 -->
<div id="cardPicker" class="bottom-sheet">
  <div class="card-grid">
    <!-- 48px 터치 영역 (Apple HIG 권장) -->
    <button class="card-btn" data-card="AS">A♠</button>
    <button class="card-btn" data-card="KH">K♥</button>
    ...
  </div>
</div>

<style>
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--panel);
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.bottom-sheet.show {
  transform: translateY(0);
}

.card-btn {
  width: 48px;
  height: 48px;
  font-size: 1.5rem;
  /* 햅틱 피드백 */
  touch-action: manipulation;
}
</style>
```

**효과**:
- ✅ 원핸드 조작 가능 (엄지 도달 영역)
- ✅ 햅틱 피드백으로 터치 확인
- ✅ 48px 터치 영역 (오타 방지)

**VTC Logger 적용**:
- 상대 플레이어 선택 시 Bottom Sheet (1줄 그리드)
- BTN 위치 선택 시 체크박스 → Bottom Sheet로 변경

---

#### 5️⃣ **멱등성 보장** (Hand Logger v3.3)
**문제**: 네트워크 불안정 시 중복 전송 → 같은 핸드가 2번 저장됨

**Hand Logger 솔루션**:
```javascript
// 클라이언트: 고유 ID 생성
const clientUUID = crypto.randomUUID();
const startedAt = new Date().toISOString();

// 서버: 중복 체크
function saveHand(data) {
  const existing = findHand(data.clientUUID, data.startedAt);

  if (existing) {
    return { ok: true, handId: existing.handId, duplicate: true };
  }

  // 신규 저장
  const handId = insertHand(data);
  return { ok: true, handId, duplicate: false };
}
```

**효과**:
- ✅ 중복 전송 방지 (네트워크 재시도 안전)
- ✅ 오프라인 모드 대비

**VTC Logger 적용**:
- 핸드 로그 전송 시 `client_uuid` + `started_at` 조합으로 중복 체크
- 오프라인 모드 동기화 시 멱등성 보장

---

### 11.4. Hand Logger 성능 최적화 3단계 (VTC Logger 로드맵)

| Phase | 최적화 기법 | 개선율 | VTC Logger 적용 |
|-------|-------------|--------|----------------|
| **Phase 1 (v3.4.0)** | 캐싱 레이어 (PropertiesService + CacheService) | 91% ⭐ | ✅ 필수 |
| **Phase 2 (v3.5.0)** | Sparse Column Reads | 45% ⭐ | ✅ 권장 |
| **Phase 3 (v3.6.0)** | 스마트 적응형 로딩 UI | 67% 체감 ⭐ | ✅ 필수 |
| **누적 효과** | Phase 1+2+3 조합 | **76% 로딩 시간 단축** | **목표: < 1초** |

**VTC Logger 적용 계획**:
- MVP (Phase 1): 캐싱 레이어만 적용 → 91% 개선 기대
- Phase 2 (2주 후): Sparse Column Reads 추가 → 추가 45% 개선
- Phase 3 (4주 후): 스마트 로딩 UI 추가 → 체감 속도 대폭 개선

---

## 12. 부록 (Appendix)

### 12.1. 용어집 (Glossary)
- **KP (Key Player)**: VTC 콘텐츠의 주인공, 추적 대상
- **Claim**: 로거가 특정 KP를 "담당" 상태로 지정
- **Lock**: Apps Script LockService로 동시 접근 방지
- **하이브리드 캐싱**: CacheService (6시간) + PropertiesService (백업) 이중 구조
- **자동 번호 발급**: Properties 카운터 기반 순차 번호 생성

### 12.2. Archive 앱 참고 파일
- `archive/table tracker/tracker.gs` (Imgur 업로드, 사진 관리)
- `archive/soft sender/sender.gs` (Lock, 캐싱, 번호 발급, Progress)

### 12.3. 참고 문서
- [Google Apps Script LockService](https://developers.google.com/apps-script/reference/lock)
- [Imgur Anonymous API](https://apidocs.imgur.com/#c85c9dfc-7487-4de2-9ecd-66f727cf3139)
- [PWA 베스트 프랙티스](https://web.dev/pwa-checklist/)

---

## 13. 변경 이력 (Change Log)

### v3.1 (2025-01-06)
- ✅ **아키텍처 변경**: Supabase → Google Apps Script (Archive 기술 재활용)
- ✅ **사용자 피드백 반영**:
  - 테이블 중심 → KP 중심 설계
  - 시간 목표: 3분 → 12분 (현실화)
  - 동시 사용자: 50명 → 10명 (현실화)
  - 타임스탬프: 자동 매칭 → ±60초 범위 추천 (수동 확정)
- ✅ **Archive 앱 기술 5가지 통합**:
  1. Lock 기반 동시성 제어
  2. 하이브리드 캐싱 (CacheService + Properties)
  3. 자동 번호 발급 (Properties 카운터)
  4. Progress 로그 시스템 (7단계)
  5. Imgur API 사진 업로드
- ✅ **신규 기능**:
  - 스트릿 자동 확장 입력 (Preflop → Flop → Turn → River)
  - CSV 플레이어 리스트 업로드
  - 물리적 조율 전제 (같은 공간, 구두 충돌 방지)

### v3.0 (2025-01-06)
- 초기 버전 (Supabase 기반)

---

**문서 승인**:
- [ ] VTC 프로듀서
- [ ] 개발팀 리더
- [ ] QA 팀

**다음 단계**: PRD v3.1 승인 후 → MVP 설계 (Phase 2) → 개발 시작

---

*PRD v3.1 - Archive Integration Edition*
*작성일: 2025-01-06*
*문의: [your-email@example.com]*