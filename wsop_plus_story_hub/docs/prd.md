# WSOP+ "The Story Hub" 
## 라이브 스토리텔링 중앙 신경망 구축

---

## 프로젝트 비전

**WSOP+ "The Story Hub"는 토너먼트의 모든 스토리가 탄생하고 연결되는 중앙 신경망입니다.**

팬들에게는 '나만의 주인공'을 따라가는 세컨드 스크린 경험을, 방송팀에게는 스토리를 발굴하고 설계하는 중앙 관제탑을, 현장팀에게는 스토리 가치를 평가하는 지능형 도구를 제공합니다.

---

## 시스템 아키텍처

### 중앙 신경망 구조

```
                [The Story Hub]
                 중앙 신경망
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
  [Field Core]   [Broadcast]    [Fan Layer]
   스토리 발굴    스토리 설계     스토리 경험
       │              │              │
   스포터 8명      PD/작가팀       전세계 팬
```

### 데이터 플로우

```
현장 발생 → 즉시 수집 → 실시간 처리 → 방송 동기화 배포
   T+0        T+0         T+0~방송     방송 시간
```

---

## 3대 핵심 모듈

## 모듈 1: Field Operations Core

### Field Logger App (스마트폰)

#### 메인 화면
```
┌─────────────────────────────┐
│  Zone 3  │  Level 5: 300/600│
├─────────────────────────────┤
│        KEY PLAYERS          │
│  ┌───────────────────────┐  │
│  │ Phil Ivey [T14-S5]   │  │
│  │ 📍 Producer's Pick    │  │
│  │ #Comeback_Story       │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│     [START HAND]            │
└─────────────────────────────┘
```

#### 핸드 입력 화면
```
┌─────────────────────────────┐
│      STORY VALUE SCORE      │
│        [필수 입력]           │
│    ⭐ ⭐ ⭐ ⭐ ⭐           │
├─────────────────────────────┤
│  Players: [Phil Ivey +3]    │
│  Action: [All-in]           │
│  Pot: $125,000              │
├─────────────────────────────┤
│ [▶ HAND START] 14:30:00    │
│ [■ HAND END]   14:32:15    │
├─────────────────────────────┤
│      [SUBMIT LOG]           │
└─────────────────────────────┘
```

### 스토리 가치 평가 체계

| Score | 의미 | BDP 처리 |
|-------|------|----------|
| ⭐⭐⭐⭐⭐ | 토너먼트 결정 순간 | 즉시 편집 |
| ⭐⭐⭐⭐ | 방송 하이라이트 | 우선 편집 |
| ⭐⭐⭐ | Key Hand | 일반 편집 |
| ⭐⭐ | 기록용 | 보관 |
| ⭐ | 데이터만 | 텍스트만 |

### 타임마커 시스템

스포터가 [HAND START]를 누르는 순간부터 [HAND END]까지의 시간이 자동 기록되며, 이 구간의 모든 영상 파일이 자동으로 식별됩니다.

### 자동 클립 매칭 (WiFi Direct)

```
WiFi Direct 전송 → 타임스탬프 매칭 → 자동 파일 선택 → Hub 업로드
                      14:30:00-14:32:15
                      A캠: 2개, B캠: 1개, C캠: 1개
```

**전송 프로토콜**:

- 3-앵글 순차 전송 (Wide → Close → Player POV)
- 전송 실패 시: SD 카드 백업 수동 전송
- 매칭 실패 시: BDP가 수동 싱크 확인

---

## 모듈 2: Broadcast Admin

### Producer's Dashboard

#### KP 지정 인터페이스
```
┌─────────────────────────────────────┐
│       LIVE PLAYER MANAGEMENT        │
├─────────────────────────────────────┤
│  Phil Ivey                          │
│  [★ SET AS KP]                      │
│  Tag: [#Comeback] [#Heater] [+]     │
├─────────────────────────────────────┤
│  Daniel Negreanu                    │
│  [★ SET AS KP]                      │
│  Tag: [#Tilt_Warning] [+]           │
└─────────────────────────────────────┘
```

