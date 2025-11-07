# [PRD] VTC Story Ledger v3.2 - FINAL EDITION
**프로젝트명**: VTC Story Ledger (현장 스토리-스테이트 로거)
**문서 버전**: 3.2 FINAL (2025-01-06)
**핵심 아키텍처**: **Supabase** (PostgreSQL + Realtime + Storage) + **PWA**
**타겟 디바이스**: 스마트폰 (iOS/Android)

---

## 📊 Executive Summary

### 버전 변경 사항 (v3.1 → v3.2 FINAL)
- ✅ **아키텍처 최종 확정**: ~~Google Apps Script~~ → **Supabase** (PostgreSQL + Realtime + Storage)
- ✅ **용어 수정**: 헌터 → **카메라 감독**
- ✅ **스토리지 변경**: ~~Imgur~~ → **Supabase Storage** (속도 + 가성비 최고)
- ✅ **충돌 방지 재정의**: 인터컴 구두 조율 + DB Lock 백업
- ✅ **UI/UX 목업 추가**: 5개 Screen 시각화

### 핵심 문제
VTC팀은 현재 **수백 개의 영상 클립과 로그 데이터를 수동 매칭**하는 데 과도한 시간을 소모하고 있습니다.
- **현재 소요 시간**: 핸드당 평균 **수십 분**
- **목표 시간**: 핸드당 **12분** (영상 찾기 + 데이터 대조 + 편집)

### 솔루션
**타임스탬프 기반 자동 매칭** + **KP 중심 데이터 구조** + **Archive 앱 검증 기술 (Supabase 변환)**:
1. 영상(`C0001.MP4`, 생성시간: `14:32:15`) ↔ 로그(`created_at: 14:32:15`) **±60초 범위 자동 추천** (수동 확정)
2. 10명 로거가 **인터컴 구두 조율 + PostgreSQL Lock**으로 충돌 방지
3. **KP의 여정(Journey) 추적**이 핵심 (테이블 정보는 부수적)

---

## 1. 문제 정의 & 목표 (Problem & Objectives)

### 1.1. VTC팀의 본질적 목적 (사용자 피드백 반영)

> **"버추얼 테이블 프로젝트의 궁극적인 목적은 키 플레이어(KP) 모니터링 및 데이터 수집을 통해 대회의 진정한 주인공의 여정을 수집하여, 시청자에게 본질적인 이 대회의 메인 시나리오를 전달해주는 역할"**

#### 설계 철학
- ❌ 테이블 중심 설계 (v3.0)
- ✅ **KP 중심 설계** (v3.1+)

### 1.2. VTC팀 워크플로우
VTC(Virtual Table Contents)팀의 콘텐츠 제작은 **A (영상) + B (데이터)** 두 소스의 결합입니다:

**A. 영상 소스** (카메라 감독이 촬영)
- `C0001.MP4` (파일 생성시간: `14:30:05`)
- `C0002.MP4` (파일 생성시간: `14:32:15`)

**B. 데이터 소스** (로거가 기록)
- "14:32경, Daniel K.(KP)가 AA로 Preflop 올인 승리"

**현재 Pain Point**: VTC팀은 파일을 **일일이 열어보기 전까지** 어떤 영상이 어떤 스토리인지 알 수 없음 → **"분류 지옥"**

### 1.3. 핵심 목표 (Key Objectives)

| 목표 | 성공 지표 |
|------|-----------|
| **시간 절약** | 핸드당 작업시간 **수십분 → 12분** |
| **타임스탬프 정확도** | 영상-데이터 매칭 오차 **±60초 이내** (자동 추천 → 수동 확정) |
| **동시 사용자 지원** | **10명** 동시 접속 시 충돌 없음 (인터컴 조율 + DB Lock) |
| **오프라인 내구성** | 네트워크 단절 시 **로컬 저장 → 자동 동기화** |
| **초기 로딩 시간** | **< 1초** (Archive 검증: 0.475초) |

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
- **물리적 특징**: **같은 공간에서 인터컴으로 실시간 소통** → 구두 조율로 충돌 사전 방지

