# 내 PC 에서 AtlasPM 실행하기

배포본은 데모입니다. 이건 실제 작업을 담는 쪽입니다 — 내 컴퓨터에서 돌고, 모든 것을 내
컴퓨터의 Postgres 에 저장하며, 다른 어디와도 통신하지 않습니다.

> **English:** [README.md](README.md)

마지막 문장은 정확히 말할 필요가 있습니다. 그게 이걸 하는 이유니까요. 이 앱은 런타임에
외부 호출을 하지 않습니다 — `fetch` 도, 애널리틱스도, 오류 리포팅도 없습니다. 폰트는
CDN 이 아니라 운영체제의 것입니다. 첨부는 어딘가로 업로드되지 않고 Postgres 에 바이트로
저장됩니다. 유일하게 바깥으로 나가던 것이 Next.js 빌드 텔레메트리였고, 설치 스크립트가
그걸 끕니다. 네트워크를 뽑아도 전부 돌아갑니다.

## 설치

    git clone https://github.com/boxxang/atlaspm.git /tmp/atlaspm-installer
    /tmp/atlaspm-installer/local/install.sh

Node 와 Postgres 가 필요하고, 없으면 스크립트가 먼저 말해줍니다:

    brew install node postgresql@17 && brew services start postgresql@17

그다음 **http://127.0.0.1:3210** 을 엽니다.

기본값이 맞지 않으면:

    --dir ~/atlaspm     설치 위치        --db atlaspm     DB 이름
    --port 3210         포트             --with-demo      데모 프로그램 시드

`--with-demo` 는 일부러 꺼져 있습니다. 없으면 프로그램 목록이 빈 채로 시작하고 **New
program** 으로 직접 만드시면 됩니다. 켜면 AtlasAX1 이 들어오는데, 둘러보기에는 좋지만
사용자님 것은 아닙니다.

## 무엇을 설치하는가

**자기만의 체크아웃** — 기본값 `~/atlaspm`, 개발용 사본과 분리됩니다. 안 그러면 `.env`
를 공유하게 되어, 한쪽을 겨냥한 `prisma db push` 가 다른 쪽에 떨어집니다.

**자기만의 DB** — `atlaspm`, `atlaspm_dev` 와 별개입니다.

**포트 3210** — 3000 이 아니라서, 개발용 사본에서 `npm run dev` 를 돌려도 충돌하지 않습니다.

**127.0.0.1 에만 바인딩.** 이 컴퓨터는 닿고 네트워크는 닿지 못합니다. **이 앱에는 로그인이
없어서**, 포트에 닿는 사람은 전부를 읽고 고칠 수 있습니다. 그래서 이게 옳은 기본값입니다.
나중에 동료에게 보여주고 싶어지면, 그건 플래그 하나가 아니라 별도의 작업입니다.

**로그인 시 자동 시작** — launch agent 로, 죽으면 다시 띄웁니다.

**매일 02:00 백업** — `~/atlaspm-backups` 에 30일치. 그 시각에 컴퓨터가 자고 있었으면
깨어날 때 launchd 가 돌립니다.

## 일상 운영

    launchctl bootout   gui/$UID/com.atlaspm.server          # 중지
    launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.atlaspm.server.plist   # 시작
    tail -f ~/atlaspm-backups/server.log                     # 로그
    ~/atlaspm/local/backup.sh                                # 지금 백업

## 업데이트

    ~/atlaspm/local/update.sh

**순서가 핵심입니다.** 무엇이든 움직이기 전에 **먼저 백업합니다** — `prisma db push` 에는
되돌리기가 없어서, 컬럼이 사라지면 덤프가 유일한 복구 수단입니다. 그다음 **구버전이 계속
서비스하는 동안** 새 빌드를 만들고, 그 빌드가 성공했을 때만 재시작합니다. 그래서 업데이트가
깨져도 잘 돌던 버전이 계속 떠 있고, 체크아웃은 되돌려지며, 방금 뜬 백업이 디스크에 남습니다.

빌드가 스키마도 함께 적용합니다. 행이 들어 있는 컬럼이나 테이블을 지우는 업데이트라면
`db push` 가 거부하고 빌드가 멈춥니다 — 버그가 아니라 안전장치가 제 일을 하는 것입니다.
데이터를 손으로 먼저 옮기고 다시 돌리세요.

체크아웃이 `main` 위에 있어야 한다고 우깁니다. detached HEAD 나 다른 브랜치는 의도한
고정이거나 사고인데, 둘은 답이 다릅니다. 그래서 조용히 옮기는 대신 무엇을 발견했는지
말해줍니다.

## 복원

덤프 하나가 백업 전부입니다. 첨부까지 들어 있습니다.

    launchctl bootout gui/$UID/com.atlaspm.server
    dropdb atlaspm && createdb atlaspm
    gunzip -c ~/atlaspm-backups/atlaspm-2026-08-31_0200.sql.gz | psql atlaspm
    launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.atlaspm.server.plist

## 제거

    ~/atlaspm/local/uninstall.sh

중지하고 launch agent 를 제거합니다. **DB 와 백업과 체크아웃은 남깁니다** — 설치를
되돌리는 것이 작업물을 버리는 일이어서는 안 되니까요. 그건 따로, 의도적으로 하세요:

    dropdb atlaspm && rm -rf ~/atlaspm-backups ~/atlaspm

## 의지하기 전에 알아둘 두 가지 한계

**첨부는 DB 에 들어갑니다.** 파일당 5MB, 포스트당 10개. 그래서 덤프 하나가 완전한 백업이
되는 것이고, 동시에 큰 파일을 자주 붙이면 DB 와 그 모든 백업이 커진다는 뜻이기도 합니다.

**로그인이 없습니다.** 루프백 바인딩이 접근 제어의 전부입니다.