### 스토리라인 태그

**태그 적용 원칙**: Producer가 재미있는 핸드에만 수동 태그 추가

| 태그 | 의미 | 현장 지시 | 팬 표시 |
|------|------|----------|---------|
| #Heater_Alert | 연속 승리 흐름 | 모든 핸드 주목 | 🔥 |
| #Bubble_Watch | 버블 근접 | 중요 결정 기록 | ⚠️ |
| #Comeback_Story | 반전 스토리 | 상세 기록 | 📈 |
| #Tilt_Warning | 감정 변화 | 행동 관찰 | 😤 |
| #Final_Table_Run | 파이널 임박 | 완전 기록 | 🏆 |

**운영 방식**: Producer와 스포터는 인터컴으로 실시간 소통

### BDP Dashboard

```
┌──────────────────────────────────────┐
│         STORY PRIORITY QUEUE         │
│         (시간순 자동 정렬)            │
├──────────────────────────────────────┤
│ ⭐⭐⭐⭐⭐ │ 14:30 │ Ivey All-in     │
│          │ Files: 3 │ [EDIT NOW]     │
├──────────────────────────────────────┤
│ ⭐⭐⭐⭐  │ 14:28 │ Bad Beat        │
│          │ Files: 2 │ [QUEUE]        │
└──────────────────────────────────────┘
```

**처리 원칙**: 무조건 시간순 편집 (Producer/BDP 동일 공간에서 조율)

---

## 모듈 3: Fan Interface

### My Stable

```
┌─────────────────────────────┐
│      MY STABLE (5/10)       │
├─────────────────────────────┤
│ Phil Ivey                   │
│ 📍 Producer's Pick          │
│ #Comeback_Story             │
│ Stack: $125,000 (↓25%)      │
│ Last: "All-in vs AA"        │
├─────────────────────────────┤
│ Daniel Negreanu             │
│ Stack: $87,500 (↑12%)       │
│ Last: "Won with Bluff"      │
└─────────────────────────────┘
```

### 푸시 알림 우선순위

```javascript
Priority 1: [ELIMINATION] - 즉시 알림
Priority 2: [ALL-IN] - 5초 내 알림  
Priority 3: [KEY HAND] - 1분 내 알림
Priority 4: [PRODUCER TAG] - 배치 알림
```

### Key Hand Feed

```
┌─────────────────────────────┐
│      KEY HAND FEED          │
├─────────────────────────────┤
│ Phil Ivey vs Negreanu       │
│ All-in | Pot: $125,000      │
│ #Comeback_Story              │
│ [📝 Text] [🎬 VOD Ready]    │
│ 👍 좋아요 245  💬 댓글 12    │
│ [🔥 Amazing] [👍 Good] [👎]  │
├─────────────────────────────┤
│ Hellmuth Eliminated         │
│ Set over Set                │
│ #Bubble_Burst                │
│ [📝 Text] [🎬 Processing]   │
│ 👍 좋아요 892               │
└─────────────────────────────┘
```

**팬 상호작용**:

- **좋아요**: 핸드/선수에 좋아요 → KP 후보 데이터로 활용
- **만족도 평가**: VOD 시청 후 🔥(Amazing) / 👍(Good) / 👎(Meh) 선택
- **데이터 활용**: Producer에게 팬 선호도 피드백 제공

---

## 핵심 데이터 구조