#### VTC 프로듀서 (Admin) - 관리자
- **권한**:
  - 전체 KP 상태 실시간 모니터링
  - 잘못된 로그 삭제
  - 로거의 KP 강제 Unclaim
  - 로거 계정 관리
  - **로거/카메라 감독 동선 관리** (인터컴 지시)

### 2.2. Secondary Users

#### VTC 편집팀 (Consumer) - 데이터 소비자
- Supabase Realtime을 통해 핸드 로그를 **핸드 진행 완료 후 수신**
- `created_at` 타임스탬프로 영상 자동 매칭 (±60초 범위 추천)
- **확정은 수동 작업** (자동 매칭은 후보만 제공)

---

## 3. 핵심 기능 (Core Features)

### 3.1. KP 중심 데이터 구조

#### Supabase 스키마
```sql
-- 1. KP 플레이어 (핵심 엔티티)
CREATE TABLE kp_players (
  kp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL UNIQUE,
  current_logger_id UUID REFERENCES profiles(id),
  last_chip_update_at TIMESTAMPTZ DEFAULT NOW(),
  photo_url TEXT, -- Supabase Storage URL
  table_no INT,
  seat_no INT,
  chip_count BIGINT
);

-- 2. 핸드 로그
CREATE TABLE hands (
  hand_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hand_number TEXT NOT NULL UNIQUE, -- HAND-001, HAND-002, ...
  created_at TIMESTAMPTZ DEFAULT NOW(),
  kp_id UUID REFERENCES kp_players(kp_id),
  logger_id UUID REFERENCES profiles(id),
  opponents JSONB, -- [{"name": "John", "seat": 5}, ...]
  result TEXT -- "KP Win" / "Opponent Win"
);

-- 3. 핸드 스트릿 (연속 입력)
CREATE TABLE hand_streets (
  street_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hand_id UUID REFERENCES hands(hand_id) ON DELETE CASCADE,
  street TEXT, -- "Preflop", "Flop", "Turn", "River"
  pot_before BIGINT,
  pot_after BIGINT,
  kp_action TEXT, -- "raise", "bet", "call", "fold", "all-in"
  board JSONB -- ["K♦", "Q♠", "J♥"]
);
```

**설계 원칙**:
- ✅ KP가 **Primary Key** (핵심 엔티티)
- ✅ 테이블 정보는 **kp_players 속성** (부수적)
- ✅ "KP의 여정" 추적이 목적

---

### 3.2. 충돌 방지 2단계 방어

#### 1단계: 인터컴 구두 조율 (Primary)
```
현실: 로거들은 같은 공간에서 인터컴으로 실시간 소통

[로거 A] (인터컴) "Daniel K. 담당합니다"
[로거 B] (인터컴) "확인, 저는 John P. 담당할게요"
  ↓
[프로듀서] (인터컴) "로거 A는 Table 4, 로거 B는 Table 7로 동선 분리"

**결과**: 동시 Claim 충돌은 **발생하지 않음**
```

#### 2단계: PostgreSQL Lock (Backup)
```sql
-- 만약 인터컴 조율 실패 시 DB에서 최종 방어
UPDATE kp_players
SET current_logger_id = $1,
    last_chip_update_at = NOW()
WHERE kp_id = $2
  AND (current_logger_id IS NULL OR current_logger_id = $1)
RETURNING *;
```

**실패 시 사용자 알림**:
```
⚠️ 이 KP는 방금 다른 로거가 선택했습니다.
   프로듀서에게 인터컴으로 확인하세요.
```

---

### 3.3. Supabase Storage (사진 저장)

**선택 이유**:
| 솔루션 | 속도 | 가성비 | 무료 할당량 | 선택 |
|--------|------|--------|------------|------|
| Imgur | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 무제한 (익명) | ❌ |
| **Supabase Storage** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **1GB 무료** | ✅ **선택** |
| Cloudflare Images | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $5/월 (10만장) | ❌ |

