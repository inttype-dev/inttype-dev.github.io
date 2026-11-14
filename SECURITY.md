# 보안 검토 지침과 위협 모델

Codex Security Review의 위협 모델 파일 경로로 `SECURITY.md`를 지정합니다.
이 문서는 리뷰를 위한 보안 가정과 점검 기준이며, 보안 검사를 실행한 결과가 아닙니다.
배포 방식, 데이터 입력 또는 외부 서비스가 바뀌면 함께 갱신합니다.

## 코드에서 확인할 위치

| 검토 대상 | 주요 파일 | 추적할 데이터 흐름 |
| --- | --- | --- |
| 검색 결과 XSS | `src/pages/search.astro`, `src/pages/search-index.json.ts` | URL의 `q`·`mode`와 검색 JSON → 강조 표시·정규식 → 결과 HTML |
| 글 메타데이터와 탐색 | `src/pages/posts/[...slug].astro`, `src/layouts/PostLayout.astro`, `src/layouts/Layout.astro` | frontmatter·컬렉션 ID → JSON-LD·탐색 JSON → 인라인 script·동적 HTML |
| 댓글과 외부 코드 | `src/layouts/PostLayout.astro`, `src/layouts/Layout.astro` | Giscus 메시지·iframe, Analytics 스크립트 → 페이지 동작·외부 전송 |
| 공개 산출물과 초안 | `src/content.config.ts`, `src/pages/rss.xml.ts`, `src/pages/search-index.json.ts`, `astro.config.mjs` | 콘텐츠 선택·경로 생성 → HTML·검색 JSON·RSS·사이트맵 |
| 공급망과 배포 | `package.json`, `package-lock.json`, `.github/workflows/deploy.yml` | 의존성 설치·빌드 → Pages artifact → 배포 권한 |

## 시스템과 보호 대상

- Astro가 `src/content/`의 Markdown과 frontmatter를 읽어 정적 HTML·JSON을 생성합니다.
  `public/` 파일과 `dist/` 빌드 결과는 GitHub Pages를 통해 누구나 접근할 수 있습니다.
- 브라우저는 검색 인덱스를 가져오고 URL 매개변수, localStorage, sessionStorage를 사용합니다.
- Google Analytics 스크립트와 Giscus 댓글이 연결되어 있습니다.
  Giscus는 외부 iframe과 `postMessage`로 통신합니다.
- `.github/workflows/deploy.yml`은 `main` push와 수동 실행으로 빌드·배포합니다.
  npm 의존성 설치와 빌드 과정도 코드를 실행하는 신뢰 경계입니다.
- 보호 대상은 방문자 브라우저의 무결성, 게시 내용과 URL의 정확성,
  빌드·배포 권한 및 자격 증명입니다. 자체 로그인, 결제, 서버 API, 데이터베이스는 없습니다.

## 입력과 신뢰 경계

| 경계 | 신뢰 가정과 검토 기준 |
| --- | --- |
| 외부 PR → 저장소·CI | PR diff, 제목·본문, 브랜치명과 artifact는 비신뢰 입력입니다. 검토 전에는 배포 권한이나 secret을 사용할 수 없어야 합니다. |
| 저장소 콘텐츠 → 빌드 | 병합된 Markdown·HTML·설정은 유지 관리자가 승인한 소스입니다. 콘텐츠 작성 권한 자체로 임의 HTML을 넣을 수 있다는 사실만으로 방문자 입력 XSS로 판단하지 않습니다. 외부 콘텐츠 자동 수집이 추가되면 이 가정을 재검토합니다. |
| URL·저장소·외부 응답 → DOM | 쿼리·해시, 브라우저 저장소, 외부 메시지와 응답은 신뢰하지 않습니다. 검색 JSON이 자체 빌드 산출물이어도 동적 HTML·URL·스크립트에 넣는 문맥을 확인합니다. |
| 외부 서비스 → 방문자 | 외부 스크립트는 페이지 권한으로 실행됩니다. 출처 변경, 새 데이터 전송, iframe과 메시지 검증 변경을 확인합니다. |
| npm·Actions → 빌드·배포 | 의존성과 Actions는 실행 코드입니다. 설치 스크립트, 다운로드한 실행 파일, workflow 권한과 배포 입력의 출처를 확인합니다. |

## 우선 검토할 공격 경로

### XSS와 URL 처리

- `src/pages/search.astro`의 검색어·강조 표시·결과 HTML을 따라가며 입력이 이스케이프를 우회하는지 확인합니다.
- `src/layouts/PostLayout.astro`의 동적 탐색 HTML과 JSON 삽입,
  `src/layouts/Layout.astro`의 JSON-LD처럼 `set:html`을 쓰는 지점은 출력 문맥을 확인합니다.
  JSON 직렬화만으로 HTML 파서의 `</script>` 처리를 막았다고 가정하지 않습니다.
- 비신뢰 값이 링크나 리소스 URL이 되면 허용 프로토콜과 목적지를 검증합니다.
  고정된 유지 관리자 소유 URL과 공격자가 바꿀 수 있는 URL을 구분합니다.

### 외부 서비스와 공개 데이터

- Giscus 메시지는 허용된 origin, 필요한 경우 iframe의 source, 예상 메시지 구조를 확인합니다.
  origin 검사를 제거하거나 전송 대상을 불필요하게 넓히는 변경을 검토합니다.
- 새 분석·댓글·외부 스크립트가 방문자 입력이나 비공개 데이터를 전송하는지 확인합니다.
- 브라우저로 전달되는 환경 변수, 정적 파일, 생성 페이지와 CI 로그에 실제 비밀이 없어야 합니다.
  Analytics 측정 ID, 사이트 소유권 확인 값, Giscus 저장소·카테고리 ID는 공개 식별자입니다.

### 공급망과 배포 권한

- 패키지·lockfile의 새 의존성, 설치 스크립트와 외부 다운로드를 통한 실행 경로를 확인합니다.
  알려진 취약점은 확인 가능한 권고문과 이 프로젝트에서의 도달 가능성을 함께 근거로 듭니다.
- PR 코드를 secret·쓰기 권한이 있는 job에서 실행하거나, 비신뢰 artifact를 그대로 배포하는 변경을 검토합니다.
- PR 제목·본문·브랜치명 등을 shell에 직접 보간하지 않아야 합니다.
- Pages 배포는 신뢰할 수 있는 `main`을 대상으로 하고, token과 OIDC 권한은 필요한 범위로 제한합니다.

### 게시 정책

- 초안과 초안 번역이 페이지·검색·RSS·사이트맵·관련 글 등에 추가되는지 확인합니다.
  `draft`는 배포 정책입니다. 공개 저장소에 있는 원문을 비밀로 만드는 접근 제어 수단은 아닙니다.

## 판단 범위

실제 입력 출처, 공격자가 통제할 수 있는 범위, 영향을 받는 출력·권한을 연결해 보고합니다.
SQL injection, 서버 세션 탈취처럼 현재 존재하지 않는 기능의 위험은 그 기능이 추가될 때 검토합니다.
일반적인 보안 강화 제안과 현재 diff가 만드는 구체적인 취약점을 구분합니다.
