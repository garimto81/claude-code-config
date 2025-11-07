PD님, VTC팀의 워크플로우와 '다중 사용자' 동시 접속 요구사항을 완벽하게 통합한 "완전 무결한" 독립형 앱 PRD(v2.0)를 작성했습니다.

이 문서는 VTC팀의 '분류 지옥' 문제를 정의하고, **Supabase의 실시간 상태 동기화(Real-time State Sync)**를 통해 여러 명의 로거가 데이터 충돌 없이 동시에 작업할 수 있는 아키텍처를 핵심 솔루션으로 제시합니다.

---

### [PRD] "VTC Story Ledger" App (v2.0 - Multi-User Concurrent Edition)

* **프로젝트 명:** VTC Story Ledger (현장 스토리-스테이트 로거)
* **문서 버전:** 2.0 (2025-11-06)
* **핵심 아키텍처:** **Supabase** (PostgreSQL, Auth, **Realtime-State Sync**)

---

### 1. VTC팀 업무 워크플로우 및 핵심 문제 (The "Why")

이 앱의 설계를 이해하기 위해, VTC(Virtual Table Contents)팀의 핵심 워크플로우와 '다중 사용자' 환경에서 발생하는 문제를 먼저 정의합니다.

#### 1.1. VTC팀의 핵심 목표
VTC팀의 목표는 포커 토너먼트의 하이라이트 핸드를 '버추얼 테이블 콘텐츠'(그래픽, 통계, 플레이어 정보가 포함된 방송용 클립)로 제작하는 것입니다.

#### 1.2. 현재 워크플로우 및 "Pain Point"
VTC 콘텐츠 제작에는 **A (영상)**와 **B (데이터)**라는 두 가지 소스가 필요합니다.

* **A (영상 소스):** '헌터'(카메라 오퍼레이터)가 현장에서 SD카드로 영상을 촬영합니다.
    * *결과물:* `C0001.MP4` (파일 생성 시간: `14:30:05`), `C0002.MP4` (파일 생성 시간: `14:32:15`)...
* **B (데이터 소스):** '데이터 로거'(본 앱의 사용자)가 현장에서 '스토리'를 관찰합니다.
    * *결과물:* "14:32 경, Daniel K.(KP)가 AA를 들고 Seat 5(QQ)와 Preflop 올인에서 승리함."
* **Pain Point ("분류 지옥"):**
    VTC팀(후반 편집팀)은 `C0002.MP4` 파일을 직접 열어 재생하기 전까지는, 이 영상이 `AA vs KK` 스토리인지, 아니면 아무 일 없는 폴드 장면인지 알 수 없습니다. VTC팀은 수백 개의 영상 클립과 로거의 메모를 **수동으로** 대조하며 '스토리'와 '영상'을 매칭시키는 데 막대한 시간을 소모하고 있습니다.

#### 1.3. 본 프로젝트의 솔루션 (The App's Role)
"VTC Story Ledger" 앱은 이 '분류 지옥'을 **타임스탬프(Timestamp) 동기화**를 통해 원천적으로 해결합니다.

1.  로거가 '스토리'(`AA vs KK`) 입력을 마치고 `[전송]`을 누르는 순간, 앱은 이 '데이터 패키지'에 정확한 서버 시간(`created_at: "14:32:15"`)을 'Key' 값으로 찍어 중앙 DB(Supabase)에 전송합니다.
2.  VTC팀의 자동화 시스템은 **`영상 파일 시간 (14:32:15)` == `데이터 타임스탬프 (14:32:15)`** 라는 단일 Key로 두 소스를 1:1 자동 매칭합니다.



#### 1.4. '다중 사용자' 환경의 핵심 문제 (Concurrency Problem)
VTC 프로덕션에는 10명 이상의 로거가 동시에 앱을 사용할 수 있습니다. 이로 인해 두 가지 심각한 문제가 발생합니다.