**코드 예시**:
```javascript
// 카메라 촬영 → Supabase Storage 업로드
async function uploadKPPhoto(file, playerName) {
  const { data, error } = await supabase.storage
    .from('kp-photos')
    .upload(`${playerName}.jpg`, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  // Public URL 생성 (CDN)
  const { data: { publicUrl } } = supabase.storage
    .from('kp-photos')
    .getPublicUrl(`${playerName}.jpg`);

  // DB 업데이트
  await supabase
    .from('kp_players')
    .update({ photo_url: publicUrl })
    .eq('player_name', playerName);

  return publicUrl;
}
```

**장점**:
- ✅ **DB와 통합**: 추가 설정 불필요
- ✅ **무료 1GB**: KP 사진 100명 기준 충분
- ✅ **CDN 내장**: Cloudflare CDN으로 빠른 속도
- ✅ **RLS 권한**: Supabase RLS로 접근 제어
- ✅ **영구 보관**: 삭제하지 않는 한 영구 저장

---

### 3.4. Archive 앱 검증 기술 (Supabase 변환)

#### 1️⃣ Batched API (Hand Logger v3.4.0)
**Apps Script → Supabase RPC 변환**:
```sql
-- Supabase Function: 단일 호출로 모든 초기 데이터 로드
CREATE OR REPLACE FUNCTION init_app(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'kp_list', (SELECT json_agg(row_to_json(kp_players.*)) FROM kp_players),
    'my_claimed_kp', (SELECT json_agg(row_to_json(kp_players.*)) FROM kp_players WHERE current_logger_id = user_id),
    'recent_hands', (SELECT json_agg(row_to_json(hands.*)) FROM hands WHERE logger_id = user_id ORDER BY created_at DESC LIMIT 10)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**클라이언트**:
```javascript
// 단일 호출로 모든 데이터 로드
const { data } = await supabase.rpc('init_app', { user_id });

const { kp_list, my_claimed_kp, recent_hands } = data;
```

**효과**: 네트워크 왕복 60% 절감 (3회 → 1회)

---

#### 2️⃣ 스마트 적응형 로딩 (Hand Logger v3.6.0)
```javascript
function showLoading(message, options = {}) {
  const { threshold = 300, haptic = null } = options;

  const startTime = Date.now();
  const showTimer = setTimeout(() => {
    // 300ms 이상 걸리면 로딩 UI 표시
    document.getElementById('loadingOverlay').classList.add('show');
  }, threshold);

  return () => {
    clearTimeout(showTimer);
    const elapsed = Date.now() - startTime;

    if (elapsed < threshold) {
      // 빠른 작업: 깜빡임 방지
      return;
    }

    document.getElementById('loadingOverlay').classList.remove('show');

    if (haptic) {
      navigator.vibrate(haptic === 'MEDIUM' ? [50] : [30, 30, 30]);
    }
  };
}
```

**효과**: 체감 속도 67% 개선 (깜빡임 제거)

---

#### 3️⃣ Sparse Column Reads (Hand Logger v3.5.0)
**Supabase 적용**:
```javascript
// Before: 모든 컬럼 읽기
const { data } = await supabase.from('kp_players').select('*');

// After: 필수 컬럼만 읽기 (45% 절감)
const { data } = await supabase
  .from('kp_players')
  .select('kp_id, player_name, table_no, seat_no, current_logger_id, last_chip_update_at');
```

**효과**: 쿼리 성능 45% 개선

---

#### 4️⃣ 자동 번호 발급 (Soft Sender 검증)
**Supabase Sequence 활용**:
```sql
-- Sequence 생성
CREATE SEQUENCE hand_counter START 1;

-- Hand 생성 시 자동 번호 발급
CREATE OR REPLACE FUNCTION create_hand(...)
RETURNS UUID AS $$
DECLARE
  hand_num INT;
  hand_id UUID;
