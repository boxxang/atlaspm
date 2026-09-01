# AtlasPM 전면 UI 재설계 — 시안 프롬프트 (1단계: 캔버스)

> 이 파일을 통째로 새 Claude Code 세션에 붙여넣으세요.
> 이 단계의 산출물은 **시안뿐입니다.** 앱 코드는 한 줄도 바꾸지 않습니다.

---

## 요청

AtlasPM의 UI를 전면 재설계한다. `/design` 스킬로 디자인 캔버스를 만들고,
화면 5개의 **현재 상태와 시안**을 아트보드로 나란히 올려라.

이건 리스킨이 아니라 **정보 구조와 배치까지 다시 짜는 재설계**다. 색만 바꾸는
시안은 이 요청에 대한 답이 아니다.

## 시작하기 전에 읽을 것

1. `README.md` — 상단 100줄. 앱이 무엇이고 화면이 어떻게 연결되는지.
2. `src/app/globals.css` — `:root` 토큰 블록(1~60줄). 지금의 시각 언어 전부가 여기 있다.
3. 화면별 컴포넌트 — 아래 "화면 5개" 절에 파일 경로를 적어두었다.
4. 가능하면 `npm run dev`로 앱을 띄우고 5개 화면을 직접 캡처해라
   (`npm run db:reset`으로 AtlasAX1 시드가 들어간다). **기준선이 정확해야
   시안을 평가할 수 있다.** 브라우저를 못 쓰면 컴포넌트와 CSS를 읽어서
   현재 상태 아트보드를 재현해라.

## AtlasPM이 무엇인가

반도체 SoC 프로그램 관리 도구다. 사용자는 **TPM(Technical Program Manager)**
한 명 — 여러 프로그램을 동시에 들고, 매일 "지금 어느 단계가 돌고 있고, 무엇이
늦었고, 테이프아웃까지 며칠 남았나"를 확인한다.

프로그램 하나는 12~23개 **stage**(Product Definition, RTL, DV, Physical Design,
Tapeout, …)로 구성되고, stage들은 **의도적으로 겹쳐서** 병렬로 돈다. 모든 날짜는
`kickoff + 프로필 오프셋`에서 계산되며 저장되지 않는다.

## 재설계로 풀어야 할 문제 세 가지

이 세 가지가 시안의 평가 기준이다. 시안마다 각각을 어떻게 풀었는지 말할 수 있어야 한다.

### 1. 정보 밀도가 과하다
Main 화면 한 장에 로드맵 축 + 병렬 간트 + stage 패널(리더 행, 날짜 편집 행,
SVG 일러스트, 보드 3개, 상세 시트)이 전부 들어간다. 스크롤이 길고, 처음 여는
사람은 어디를 봐야 하는지 모른다. **무엇을 접고 무엇을 펼칠지, 무엇이 한 화면에
같이 있어야 하는지**를 다시 판단해라.

### 2. 시각적으로 낡았다
밝은 문서 테마(`--page:#f9f9f7`), 시스템 폰트, 단일 액센트 `#256abf`, 얇은
1.25px 보더, 대문자 자간 캡션. 정보 도구로서 정직하지만 2015년 문서처럼 보인다.
**밀도와 진지함은 유지하면서** 현대적인 시각 언어로 옮겨라. 소비자 SaaS의
둥근 모서리와 큰 여백으로 도망가는 건 답이 아니다 — 이 화면들은 정보가
빽빽해야 쓸모가 있다.

### 3. 탐색 구조가 헷갈린다
- Programs 목록 → Main → Activity 상세는 **페이지**
- Dashboard는 Main 위에 덮이는 **고정 오버레이**(툴바 토글로 전환)
- 보드는 **모달**(1120px 고정 창)
- Stage 상세는 Main 안의 **인라인 시트**

같은 깊이의 정보가 네 가지 다른 방식으로 열린다. **한 사람이 하루를 어떻게
도는지**를 기준으로 이 관계를 다시 짜라.

---

## 화면 5개 — 지금 무엇이 올라와 있나

시안은 아래 내용을 **전부 수용**해야 한다. 빼려면 어디로 옮겼는지 말해라.

### A. Programs 목록 `/`
`src/components/ProjectList.tsx`

