# Week 1 개발 진행 상황 요약

## 📊 전체 공정 요약 (2025-01-12)

### ✅ Week 0: 완료 (로그인 + Supabase 연동)

| 작업 | 상태 | 완료일 |
|------|------|--------|
| React + TypeScript + Vite 프로젝트 생성 | ✅ | 2025-01-12 |
| Supabase 프로젝트 생성 및 연결 | ✅ | 2025-01-12 |
| 인증 시스템 구현 (Email/Password) | ✅ | 2025-01-12 |
| Google OAuth 구현 | ✅ | 2025-01-12 |
| 이메일 확인 프로세스 추가 | ✅ | 2025-01-12 |
| 로그인 UI 개선 (앱 소개 + 애니메이션) | ✅ | 2025-01-12 |
| Protected Route 구현 | ✅ | 2025-01-12 |
| authStore (Zustand + Persist) | ✅ | 2025-01-12 |
| WelcomeHome 화면 (삭제됨, KP Dashboard로 대체) | ✅ | 2025-01-12 |

**주요 성과**:
- 로그인 후 바로 실무 화면(KP Dashboard)으로 이동
- 미니멀한 로그인 UI (앱 목적 명확히 표시)
- 무한 로딩 버그 수정 (`isInitialized` 추가)
- 이메일 미확인 시 안내 화면 표시

---

### ✅ Week 1 Day 1-2: 완료 (데이터베이스 마이그레이션)

| 작업 | 상태 | 파일 |
|------|------|------|
| `profiles` 테이블 생성 | ✅ | 20250112000001_create_profiles.sql |
| `kp_players` 테이블 생성 | ✅ | 20250112000002_create_kp_players.sql |
| `hands` 테이블 생성 | ✅ | 20250112000003_create_hands.sql |
| `hand_streets` 테이블 생성 | ✅ | 20250112000004_create_hand_streets.sql |
| RLS 정책 설정 (14개) | ✅ | 20250112000005_create_rls_policies_fixed.sql |
| Supabase Functions (7개) | ✅ | 20250112000006_create_functions.sql |
| Storage Bucket 생성 | ✅ | Dashboard UI (수동) |
| Seed 데이터 (10명 KP) | ✅ | seed.sql |

**주요 성과**:
- 완전한 데이터베이스 스키마 구축
- Optimistic Locking (동시성 제어)
- Sparse Column Reads (성능 최적화)
- Batched API (`init_app` 함수)
- Idempotency 지원 (중복 방지)

**데이터베이스 상태**:
```
✅ Tables: 4
✅ RLS Policies: 14
✅ Functions: 13
✅ Storage Buckets: 1
✅ KP Players: 10
```

---

### 🎯 Week 1 Day 3-4: 완료 (인증 시스템)

이미 Week 0에서 완료되어 앞당겨짐.

---

### 🚀 Week 1 Day 5-7: 다음 단계 (KP Dashboard)

**목표**: Logger가 KP를 Claim하고 관리할 수 있는 대시보드 구현

**예상 소요 시간**: 3일 (2025-01-13 ~ 2025-01-15)

---

## 📋 Week 1 Day 5-7 상세 명세

### 🎨 화면 구성 (Screen 1: KP Dashboard)

```
┌─────────────────────────────────────────┐
│  KP Dashboard                    [Menu] │  ← Header (Sticky)
│  8 / 10 Claimed                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📷 Phil Ivey          💰 1.5M   │   │  ← KP Card 1
│  │ Table 1 • Seat 3                │   │
│  │ [Claim] [Log Hand]              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📷 Daniel Negreanu    💰 2.3M   │   │  ← KP Card 2 (Claimed by me)
│  │ Table 2 • Seat 5                │   │
│  │ [Unclaim] [Log Hand] [Update]   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📷 Tom Dwan (Claimed by Bob)    │   │  ← KP Card 3 (Claimed by others)
│  │ Table 3 • Seat 2                │   │
│  │ [Claimed by Others]             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ... (7 more KP cards)                  │
│                                         │
├─────────────────────────────────────────┤
│  [Home] [Hand Input] [Admin] [Profile]  │  ← Bottom Nav
└─────────────────────────────────────────┘
```

---

### 🔧 구현할 컴포넌트 (7개)