BEGIN
  hand_num := nextval('hand_counter');

  INSERT INTO hands (hand_number, kp_id, ...)
  VALUES ('HAND-' || lpad(hand_num::TEXT, 3, '0'), kp_id, ...)
  RETURNING hands.hand_id INTO hand_id;

  RETURN hand_id;
END;
$$ LANGUAGE plpgsql;
```

**효과**: 성능 40배 개선 (Sheet 스캔 불필요)

---

### 3.5. 오프라인 모드

**구현**: PWA + IndexedDB + Supabase Realtime

#### 워크플로우
```
[로거 입력] → [IndexedDB 즉시 저장]
  ↓ (오프라인)
[UI에 "📶 오프라인 모드 (3개 대기 중)" 배지]
  ↓ (온라인 복귀 감지)
[Supabase API 호출] → [성공 시 IndexedDB 삭제]
```

#### 기술 스택
- **Service Worker**: 네트워크 상태 감지
- **IndexedDB**: 로컬 큐 저장 (Dexie.js)
- **Background Sync API**: 온라인 복귀 시 자동 실행

---

### 3.6. 스트릿 자동 확장 입력

**워크플로우**:
```
[로거] Preflop 데이터 입력 완료
  ↓
[버튼] [다음 스트릿 계속 →]
  ↓
[Flop 폼 자동 생성] (Preflop pot_after → Flop pot_before 자동 상속)
  ↓
