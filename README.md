# inttype.dev — 개인 기술 블로그

Astro + Tailwind CSS로 만든 정적 기술 블로그입니다.

## 기술 스택

- **Framework**: [Astro](https://astro.build) v6
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **Hosting**: GitHub Pages
- **Content**: Markdown / MDX (Astro Content Collections)

## 주요 기능

- 개발/일상 카테고리별 포스팅
- 시리즈 포스팅 지원
- 프로젝트 소개 페이지
- 태그 기반 필터링
- 전체 텍스트 검색
- RSS 피드 (`/rss.xml`)
- 사이트맵 자동 생성
- 한국어/영어 번역 포스트 지원
- 다크/라이트 테마

## 프로젝트 구조

```text
/
├── public/                 # 정적 파일 (이미지, 파비콘 등)
├── src/
│   ├── assets/             # 빌드 타임 에셋
│   ├── components/         # 공통 컴포넌트
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── content/            # 콘텐츠 컬렉션
│   │   ├── posts/          # 블로그 포스트 (Markdown)
│   │   └── projects/       # 프로젝트 소개 (Markdown)
│   ├── layouts/            # 레이아웃
│   │   ├── Layout.astro
│   │   └── PostLayout.astro
│   ├── pages/              # 라우트 페이지
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── search.astro
│   │   ├── tags.astro
│   │   ├── posts/
│   │   └── projects/
│   ├── styles/             # 전역 스타일
│   ├── utils/              # 유틸리티 함수
│   └── content.config.ts   # 콘텐츠 스키마 정의
└── package.json
```

## 로컬 실행

```sh
# 의존성 설치
npm install

# 개발 서버 시작 (localhost:4321)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

## 포스트 작성

`src/content/posts/` 디렉터리에 Markdown 파일을 추가합니다.

```markdown
---
title: '포스트 제목'
pubDate: 2026-01-01
description: '포스트 요약'
category: '개발'        # '개발' | '일상'
tags: ['태그1', '태그2']
draft: false
---

포스트 내용...
```

시리즈 포스트는 `series` 필드를 동일하게 지정하면 자동으로 묶입니다.

## 배포

`main` 브랜치에 push하면 GitHub Actions를 통해 GitHub Pages에 자동 배포됩니다.