#### 1. `KPDashboard.tsx` (메인 컨테이너)
**위치**: `vtc-app/src/features/kp-dashboard/components/KPDashboard.tsx`

**기능**:
- KP 목록을 Grid 형태로 표시
- Realtime으로 다른 로거의 Claim 상태 반영
- "X / Total Claimed" 통계 표시
- 로딩 상태 처리
- 에러 상태 처리

**Props**: 없음 (자체적으로 데이터 fetch)

**사용하는 Hook**:
- `useKPList()` - KP 목록 조회
- `useKPClaim()` - Claim/Unclaim
- `useRealtimeKPUpdates()` - Realtime 구독

**코드 예시**:
```tsx
export function KPDashboard() {
  const { data: kpList, isLoading } = useKPList();
  const { claimKP, unclaimKP } = useKPClaim();
  const { vibrate } = useHaptic();

  if (isLoading) {
    return <LoadingOverlay message="KP 목록 로딩 중..." />;
  }

  const claimedCount = kpList?.filter(kp => kp.current_logger_id).length || 0;

  return (
    <div className="kp-dashboard">
      <header>
        <h1>KP Dashboard</h1>
        <p>{claimedCount} / {kpList?.length} Claimed</p>
      </header>

      <div className="kp-grid">
        {kpList?.map((kp) => (
          <KPCard
            key={kp.kp_id}
            kp={kp}
            onClaim={() => claimKP({ kpId: kp.kp_id, expectedVersion: kp.version })}
            onUnclaim={() => unclaimKP({ kpId: kp.kp_id })}
          />
        ))}
      </div>
    </div>
  );
}
```

---

#### 2. `KPCard.tsx` (개별 KP 카드)
**위치**: `vtc-app/src/features/kp-dashboard/components/KPCard.tsx`

**기능**:
- KP 정보 표시 (사진, 이름, 테이블, 좌석, 칩)
- Claim 상태에 따른 버튼 표시
  - Unclaimed: [Claim] 버튼
  - Claimed by me: [Unclaim] [Log Hand] 버튼
  - Claimed by others: [Claimed by Others] (비활성)
- Framer Motion 애니메이션 (Hover, Tap)
- Haptic Feedback (클릭 시 진동)

**Props**:
```typescript
interface KPCardProps {
  kp: KPPlayer;
  onClaim: () => void;
  onUnclaim: () => void;
}
```

**상태별 UI**:
1. **Unclaimed** (아직 아무도 Claim 안함)
   ```
   ┌─────────────────────────────────┐
   │ 📷 Phil Ivey          💰 1.5M   │
   │ Table 1 • Seat 3                │
   │ [Claim]                         │
   └─────────────────────────────────┘
   ```

2. **Claimed by me** (내가 Claim함)
   ```
   ┌─────────────────────────────────┐
   │ 📷 Phil Ivey          💰 1.5M   │
   │ Table 1 • Seat 3                │
   │ 🟢 Claimed by You               │
   │ [Unclaim] [Log Hand]            │
   └─────────────────────────────────┘
   ```

3. **Claimed by others** (다른 로거가 Claim함)
   ```
   ┌─────────────────────────────────┐
   │ 📷 Tom Dwan           💰 900K   │
   │ Table 3 • Seat 2                │
   │ 🔴 Claimed by Alice             │
   │ [View Only]                     │
   └─────────────────────────────────┘
   ```

**코드 예시**:
```tsx
export function KPCard({ kp, onClaim, onUnclaim }: KPCardProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const isClaimed = !!kp.current_logger_id;
  const isClaimedByMe = kp.current_logger_id === userId;

  return (
    <motion.div
      className="kp-card"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 사진 + 정보 */}
      <div className="flex items-center gap-3">
        <img src={kp.photo_url || '/default-avatar.png'} />
        <div className="flex-1">
          <h3>{kp.player_name}</h3>
          <p>Table {kp.table_no} • Seat {kp.seat_no}</p>
        </div>
        <div className="chip-count">
          {kp.chip_count?.toLocaleString()}
        </div>
      </div>

      {/* 버튼 */}
      {!isClaimed && (
        <button onClick={onClaim} className="btn-primary">Claim</button>
      )}
      {isClaimedByMe && (
        <>
          <button onClick={onUnclaim} className="btn-secondary">Unclaim</button>
          <button onClick={() => navigate(`/hand-input/${kp.kp_id}`)} className="btn-success">
            Log Hand
          </button>
        </>
      )}
      {isClaimed && !isClaimedByMe && (
        <div className="claimed-by-others">Claimed by Others</div>
      )}
    </motion.div>
  );
}
```