1.  **데이터 충돌 (Input Collision):** 로거 A와 로거 B가 *동시에* 'Table 4'의 핸드를 로깅하려 할 때, 누구의 입력을 저장해야 하는지, 데이터가 덮어씌워지는 문제는 없는지 알 수 없습니다.
2.  **VTC팀의 혼란 (Consumer Chaos):** VTC팀은 'Table 4'가 현재 로깅 중인지, 어떤 로거가 담당하고 있는지 알 수 없습니다.

#### 1.5. '다중 사용자' 문제 솔루션 (Real-time State Sync)
"VTC Story Ledger" 앱은 **'테이블 상태 실시간 동기화 (Table State Sync)'**를 통해 이 문제를 해결합니다.

* **솔루션:** 로거 A가 'Table 4'의 로깅을 시작하는 순간, 앱은 이 상태를 Supabase DB에 **'즉시(Realtime)'** 기록합니다. 로거 B의 앱은 이 상태를 실시간으로 구독(Listen)하여, 자신의 UI에 "Table 4: (Logger A가 로깅 중)"이라고 표시하고 해당 테이블을 '잠금(Lock)' 처리합니다.

---

### 2. 프로젝트 개요 (The "What")

#### 2.1. 프로젝트 정의
"VTC Story Ledger"는 **'다중 사용자'** 환경을 전제로 한 VTC팀 전용 '독립형 데이터 로깅 앱'입니다. Supabase의 실시간 동기화 기능을 활용하여, 여러 명의 로거가 '테이블 상태'를 공유하고 충돌 없이 각자의 '스토리 스테이트(결과 값)'를 VTC팀의 중앙 DB(Supabase)로 전송합니다.

#### 2.2. 핵심 목표 (Objectives)

1.  **동시성 (Concurrency):** '테이블 상태 동기화(Table Claiming)' 모델을 도입하여, 여러 명의 로거가 데이터 충돌 없이 동시에 앱을 사용하도록 보장합니다.
2.  **유연성 (Flexible Logging):** "리버 액션만 입력"하는 VTC팀의 핵심 워크플로우를 완벽하게 지원합니다.
3.  **신속성 (Rapid Input):** 'KP 선택' 시 '테이블/플레이어 리스트'가 '자동 호출'되는 워크플로우를 제공합니다.
4.  **데이터 무결성 (Data Integrity):** VTC팀이 '스토리'를 재구성하는 데 필요한 '칩 변동 값'을 '칩 스테이트 원장(Chip-State Ledger)' 방식으로 정확하게 캡처합니다.
5.  **독립적 확장성 (Independent Scalability):** VTC팀의 후속 시스템이 실시간으로 데이터를 연동할 수 있는 **Supabase 아키텍처**를 채택합니다.

---

### 3. 시스템 아키텍처 (Supabase)

* **Frontend (Client):** **PWA (Progressive Web App)** (React/Vue.js)
* **Backend & Database:** **Supabase**
    * *인증:* Supabase **Auth** (로거 계정 관리)
    * *DB:* Supabase **PostgreSQL** (관계형 데이터 무결성 보장)
    * *실시간 (핵심):* Supabase **Realtime**
        1.  **(To VTC팀):** `hands` 테이블의 `INSERT` 이벤트를 VTC팀 시스템에 브로드캐스트.
        2.  **(To Loggers):** `tables` 테이블의 `current_logger_id` 필드 변경을 *모든 로거 앱*에 브로드캐스트 (상태 동기화용).
    * *보안 (핵심):* **RLS (Row Level Security)**
        * 로거는 `rosters`를 `READ`할 수 있습니다.
        * 로거는 `hands`에 `INSERT`만 할 수 있습니다.
        * 로거는 `tables` 테이블의 `current_logger_id`가 `NULL`이거나 *자신의 ID*일 때만 `UPDATE`할 수 있습니다. (데이터 충돌 원천 방지)

---

### 4. 핵심 사용자 플로우 (Multi-User Golden Path)

로거 A와 로거 B가 동시에 앱을 사용하는 시나리오입니다.

