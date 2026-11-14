# Repository guidance

이 저장소는 Astro 6, TypeScript, Tailwind CSS 4로 만든 정적 블로그입니다.
Markdown 콘텐츠를 빌드하고 GitHub Pages에 배포하며, 자체 인증 서버나 데이터베이스는 없습니다.

## 저장소 구조와 콘텐츠 규약

- `src/content.config.ts`에서 `posts`와 `projects` 컬렉션을 정의합니다.
  `src/content/posts/`의 글과 프로젝트 폴더의 숫자로 시작하는 Markdown은 `posts`,
  프로젝트 폴더의 숫자로 시작하지 않는 소개 Markdown은 `projects`에 속합니다.
- 글 ID는 컬렉션 디렉터리와 파일명의 숫자 접두사를 제거해 만듭니다.
  예를 들어 `src/content/posts/dev/001-mysql-modeling-enum-varchar-int.md`의 ID는
  `dev/mysql-modeling-enum-varchar-int`이며 경로는 `/posts/dev/mysql-modeling-enum-varchar-int`입니다.
- 프로젝트 ID는 폴더명입니다. 소개 페이지 URL은 `slug`가 있으면 그 값을 사용하고,
  관련 글 연결에는 프로젝트 ID와 글 ID의 첫 경로 세그먼트를 사용합니다.
- 콘텐츠의 `lang` 값은 `kr`·`en`, 브라우저의 `data-lang` 상태는 `ko`·`en`입니다.
  `translationOf`는 번역 대상의 컬렉션 ID를 가리킵니다.
- 글의 `category` 값은 `개발`·`일상`입니다. 목록의 `프로젝트` 분류는 프로젝트 ID로 판별합니다.

## 작업 및 검증

- Node.js 버전은 `package.json`의 `engines`와 배포 workflow를 확인합니다.
- 의존성 설치는 `npm ci`, 프로덕션 빌드 검증은 `npm run build`를 사용합니다.
- 콘텐츠 컬렉션과 URL 생성 규칙은 `src/content.config.ts`에서 확인합니다.
- 변경 유형별 확인 파일과 검증 방법은 [리뷰 안내](docs/codex-review.md)를 참고합니다.
- 문서만 변경했다면 링크와 diff를 검증합니다. 실행하지 않은 검사나 리뷰를 통과했다고 보고하지 않습니다.

## Code Review Rules

- 리뷰 의견은 한국어로 작성합니다. 변경으로 발생하거나 악화되는 버그와 회귀를 우선합니다.
- 각 지적에는 해당 diff의 위치, 발생 조건, 사용자 영향과 수정 방향을 포함합니다.
  실제 코드 흐름으로 뒷받침할 수 없는 추측이나 스타일 취향은 지적하지 않습니다.
- 기존 문제는 변경이 영향을 주는 경우에만 연결해서 설명합니다.
  검증하지 않은 취약점이나 CVE를 확정적으로 보고하지 않습니다.

### 게시 및 탐색 동작

- `draft: true`인 글과 번역본이 의도치 않게 게시되는지 확인합니다.
  페이지 경로뿐 아니라 검색 인덱스, RSS, 사이트맵, 시리즈 및 이전·다음 글,
  번역 연결, 새로 추가되는 공개 출력도 확인합니다.
- 글·프로젝트의 slug, 태그와 검색 매개변수 변경 시 기존 링크와 한국어·영어 전환이
  유지되는지 확인합니다. URL 구성에는 경로·쿼리 문맥에 맞는 인코딩을 사용합니다.
- 컬렉션 로더와 ID 생성 변경은 기존 게시 URL, 프로젝트 관련 글, `translationOf` 참조에
  미치는 영향을 함께 확인합니다. 프로젝트의 공개 slug와 내부 컬렉션 ID를 혼용하지 않습니다.
- 검색어·태그에 한글, 공백, `&`, `+`, `#`가 포함돼도 필터와 URL 복원이 같은 값을 사용해야 합니다.
  글 목록에서 상세 페이지로 이동한 뒤 이전·다음 글과 목록 복귀의 카테고리도 확인합니다.

### 보안 취약점 검토

- [보안 지침과 위협 모델](SECURITY.md)을 읽고, 입력의 신뢰 경계와 실제 공격 경로를 기준으로 검토합니다.
- URL 매개변수, 브라우저 저장소, 외부 데이터가 `innerHTML`, `set:html`, URL 속성 또는
  인라인 스크립트로 들어갈 때 XSS 경로를 추적합니다. 텍스트는 `textContent`나 기본 이스케이프를
  사용하고, HTML·URL·스크립트 문맥은 각각에 맞게 처리해야 합니다.
  `<script>` 안의 JSON은 `JSON.stringify`만으로 종료 태그가 안전해지는지 가정하지 않습니다.
- 외부 스크립트와 iframe 변경은 출처와 전송 데이터를 확인합니다.
  `postMessage` 수신은 허용 origin, 필요한 경우 source, 메시지 구조를 검증해야 합니다.
  저장소 소유자가 검토해 넣은 고정 HTML이나 공개 서비스 식별자만으로 취약점으로 판단하지 않습니다.
- 브라우저 번들, `public/`, 생성 HTML·JSON, 로그와 배포 artifact에 자격 증명이 포함되는지 확인합니다.
  의존성·lockfile·Actions 변경은 악성 코드 실행과 배포 권한 탈취 경로도 함께 검토합니다.
- PR의 코드·메타데이터·artifact는 신뢰하지 않습니다. PR 변경이 secret, 쓰기 권한 또는
  배포용 OIDC 토큰을 가진 실행 경로로 들어가는지 확인합니다. `pull_request_target`에서
  PR 코드를 실행하거나 PR 제목·본문을 shell 코드에 직접 삽입하는 변경을 지적합니다.
  GitHub Pages 배포는 신뢰할 수 있는 `main`을 기준으로 유지합니다.