---

#### 3. `KPGridView.tsx` (Grid 레이아웃)
**위치**: `vtc-app/src/features/kp-dashboard/components/KPGridView.tsx`

**기능**:
- KP 카드를 Grid 형태로 배치
- 반응형 디자인 (모바일: 1열, 태블릿: 2열, 데스크탑: 3열)
- 가상 스크롤 (많은 KP가 있을 경우 성능 최적화)

**Props**:
```typescript
interface KPGridViewProps {
  kpList: KPPlayer[];
  onClaimKP: (kpId: string, version: number) => void;
  onUnclaimKP: (kpId: string) => void;
}
```

---

#### 4. `KPClaimModal.tsx` (Claim 확인 모달)
**위치**: `vtc-app/src/features/kp-dashboard/components/KPClaimModal.tsx`

**기능**:
- Claim 전 확인 모달
- KP 정보 표시
- "정말 이 KP를 담당하시겠습니까?" 확인
- 애니메이션 (Bottom Sheet 스타일)

**Props**:
```typescript
interface KPClaimModalProps {
  kp: KPPlayer;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
```

---

### 🪝 구현할 Hooks (4개)

#### 1. `useKPList.ts` - KP 목록 조회
**위치**: `vtc-app/src/features/kp-dashboard/hooks/useKPList.ts`

**기능**:
- Supabase RPC `get_kp_list_sparse()` 호출
- React Query로 캐싱 (5분 stale time)
- Zustand에 동기화
- 에러 처리

**코드 예시**:
```typescript
export function useKPList() {
  const { setKPList } = useKPStore();

  return useQuery({
    queryKey: ['kp-list'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_kp_list_sparse');
      if (error) throw error;
      setKPList(JSON.parse(data));
      return JSON.parse(data) as KPPlayer[];
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
```

---

#### 2. `useKPClaim.ts` - Claim/Unclaim
**위치**: `vtc-app/src/features/kp-dashboard/hooks/useKPClaim.ts`

**기능**:
- `claim_kp()` RPC 호출
- `unclaim_kp()` RPC 호출
- Optimistic UI 업데이트
- 에러 처리 (VERSION_CONFLICT, ALREADY_CLAIMED)
- Toast 알림

**코드 예시**:
```typescript
export function useKPClaim() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  const claimKP = useMutation({
    mutationFn: async ({ kpId, expectedVersion }: { kpId: string; expectedVersion: number }) => {
      const { data, error } = await supabase.rpc('claim_kp', {
        p_kp_id: kpId,
        p_logger_id: userId,
        p_expected_version: expectedVersion,
      });

      if (error) throw error;

      const result = JSON.parse(data);
      if (!result.success) {
        throw new Error(result.message);
      }

      return result.kp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kp-list'] });
      toast.success('KP를 담당하게 되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const unclaimKP = useMutation({
    mutationFn: async ({ kpId }: { kpId: string }) => {
      const { data, error } = await supabase.rpc('unclaim_kp', {
        p_kp_id: kpId,
        p_logger_id: userId,
      });

      if (error) throw error;

      const result = JSON.parse(data);
      if (!result.success) {
        throw new Error(result.message);
      }

      return result.kp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kp-list'] });
      toast.success('KP 담당을 해제했습니다.');
    },
  });

  return { claimKP: claimKP.mutate, unclaimKP: unclaimKP.mutate };
}
```

---

#### 3. `useRealtimeKPUpdates.ts` - Realtime 구독
**위치**: `vtc-app/src/features/kp-dashboard/hooks/useRealtimeKPUpdates.ts`

**기능**:
- `kp_players` 테이블 변경 감지
- 다른 로거가 Claim/Unclaim 시 실시간 반영
- Zustand 스토어 자동 업데이트

**코드 예시**:
```typescript
export function useRealtimeKPUpdates() {
  const { updateKP } = useKPStore();

  useEffect(() => {
    const channel = supabase
      .channel('kp-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kp_players',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            updateKP(payload.new.kp_id, payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [updateKP]);
}
```