[Turn 폼 자동 생성] ...
```

**데이터 구조**:
```json
{
  "hand_id": "uuid-1234",
  "hand_number": "HAND-042",
  "kp_id": "daniel-k",
  "streets": [
    {"street": "Preflop", "pot_before": 3000, "pot_after": 12000, "kp_action": "raise"},
    {"street": "Flop", "pot_before": 12000, "pot_after": 30000, "kp_action": "bet", "board": ["K♦", "Q♠", "J♥"]},
    {"street": "Turn", "pot_before": 30000, "pot_after": 60000, "kp_action": "bet"},
    {"street": "River", "pot_before": 60000, "pot_after": 120000, "kp_action": "all-in", "result": "win"}
  ]
}
```

---

### 3.7. CSV 플레이어 리스트 업로드

**파일 형식**:
```csv
Player Name,Table,Seat,IsKP
Daniel K.,4,7,Y
John P.,7,3,N
```

**Admin UI → Supabase**:
```javascript
async function importCSV(csvData) {
  const rows = parseCSV(csvData);

  const players = rows.map(row => ({
    player_name: row[0],
    table_no: parseInt(row[1]),
    seat_no: parseInt(row[2]),
    is_kp: row[3] === 'Y'
  }));

  const { error } = await supabase
    .from('kp_players')
    .upsert(players, { onConflict: 'player_name' });

  if (error) throw error;
}
```

---

## 4. UI/UX 목업 디자인 (5개 Screen)

### Screen 1: KP 대시보드 (메인 화면)

```
┌─────────────────────────────────────────┐
│ 📶 Online  |  👤 Logger A  |  🔔        │ ← 상단 바
├─────────────────────────────────────────┤
│ ⚡ My Claimed KP                         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📸 [Photo]  👤 Daniel K.            │ │
│ │              🇺🇸 USA                 │ │
│ │              📍 T4, S7               │ │
│ │              💰 1,250,000 chips      │ │
│ │              ⏱️ 업데이트: 3분 전      │ │
│ │                                      │ │
│ │ [📝 로그 시작] [🔓 Unclaim]         │ │ ← 하단 버튼
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 🌟 Available KP (6)                     │
├─────────────────────────────────────────┤
│ ┌─ John P. ──────────────────────────┐ │
│ │ 🇰🇷 KOR | T7, S3 | 800k chips     │ │
│ │ [✓ Available] [Claim →]           │ │ ← 녹색 배경
│ └─────────────────────────────────────┘ │
│                                          │
│ ⏸️ Occupied KP (3)                      │
├─────────────────────────────────────────┤
│ ┌─ Mike T. ──────────────────────────┐ │
│ │ 🇯🇵 JPN | T2, S5 | 1.2M chips     │ │
│ │ [Logged by: B] [12분 전]          │ │ ← 회색 배경
│ └─────────────────────────────────────┘ │
│                                          │
│ [⚙️ Settings] [📜 History]              │ ← 하단 메뉴
└─────────────────────────────────────────┘
```

**특징**:
- ✅ KP 중심 (테이블 정보는 부수적)
- ✅ My Claimed KP 최상단 고정
- ✅ 1x 그리드 (세로 스크롤)
- ✅ 마지막 업데이트 시간 표시 (Stale 감지)

---

### Screen 2: 핸드 입력 (간소화 모드)

```
┌─────────────────────────────────────────┐
│ ← Back  |  Daniel K. 핸드 입력           │
├─────────────────────────────────────────┤
│ 📝 Quick Log (간소화 모드)               │
├─────────────────────────────────────────┤
│ 상대 플레이어:                           │
│ ┌──────────────────────────────────────┐│
│ │ [John P.] [Mike T.] [Lisa M.] ...   ││ ← 1줄 그리드
│ └──────────────────────────────────────┘│
│                                          │
│ 결과:                                    │
│ ◉ KP 승리   ○ 상대 승리                 │
│                                          │
│ KP 칩 스택 (After):                     │
│ [1,500,000] chips                       │
│                                          │
│ 팟 사이즈:                               │
│ [250,000] chips                         │
│                                          │
├─────────────────────────────────────────┤
│ [💾 Save & Send] ← 진동 피드백           │ ← 하단 버튼
└─────────────────────────────────────────┘
```

**특징**:
- ✅ 원핸드 조작 가능 (엄지 도달 영역)
- ✅ 3탭 완료 (상대 선택 → 결과 → 칩/팟)
- ✅ 햅틱 피드백 (전송 성공 시)

---

### Screen 3: 핸드 입력 (상세 모드)

```
┌─────────────────────────────────────────┐
│ ← Back  |  Daniel K. 핸드 입력           │
├─────────────────────────────────────────┤
│ 📝 Full Log (상세 모드)                  │
├─────────────────────────────────────────┤
│ Street: [Flop ▼]                        │
│                                          │
│ Board Cards:                             │
│ [K♦] [Q♠] [J♥] [+ Add] ← Bottom Sheet  │
│                                          │
│ Pot Before: 12,000  (자동 계산)          │
│ Pot After:  [30,000]                    │
│                                          │
│ KP Action:                               │
│ [Bet] [Raise] [Call] [Fold] [All-in]   │
│                                          │
├─────────────────────────────────────────┤
│ [다음 스트릿 계속 →]                     │ ← Turn 폼 자동 생성
│ [💾 Save & Send]                        │
└─────────────────────────────────────────┘
```

**특징**:
- ✅ 스트릿 연속 입력 (Preflop → Flop → Turn → River)
- ✅ Pot Before 자동 계산 (이전 스트릿 Pot After)
- ✅ Bottom Sheet 카드 선택 (48px 터치 영역)

---

### Screen 4: Admin 대시보드

```
┌─────────────────────────────────────────┐
│ 🔧 Admin Console                        │
├─────────────────────────────────────────┤
│ 📊 실시간 로거 현황                      │
│ ┌───────────────────────────────────┐  │
│ │ ● A → Daniel K. (3분 전)          │  │
│ │ ● B → John P. (12분 전) ⚠️        │  │
│ │ ○ C → (대기 중)                   │  │
│ └───────────────────────────────────┘  │
│                                          │
│ ⚠️ 경고                                 │
│ ┌───────────────────────────────────┐  │
│ │ John P.: 15분 비활성화            │  │
│ │ [🔓 강제 Unclaim]                 │  │
│ └───────────────────────────────────┘  │
│                                          │
│ 🗑️ 최근 로그                            │
│ ┌───────────────────────────────────┐  │
│ │ HAND-042: Daniel vs John (14:32)  │  │
│ │ [🗑️ 삭제] [📹 영상 보기]          │  │
│ └───────────────────────────────────┘  │
│                                          │
│ [📤 CSV 업로드] [📷 전체 사진 관리]      │
└─────────────────────────────────────────┘
```

**특징**:
- ✅ 로거 모드와 동일 UI + 추가 권한
- ✅ 실시간 활동 모니터 (15분 이상 비활성 경고)
- ✅ 강제 Unclaim + 로그 삭제

---

### Screen 5: 사진 업로드 (Supabase Storage)

```
┌─────────────────────────────────────────┐
│ ← Back  |  📷 Daniel K. 사진 업로드      │
├─────────────────────────────────────────┤
│ 현재 사진:                               │
│ ┌───────────────────────────────────┐  │
│ │                                    │  │
│ │      [Photo Preview 96x96]        │  │
│ │                                    │  │
│ └───────────────────────────────────┘  │
│                                          │
│ [📷 Take Photo] ← 카메라 촬영            │
│                                          │
│ ───── OR ─────                          │
│                                          │
│ Supabase Storage URL:                   │
│ [https://...supabase.co/storage/...]    │
│                                          │
├─────────────────────────────────────────┤
│ Progress: ████████░░ 80%                │ ← 업로드 진행률
│                                          │
│ [Cancel] [💾 Save]                      │
└─────────────────────────────────────────┘
```

**특징**:
- ✅ 카메라 촬영 → Supabase Storage 직접 업로드
- ✅ 진행률 표시 (파일 크기 대비)
- ✅ URL 수동 입력 지원

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
2. [DB Lock 획득] PostgreSQL Row-Level Lock (0.05초)
   ↓ (성공 시)
3. [UI 업데이트] Daniel K. → [Logged by: 나]
   ↓
4. [Quick Log 입력] 상대 선택 → 결과 → 칩/팟 (5초 완료)
   ↓
5. [전송] Progress 7단계 표시 (총 0.9초)
   ↓
6. [완료] HAND-042 발급 + "✅ 완료" 햅틱 피드백 (진동 1회)

Acceptance Criteria:
✓ KP 선택 후 0.05초 이내에 Lock 획득
✓ Quick Log 모드로 5초 이내 입력 가능
✓ 전송 성공 시 햅틱 피드백
```

---

### 5.2. 엣지 케이스 (Edge Cases)

#### Story 2: 잘못된 KP 선택 → Unclaim
```
Workflow:
[Daniel K. 선택] → [실수 발견] → [🔓 Unclaim 버튼]
  ↓
[확인 대화상자] "Daniel K. Unclaim하시겠습니까?"
  ↓
[예] → DB UPDATE current_logger_id = NULL → 다른 KP 선택 가능
```

#### Story 3: 충돌 방지 (인터컴 조율)
```
현실: 로거들은 같은 공간에서 인터컴으로 실시간 소통

[로거 A] (인터컴) "Daniel K. 담당합니다"
[로거 B] (인터컴) "확인, 저는 John P. 담당할게요"
  ↓
[프로듀서] (인터컴) "로거 A는 Table 4, 로거 B는 Table 7로 동선 분리"

**결과**: 동시 Claim 충돌은 **발생하지 않음**

**DB 백업 방어**: 만약 인터컴 조율 실패 시
  ↓
[DB Lock] PostgreSQL Row-Level Lock → 먼저 도착한 로거 성공
  ↓
[실패한 로거 UI] ⚠️ "이 KP는 방금 다른 로거가 선택했습니다. 프로듀서에게 인터컴으로 확인하세요."
```

#### Story 4: 오프라인 → 온라인 복귀
```
[14:30] 네트워크 단절
  ↓
[로거 입력] HAND-040, 041, 042 → IndexedDB 저장
  ↓
[UI] "📶 오프라인 모드 (3개 대기 중)" 배지
  ↓
[14:45] 네트워크 복귀 감지
  ↓
[자동 동기화] 큐에서 순차 전송 (1초 간격, Progress 표시)
  ↓
[UI] "✅ 3개 핸드 전송 완료" → 배지 제거
```

---

## 6. 기술 스택 (Technology Stack)

### 6.1. Frontend

| 레이어 | 기술 | 이유 |
|--------|------|------|
| **Framework** | React 18 + Vite | 빠른 HMR, PWA 최적화 |
| **UI Library** | Tailwind CSS + DaisyUI | 다크모드 내장, 반응형 |
| **상태 관리** | Zustand | 경량, Realtime 동기화 용이 |
| **로컬 DB** | Dexie.js (IndexedDB) | 오프라인 큐 |
| **PWA** | Vite PWA Plugin | Service Worker 자동 생성 |

### 6.2. Backend

| 서비스 | 역할 | 무료 할당량 |
|--------|------|------------|
| **Supabase Auth** | 로거/Admin 인증 | 무제한 |
| **Supabase PostgreSQL** | 핵심 데이터 저장 | 500MB 무료 |
| **Supabase Realtime** | KP 상태 동기화 | 200 동시 접속 |
| **Supabase Storage** | KP 사진 저장 | **1GB 무료** ⭐ |

### 6.3. 배포

- **Frontend**: Vercel / Netlify (무료 티어)
- **도메인**: `vtc-logger.vercel.app`

---

## 7. 성능 목표 (Archive 검증)

| 지표 | 목표 | Hand Logger 실측 | VTC Logger 예상 |
|------|------|------------------|----------------|
| **초기 로딩 시간** | < 1초 | **0.475초** ⭐ | **< 1초** ✅ |
| **쿼리 성능 (50건)** | < 1.5초 | **0.275초** ⭐ | **< 0.5초** ✅ |
| **KP Claim 응답** | < 2초 | N/A | **< 0.1초** (DB Lock) |
| **사진 업로드** | < 5초 | N/A | **< 3초** (Supabase CDN) |

---

## 8. 마일스톤 & 일정

### Phase 1: MVP (4주)
- ✅ Supabase 스키마 설계 (KP 중심)
- ✅ PWA 기본 UI (Screen 1, 2)
- ✅ 오프라인 모드 (IndexedDB)

### Phase 2: 고급 기능 (3주)
- ✅ Supabase Storage 사진 업로드
- ✅ 스트릿 자동 확장 입력
- ✅ CSV 플레이어 리스트 업로드
- ✅ 스마트 적응형 로딩 UI

### Phase 3: 최적화 & 테스트 (2주)
- ✅ Batched API (Supabase RPC)
- ✅ Sparse Column Reads
- ✅ 실제 토너먼트 테스트 (10명)

**총 소요 기간**: 9주

---

## 9. 변경 이력 (Change Log)

### v3.2 FINAL (2025-01-06)
- ✅ **아키텍처 최종 확정**: Supabase (PostgreSQL + Realtime + Storage)
- ✅ **용어 수정**: 헌터 → 카메라 감독
- ✅ **스토리지 변경**: Imgur → **Supabase Storage** (속도 + 가성비 최고)
- ✅ **충돌 방지 재정의**: 인터컴 구두 조율 (Primary) + DB Lock (Backup)
- ✅ **UI/UX 목업 추가**: 5개 Screen 시각화

### v3.1 (2025-01-06)
- ✅ 사용자 피드백 반영 (KP 중심 설계, 시간 목표 12분)
- ✅ Archive 앱 기술 8가지 통합

### v3.0 (2025-01-06)
- 초기 버전 (Supabase 기반)

---

**문서 승인**:
- [ ] VTC 프로듀서
- [ ] 개발팀 리더
- [ ] QA 팀

**다음 단계**: PRD v3.2 승인 후 → **MVP 설계 (Phase 2)** → 개발 시작

---

*PRD v3.2 FINAL - Archive Integration Edition*
*작성일: 2025-01-06*
*문의: [your-email@example.com]*