프로그램 카드 그리드. 카드 1장에:
- 프로그램 이름, `EDITED` 플래그(수동 날짜 편집이 있으면), 프로필 라벨
- 진행 바 + 퍼센트
- 오늘 진행 중인 stage 칩 (열린 리스크가 있으면 빨강)
- fact 6개: Kickoff / Tapeout + D-day / Open Risks / Overdue / Effort(man-month) / Est. Cost
- 액션: 열기 · 복제 · 삭제(확인 단계 있음)
- 맨 뒤에 "새 프로그램" 카드 → 이름 / 예상 kickoff / 스케줄 프로필 입력 폼

### B. Main (프로그램 뷰) `/p/[projectId]` — 가장 무거운 화면
`src/components/AppShell.tsx` `Toolbar.tsx` `Roadmap.tsx` `StagePanel.tsx` `InlineArea.tsx`

위에서부터:

**툴바** (58px 고정)
`‹ Programs` / 프로그램명(인라인 편집) / 날짜 read-out 3개 (Kick-off · MTO(테이프아웃)
· MP(양산)) / `Milestone template` 셀렉트 / `Edit template` 버튼 / `EDITED` 플래그 /
정보 팝오버 / 설정 팝오버 / `Main | Dashboard` 토글. 좌하단에 `AtlasPM` 브랜드 배지.

**로드맵** — 하나의 날짜 축을 두 번 읽는다
- 위: lifecycle phase 밴드 + 마일스톤 다이아몬드(각자의 날짜 위치에)
- 아래: stage별 concurrency 간트 바. 과거는 회색 / 미래는 컬러로 분할, 열린
  리스크가 있는 stage는 빨강, TODAY 세로선, kickoff 마커(편집 가능)
- 바를 고르면 아래 stage 패널이 열리고, 다시 고르면 닫힌다
- **stage가 23개면 이 차트만 600px에 가깝다**

**Stage 패널** (바 선택 시)
- phase 캡션 · stage 번호 · 약칭 · 제목 · 태그라인
- Stage Leader 행 (이름 · 전화 · 이메일 · 편집)
- 날짜 편집 행: 시작 ━ TAT(주) ━ 종료. 편집하면 뒤 stage로 파급된다
- SVG stage 일러스트
- **보드 3개**: Key Information / Activities / Risks. 각각 최신 3건 + 최신 상태
  업데이트 미리보기 + `Show more`. 컬럼 폭은 드래그로 조절되고 보드마다 따로 기억된다
- **Stage Details 인라인 시트** (기본 펼침): What happens · 엔지니어링 테이블
  (TAT / man-month) · Tools · Teams · Deliverables 체크리스트(due / completed) ·
  Contacts CRUD

### C. Dashboard (Main 위 고정 오버레이)
`src/components/Dashboard.tsx`

- 제목 행 + 부제
- stat 5개: Program Progress % / Tapeout D-day / Open Risks / Overdue Activities /
  Estimated Cost (요율 입력 포함). 리스크·지연은 0이 아니면 alert 상태
- 2단 그리드
  - 왼쪽: Upcoming Milestones (날짜 · 이름 · D-day) + In-Flight stage 칩 (리스크 있으면 빨강)
  - 오른쪽: Recent Status Updates 2줄 피드 (stage 태그 + 본문, 클릭 시 항목 모달) + `Show more`
- 하단: Program Schedule 간트 — 36px 행, 마일스톤 다이아몬드가 자기 날짜 위에
  정확히, 옆에 라벨 칩(오른쪽 끝에선 뒤집힘), TODAY 라인

### D. Board 모달
`src/components/BoardModal.tsx`

1120px × 88vh 고정 창.
- 헤더: 보드 제목 · stage/프로그램 메타 · 필터 · 액션
- 리스트: 10건 페이저, 컬럼 드래그 리사이즈
- 행을 클릭하면 split pane
  - **item view**: 본문 + 상태 업데이트 스레드 (작성 / 수정 / 삭제, 수정해도 원래 타임스탬프 유지)
  - **editor**: title / owner(stage 인원 중 선택) / due / body
- **집계 보드 3종**: Open Risks · Overdue · Status Updates — 전 stage를 가로지르고
  각 행에 stage 태그, 행을 누르면 그 항목으로 파고든다