1.  **(로그인)** 로거 A, B가 PWA에 로그인합니다.
2.  **(실시간 대시보드)** 두 로거는 '5.1. 모듈 1 (실시간 대시보드)'를 봅니다. 모든 테이블(Tbl 1~10)이 `[Available]` (녹색) 상태로 표시됩니다.
3.  **(로거 A의 KP 선택 / "Claim")**
    * 로거 A가 `Daniel K. [Tbl 4] [Available]`을 탭합니다.
    * 로거 A의 앱이 Supabase `tables` 테이블의 `table_4` 행에 `current_logger_id = 'logger-A-uuid'`로 **UPDATE**를 시도합니다. (RLS 정책에 따라 성공)
4.  **(실시간 동기화)**
    * **즉시 (100ms 내):** Supabase Realtime이 이 변경을 감지하고 모든 구독자에게 브로드캐스트합니다.
    * **로거 B의 UI:** 로거 B의 대시보드에서 `Tbl 4`의 상태가 자동으로 `[Logged by: Logger A]` (회색/잠김)로 변경됩니다. 로거 B는 더 이상 `Tbl 4`를 선택할 수 없습니다.
5.  **(로거 A - 로깅 작업)**
    * 로거 A는 '5.2. 테이블 뷰'로 자동 이동합니다. 'BTN'을 선택하고, `[+ New Hand Log]`를 탭합니다.
    * '5.3. 스토리 스테이트 폼'에서 '리버 스테이트'와 '칩 원장'을 입력합니다.
    * `[ Save & Send to VTC ]`를 탭합니다.
6.  **(VTC 전송)**
    * 로거 A의 앱이 `hands` 테이블에 '스토리 JSON'을 `INSERT`합니다.
    * `created_at` 타임스탬프(`14:32:15`)가 찍힙니다.
7.  **(VTC팀 수신)** VTC팀의 시스템(별도 구독자)이 Supabase Realtime을 통해 이 `INSERT` 이벤트를 즉시 수신하고, `14:32:15` 타임스탬프를 가진 영상 파일(`C0002.MP4`)과의 자동 매칭을 시작합니다. (1.3. 솔루션)
8.  **(로거 A - "Unclaim")**
    * 로거 A가 핸드 로깅을 마치고 대시보드(모듈 1)로 돌아갑니다.
    * 앱이 `tables` 테이블의 `table_4` 행을 `current_logger_id = NULL`로 **UPDATE** (해제)합니다.
9.  **(실시간 동기화)** 로거 B의 UI에서 `Tbl 4`가 다시 `[Available]` (녹색) 상태로 변경됩니다.

---

### 5. 핵심 기능 모듈 (Frontend)

#### 5.1. 모듈 1: 실시간 대시보드 (KP 선택 및 상태 관제)
* **기능:** 'KP'를 선택하고, 모든 테이블의 '실시간 로깅 상태'를 관제합니다.
* **UI:** `rosters`와 `tables` 테이블을 조인(JOIN)한 리스트.
    * `[ Daniel K. | Tbl 4 ]` | `[ Available ]` (선택 가능)
    * `[ John P. | Tbl 7 ]` | `[ Logged by: Logger B ]` (선택 불가)
* **로직:**
    * 이 모듈은 Supabase Realtime을 통해 `tables` 테이블의 변경 사항을 **실시간으로 구독**해야 합니다.
    * `[Available]` 상태의 KP만 탭(Claim)할 수 있습니다.

#### 5.2. 모듈 2: 테이블 뷰 (BTN 선택)
* **기능:** 'KP 선택' 시 '플레이어 리스트'를 '자동 호출'하고, 'BTN 위치'를 '선택'받습니다.
* **UI:** 1~10번 좌석이 표시된 테이블 그래픽. `rosters` DB에서 로드된 플레이어 이름이 각 좌석에 표시됨. KP 좌석은 하이라이트됨.
* **로직:**
    1.  로거가 `Seat 3` 플레이어를 탭하여 BTN 위치를 선택하면, 해당 좌석에 'BTN' 마커가 표시됩니다.
    2.  `[ + New Hand Log ]` 버튼이 활성화됩니다.