```json
{
  "story_id": "WSOP2024_ME_D2_S234",
  "story_core": {
    "value_score": 5,
    "producer_tags": ["#Comeback_Story"],
    "key_player": "Phil Ivey"
  },
  "hand_detail": {
    "participants": ["ivey_001", "negreanu_001", "player_c"],
    "pot_size": 125000,
    "winner": "negreanu_001",
    "action_sequence": [...],
    "chip_stacks": {
      "ivey_001": { "before": 100000, "after": 37500 },
      "negreanu_001": { "before": 87500, "after": 150000 }
    }
  },
  "time_sync": {
    "actual": "2024-11-04T14:30:00Z",
    "hand_duration": "00:02:15",
    "broadcast_sync": "2024-11-04T16:00:00Z"
  },
  "media_package": {
    "raw_clips": ["gdrive.com/A1.mp4", "gdrive.com/A2.mp4", "gdrive.com/B1.mp4"],
    "edited_vod": "youtube.com/watch?v=xxx",
    "text_log": "complete"
  },
  "fan_engagement": {
    "likes": 245,
    "reactions": {
      "amazing": 178,
      "good": 54,
      "meh": 13
    }
  }
}
```

**데이터 수집**:

- **칩스택**: 로거가 틈틈이 입력 (선택 사항)
- **팬 반응**: 실시간 집계 → Producer 피드백

---

## 운영 프로토콜

### 스포터 배치
- Zone당 1명 (3-4 테이블 커버)
- KP 테이블 집중 관찰
- 파이널 테이블 2명 교차 검증

### 입력 우선순위
1. KP 참여 핸드 - 필수
2. ⭐⭐⭐ 이상 스토리 - 필수
3. Producer Pick 대상 - 필수
4. 일반 데이터 - 선택

### 품질 보증

- 타임마커 정확도: 초 단위
- 스토리 가치: 스포터 판단 + Producer 검증
- 미디어 매칭: 자동 시스템 (실패 시 수동 싱크)
- 시간 동기화: 촬영 전 현지 시간 수동 설정 (필수 프로토콜)

---

## Phase 1 구현 일정

### Week 1-3: Core Infrastructure
- Story Hub 중앙 데이터베이스
- 실시간 처리 파이프라인
- 방송 동기화 시스템

### Week 4-6: Field Logger App

- KP 우선 표시 시스템
- 스토리 가치 평가
- 타임마커 시스템
- WiFi Direct 자동 전송
- 칩스택 입력 (선택)

### Week 7-9: Broadcast Admin

- Producer's Dashboard
- 스토리라인 태깅 (수동)
- BDP 편집 큐 (시간순)
- VOD 업로드 시스템 (구글 드라이브 → YouTube)

### Week 10-11: Fan Interface

- My Stable
- Key Hand Feed
- 푸시 알림 시스템 (방송 시간 동기화)
- 팬 상호작용 (좋아요, 만족도 평가)

### Week 12: Integration Test
- 전체 플로우 검증
- 방송 동기화 테스트
- 파일럿 운영

---

## 핵심 운영 원칙

### 기술 스택

- **영상 전송**: WiFi Direct (백업: SD 카드)
- **원본 저장**: 구글 드라이브
- **VOD 배포**: YouTube (무료, 방송 시간 동기화)
- **실시간 DB**: Firebase/Firestore

### 커뮤니케이션

- **Producer ↔ 스포터**: 인터컴 실시간 소통
- **Producer ↔ BDP**: 동일 공간 조율
- **팬 알림**: 방송 시간 기준 배포

---

## Phase 2 진화 방향

### 자동화 도입

- AI 스토리 가치 예측 (스포터 보조)
- 자동 태깅 제안
- 클립 자동 편집
- 스포터 트레이닝 프로그램

### 팬 경험 확장

- 스토리 타임라인 시각화
- 팬 예측 게임
- KP 투표 시스템 강화
- 소셜 공유 최적화

### 분석 강화

- BDP 워크플로우 효율성 대시보드
- 팬 선호도 분석
- 스토리 맥락 메타데이터 (칩 트렌드, 대결 이력)

---

**The Story Hub는 WSOP 토너먼트를 하나의 거대한 스토리텔링 플랫폼으로 변환합니다.**