### E. Activity 상세 `/p/[projectId]/activity/[ACT-ID]`
`src/components/ActivityDetailView.tsx`

긴 읽기 문서. 모달이 아니라 **주소를 가진 페이지**다 — 링크로 공유된다.
- 상단 바: 뒤로 / `Critical path` 배지
- 헤더: activity ID · 제목 · 브레드크럼 · 이전/다음 이동
- fact 4개: Takes(기간) / Costs(man-month, 인원 환산) / Owner(승인자) / Runs(시작~종료 날짜)
- 2단 본문: Why it exists · What it delivers(산출물 목록) · Needs first(선행 조건) ·
  Done when(완료 기준) 등 섹션

---

## 바꿔도 되는 것 (C이므로 넓다)

- 색 · 타이포 · 간격 · 보더 · 라운딩 · 음영 — **전부**
- 화면 구성과 정보 배치. 무엇이 한 화면에 같이 있는지
- Main / Dashboard 의 관계 (지금은 오버레이 토글 — 다른 구조여도 된다)
- 보드 3개를 나란히 두는 결정
- 무엇을 모달로 열고 무엇을 페이지로 둘지
- 인라인 시트가 기본 펼침인 결정
- **`reference/index.html`은 더 이상 시각 스펙이 아니다.** `CLAUDE.md`는 "픽셀
  문제는 reference가 이긴다"고 적혀 있지만, 이 재설계에서 그 규칙은 **동작 스펙에만**
  적용된다. 시각적으로는 reference를 무시해라.

## 바꾸면 안 되는 것

- **데이터 모델과 파생값.** 진행률(완료 deliverable / 전체), overdue(!done && due < today),
  D-day, 마일스톤 위치(stage 종료에 앵커), TODAY 마커 — 계산식은 그대로다
- **stage 목록은 프로필에서 나온다.** 코드에 박혀 있지 않고 프로필마다 개수가 다르다.
  **12개에서도 23개에서도 무너지지 않는 레이아웃**이어야 한다
- 날짜 표기는 `MM/DD/YYYY`, **UI 텍스트는 전부 영어**
- 컴포넌트 라이브러리 도입 금지 (`CLAUDE.md`)
- **데스크톱 우선.** 1280 / 1440 / 1920에서 동작. 기준 폭은 **1440**
- 시안에 쓰는 콘텐츠는 시드 프로그램 `AtlasAX1`의 실제 값을 써라. 가짜 이름을 지어내지 마라

---

## 산출물

`/design` 캔버스 하나에:

1. **화면당 아트보드** (1440px 폭 기준)
   - 현재 상태 1장
   - 시안 2장 — **방향이 서로 다른 2안**이어야 한다. 같은 안의 변주는 소용없다
   - Main은 가장 어려운 화면이므로 **3안**까지
2. **토큰 아트보드 1장** — 시안이 쓰는 색 팔레트, 타이포 스케일, 간격 스케일을
   실제 값(hex, px/rem)으로. 이게 다음 단계에서 `:root`로 옮겨진다
3. **시안마다 한 문단** — 위의 문제 세 가지 중 무엇을 어떻게 풀었고, 무엇을
   접었고, 무엇을 포기했는지
4. **구조 변경 표시** — 레이아웃이나 DOM 구조가 바뀌는 지점을 시안마다 명시해라.
   Playwright e2e 18개 스펙에 `boundingBox` / `getComputedStyle` 단언이 **101곳**
   있어서, 여기가 다음 단계의 실제 비용이다

## 하지 말 것

- `src/` 아래 어떤 파일도 수정하지 마라. **`globals.css`는 손대지 마라**
- `CLAUDE.md`를 고치지 마라 (별도로 결정한다)
- 없는 기능을 발명하지 마라. 위 5개 화면 목록에 있는 것만 다뤄라
- 모바일 레이아웃을 만들지 마라
- 시안을 코드로 옮기려 하지 마라. 이 단계는 **결정을 내리기 위한 그림**까지다

---

## 끝나면

캔버스 링크와 함께, 각 화면에서 **당신이 추천하는 안**과 그 이유를 한 줄씩 보고해라.