---

#### 4. `useHaptic.ts` - Haptic Feedback
**위치**: `vtc-app/src/shared/hooks/useHaptic.ts`

**기능**:
- 버튼 클릭 시 진동 피드백
- 모바일에서만 동작
- `light`, `medium`, `heavy` 세기 선택

**코드 예시**:
```typescript
export function useHaptic() {
  const vibrate = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if ('vibrate' in navigator) {
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
  }, []);

  return { vibrate };
}
```

---

### 🗂️ Zustand 스토어

#### `kpStore.ts`
**위치**: `vtc-app/src/features/kp-dashboard/store/kpStore.ts`

**기능**:
- KP 목록 전역 상태 관리
- Realtime 업데이트 반영
- 개별 KP 업데이트

**코드 예시**:
```typescript
interface KPState {
  kpList: KPPlayer[];
  setKPList: (list: KPPlayer[]) => void;
  updateKP: (kpId: string, updates: Partial<KPPlayer>) => void;
}

export const useKPStore = create<KPState>((set) => ({
  kpList: [],
  setKPList: (list) => set({ kpList: list }),
  updateKP: (kpId, updates) =>
    set((state) => ({
      kpList: state.kpList.map((kp) =>
        kp.kp_id === kpId ? { ...kp, ...updates } : kp
      ),
    })),
}));
```

---

### 🎨 스타일링

**Tailwind CSS 클래스 예시**:
```css
/* KP Card */
.kp-card {
  @apply bg-gray-800 rounded-lg p-4 border border-gray-700;
  @apply hover:border-blue-500 transition-colors;
}

/* Claimed Badge */
.claimed-badge {
  @apply text-xs font-medium px-2 py-1 rounded-full;
}

.claimed-badge-me {
  @apply bg-green-500/20 text-green-400;
}

.claimed-badge-others {
  @apply bg-red-500/20 text-red-400;
}

/* Chip Count */
.chip-count {
  @apply text-lg font-bold text-green-400;
}
```

---

### 📊 완료 기준

- [ ] KP 목록이 Grid로 표시됨
- [ ] Claim 버튼 클릭 시 KP 담당 표시
- [ ] Unclaim 버튼 클릭 시 담당 해제
- [ ] 다른 로거가 Claim 시 실시간 반영
- [ ] "Log Hand" 버튼 클릭 시 Hand Input 화면으로 이동
- [ ] 로딩 중 Skeleton UI 표시
- [ ] 에러 발생 시 Toast 알림
- [ ] 모바일 반응형 디자인
- [ ] Haptic Feedback 동작 (모바일)
- [ ] Framer Motion 애니메이션

---

### 🧪 테스트 시나리오

1. **KP 목록 조회**
   - 로그인 후 KP Dashboard 진입
   - 10명의 KP 카드 표시 확인

2. **KP Claim**
   - Unclaimed KP의 [Claim] 버튼 클릭
   - "Claimed by You" 배지 표시 확인
   - [Unclaim] [Log Hand] 버튼 표시 확인

3. **KP Unclaim**
   - [Unclaim] 버튼 클릭
   - [Claim] 버튼으로 되돌아옴 확인

4. **Realtime 업데이트**
   - 다른 브라우저/기기에서 같은 KP Claim
   - 첫 번째 브라우저에서 "Claimed by Others" 표시 확인

5. **충돌 감지**
   - 같은 KP를 동시에 Claim 시도
   - "다른 로거가 이미 이 KP를 담당하고 있습니다" 에러 확인

6. **버전 충돌**
   - KP 정보가 변경된 후 Claim 시도
   - "KP 정보가 변경되었습니다. 새로고침 후 다시 시도하세요" 에러 확인

---

## 🗓️ 다음 단계 (Week 1 Day 8+)

### Week 2: Hand Input (Screen 2 & 3)
- QuickLogMode: 간단한 핸드 기록
- FullLogMode: 상세한 핸드 기록 (Street별)
- Offline Queue 구현

### Week 3: Admin Dashboard & Photo Upload
- Admin Dashboard: Realtime 모니터링
- Photo Upload: 카메라 캡처 + 업로드

---

**마지막 업데이트**: 2025-01-12
**다음 마일스톤**: Week 1 Day 5-7 (KP Dashboard 구현)