#### 5.3. 모듈 3: "스토리 스테이트" 폼 (핵심 로깅)
* **기능:** '순차적 액션'이 아닌 '결과 값'을 폼으로 입력받습니다.
* **5.3.1. 로깅 시점 (Street Selection):** `[River]`가 기본값.
* **5.3.2. 관련 플레이어 (Player Selection):** `KP (고정)` / `Opponent(s) [ + ]`.
* **5.3.3. 카드 입력 (Showdown Input):** `Board [ + ]`, `KP [ + ]` 등. 쇼다운 시 관측된 카드만 입력.
* **5.3.4. [핵심 솔루션] 칩 원장 (Chip State Ledger):**
    * *'칩 변동' 요구사항에 대한 VTC팀 맞춤형 솔루션입니다.*
    * *UI (Global):* `Final Pot Size: [ (숫자 입력) ]`
    * *UI (Per-Player):*
        > **Player: Daniel K.**
        > `Stack (Before):` `[ (숫자 입력) ]`
        > `Stack (After):` `[ (숫자 입력) ]`
    * *로직:* `(Before)`는 5.3.1.에서 선택한 스트릿(예: River)의 **시작** 칩, `(After)`는 핸드 **종료** 칩. VTC팀은 `(Before) - (After)`로 투자액을 완벽하게 역산할 수 있습니다.

---

### 6. 데이터베이스 스키마 (Supabase - PostgreSQL)

#### 6.1. `profiles` (Auth 연동)
* `id` (uuid, PK, references auth.users): 로거 인증 ID
* `username` (text): 로거 이름
* `role` (text, enum: ['logger', 'admin']): (VTC팀 Admin용)

#### 6.2. `tables` (테이블 실시간 상태) - (Multi-User 핵심)
* `table_id` (uuid, PK): 테이블 고유 ID
* `table_name` (text): (예: "Feature Table 4")
* `current_logger_id` (uuid, FK -> profiles.id, nullable): **현재 이 테이블을 'Claim'한 로거의 ID.** (실시간 동기화 대상)
* `last_activity_at` (timestamptz): (오래된 클레임 해제용)

#### 6.3. `rosters` (명부 테이블)
* `player_id` (uuid, PK): 플레이어 고유 ID
* `name` (text): 플레이어 이름
* `is_kp` (boolean): KP 여부
* `current_table_id` (uuid, FK -> tables.table_id): 현재 배정된 테이블
* `current_seat` (int): 현재 좌석

#### 6.4. `hands` (VTC 핸드 로그 테이블) - (VTC팀 구독 대상)
* `hand_id` (uuid, PK, default gen_random_uuid()): 핸드 로그 고유 ID
* `created_at` (timestamfptz, default now()): **(영상 매칭용 핵심 Key)**
* `logger_id` (uuid, FK -> profiles.id): 입력한 로거
* `table_id` (uuid, FK -> tables.table_id): 발생 테이블
* `btn_seat` (int): BTN 좌석
* `kp_id` (uuid, FK -> rosters.player_id): KP
* `logging_street` (text, enum: ['Preflop', 'Flop', 'Turn', 'River']): 로거가 선택한 시점
* `final_pot_size` (bigint): 최종 팟 사이즈
* `board_cards` (jsonb): `{"f1":"KD", "f2":"QS", ...}`

#### 6.5. `hand_players_ledger` (핸드-플레이어 칩 원장)
* *설계: `hands` 테이블과 1:N 관계. VTC팀의 데이터 재구성을 위한 핵심 테이블.*
* `ledger_id` (uuid, PK)
* `hand_id` (uuid, FK -> hands.hand_id): (해당 핸드)
* `player_id` (uuid, FK -> rosters.player_id): (관련된 플레이어)
* `stack_before` (bigint): (예: River 시작 시 칩)
* `stack_after` (bigint): (핸드 종료 시 칩)
* `showdown_cards` (jsonb): `{"c1":"AS", "c2":"KH"}`