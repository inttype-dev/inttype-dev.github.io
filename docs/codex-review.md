# inttype.dev 코드 리뷰 안내

이 문서는 Astro 정적 블로그의 변경을 검토할 때 확인할 구조, 동작과 검증 방법을 정리합니다.
Codex가 따를 저장소 규칙은 [AGENTS.md](../AGENTS.md), 보안 지침과 위협 모델은
[SECURITY.md](../SECURITY.md)에 있습니다.

## 변경 유형별 확인 위치

| 변경 유형 | 주요 파일 | 검토할 내용 |
| --- | --- | --- |
| 글·프로젝트 콘텐츠 | `src/content.config.ts`, `src/content/` | 컬렉션 분류, 필수 frontmatter, 초안과 번역, ID 충돌과 기존 URL |
| 글 상세·시리즈·번역 | `src/pages/posts/[...slug].astro`, `src/layouts/PostLayout.astro` | 공개할 글 선택, 번역 연결, 시리즈와 이전·다음 글, 카테고리 복귀 |
| 프로젝트 소개·관련 글 | `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro` | 프로젝트 ID와 공개 slug 구분, 폴더별 글 연결, 번역 소개 표시 |
| 검색·태그·목록 | `src/pages/search.astro`, `src/pages/search-index.json.ts`, `src/pages/posts/index.astro`, `src/pages/tags.astro` | 검색 JSON과 화면 데이터의 일치, URL 인코딩과 필터 복원, 빈 결과·실패 처리 |
| 공통 레이아웃·메타데이터 | `src/layouts/Layout.astro`, `src/components/Header.astro`, `src/components/Footer.astro` | canonical·JSON-LD, 언어·테마 상태, 키보드 탐색, 외부 서비스 |
| RSS·사이트맵 | `src/pages/rss.xml.ts`, `astro.config.mjs` | 공개 글과 생성 경로 일치, 사이트 기준 URL과 절대 링크 |
| 빌드·배포·의존성 | `package.json`, `package-lock.json`, `.github/workflows/deploy.yml` | Node 버전, 재현 가능한 설치·빌드, artifact 출처와 배포 권한 |

## 이 저장소에서 유지할 동작

### 컬렉션 ID와 공개 URL

일반 글과 프로젝트의 번호로 시작하는 글은 모두 `posts` 컬렉션에 들어갑니다.
예를 들어 `src/content/projects/antigravity-quota-simple/001-intro.md`의 글 ID는
`antigravity-quota-simple/intro`, 공개 URL은 `/posts/antigravity-quota-simple/intro`입니다.
프로젝트 소개는 별도 `projects` 컬렉션에 속하며, 폴더명 ID와 선택적인 공개 `slug`를 사용합니다.

콘텐츠 파일을 옮기거나 로더를 바꿀 때는 기존 URL뿐 아니라 프로젝트별 관련 글,
시리즈, RSS, 검색 링크와 번역 참조가 가리키는 ID를 함께 검토합니다.
의도적으로 URL을 바꾸는 PR은 기존 링크를 어떻게 처리할지도 설명합니다.

### 게시 정책과 번역

`draft: true`인 글은 직접 접근 경로와 검색·RSS·사이트맵·관련 글 등 공개 출력에서 제외해야 합니다.
번역 글을 원문에 결합할 때도 번역의 초안 여부를 확인합니다.
공개 저장소의 `draft`는 게시 정책이며 원문에 대한 접근 제어는 아닙니다.

콘텐츠 스키마의 언어 코드는 `kr`·`en`, 화면 언어 상태는 `ko`·`en`입니다.
번역은 `translationOf`로 원문의 컬렉션 ID에 연결합니다.
변경 후 한국어 목록에 영어 번역이 중복되거나 번역 없는 글의 내용이 사라지는지 확인합니다.

### 검색과 탐색

검색 페이지는 `/search-index.json`을 읽어 브라우저에서 필터링합니다.
`q`는 검색어, `mode=tag`는 태그 검색이며 기본 동작은 제목 검색입니다.
글 목록의 카테고리·태그 필터와 상세 페이지의 이전·다음 글도 함께 확인합니다.

한글, 공백, `&`, `+`, `#`를 포함한 검색어·태그가 URL 저장과 복원 뒤에도 같은 의미여야 합니다.
새로고침, 브라우저 뒤로·앞으로 이동, 빈 결과와 인덱스 로딩 실패를 검토합니다.
결과를 동적 HTML로 만들거나 강조 표시를 바꿀 때는 [XSS 검토 기준](../SECURITY.md#xss와-url-처리)도 적용합니다.

## 검증 방법

| 변경 범위 | 확인 방법 |
| --- | --- |
| 문서 | 상대 링크·참조 경로와 설명이 현재 코드와 일치하는지 확인하고 `git diff --check`를 실행합니다. |
| 콘텐츠·Astro·TypeScript·설정 | `package.json`의 Node 조건을 확인하고 `npm ci`, `npm run build`로 설치와 정적 생성을 검증합니다. |
| 브라우저 동작 | `npm run dev` 또는 빌드 후 `npm run preview`로 변경한 화면, 필터, 언어·테마, 키보드 동작을 확인합니다. |
| 배포 workflow·의존성 | 설치·빌드에 더해 이벤트, 권한, 실행할 코드와 artifact의 출처를 검토합니다. |

현재 `package.json`에 별도 test·lint·typecheck 스크립트는 없습니다.
빌드 성공만으로 브라우저 동작이나 보안 검토까지 통과했다고 보고하지 않습니다.
PR에는 실제 실행한 명령과 결과, 남아 있는 확인 항목을 기록합니다.

## 리뷰 의견 작성

리뷰는 한국어로 작성하고, 해당 변경이 발생시키거나 악화시키는 문제에 집중합니다.
각 지적에는 diff의 파일·위치, 발생 조건, 사용자 또는 배포에 미치는 영향과 수정 방향을 담습니다.
보안 문제는 공격자가 통제하는 입력부터 위험한 출력·권한까지의 경로를 근거로 설명합니다.

## Codex에 연결

[Codex 리뷰 설정](https://chatgpt.com/settings/code-review)에서 `inttype-dev/inttype-dev.github.io`를 선택합니다.
코드 리뷰는 모든 PR의 새 push마다, 보안 리뷰는 코드 리뷰가 실행될 때 함께 검토하는 구성입니다.
`SECURITY.md`가 `main`에 병합되면 위협 모델 파일 경로에 `SECURITY.md`를 지정합니다.
자동 보안 리뷰의 최소 심각도는 High, 수동 리뷰는 Medium을 기준으로 사용합니다.

PR 댓글의 `@codex review`는 코드 리뷰, `@codex security review`는 보안 리뷰를 요청합니다.
보안 리뷰 완료 여부와 전체 결과는 연결된 Codex 작업의 **Security Report**에서 확인합니다.

공식 기능과 설정은 [GitHub 코드 리뷰 문서](https://learn.chatgpt.com/docs/third-party/github)와
[Security Review 문서](https://learn.chatgpt.com/docs/security/security-review)를 참고합니다.
