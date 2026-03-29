---
title: "GitLab MR Auto Code Review 프로젝트 소개 및 개발 배경"
description: "GitLab Merge Request에 AI 자동 코드 리뷰를 붙이는 서비스 소개 및 개발 배경"
pubDate: 2026-03-23T00:40:00
tags: ["Java", "Spring Boot", "GitLab API", "AWS", "Docker"]
draft: false
---

## 프로젝트 개요

**GitLab MR Auto Code Review**는 GitLab Merge Request가 생성되거나 수정될 때 Webhook을 통해 자동으로 AI 코드 리뷰를 작성해주는 서비스입니다.

OpenAI ChatGPT, Anthropic Claude, Google Gemini 등 다양한 LLM을 지원하며, 변경된 코드의 성격에 따라 적절한 전문가 페르소나를 자동으로 선택해 리뷰를 생성합니다.

개인 사이드 프로젝트로 약 3일간(2025.09.03 ~ 2025.09.05) 개발했습니다.

## 개발 배경

공통 프로젝트(MalMoon) 당시 컨설턴트님이 GitLab MR에 AI 코드 리뷰를 붙여주셨고, 실제로 코드 품질을 높이는 데 많은 도움이 됐습니다. 특화 프로젝트(Speakle)를 시작하면서도 같은 환경을 만들고 싶어 직접 구현하게 됐습니다.

MR이 올라오는 순간 자동으로 1차 리뷰가 달리면, 팀원이 코드를 보기 전에 놓치기 쉬운 부분을 미리 짚어줄 수 있습니다. 짧은 개발 기간에도 리뷰 품질을 유지하고 싶어서 직접 만들게 됐습니다.

## 핵심 기능

### GitLab Webhook 연동

MR 생성/수정 이벤트가 발생하면 GitLab이 Webhook으로 서버를 호출합니다. 서버는 `X-Gitlab-Token` 헤더로 요청의 유효성을 검증한 뒤 MR 변경사항(diff)을 조회합니다.

### 다중 LLM 지원

OpenAI, Anthropic, Google 세 가지 LLM을 지원합니다. 단, 런타임에 자동으로 전환되는 구조는 아니고, **서버 배포 시 어떤 모델을 사용할지 설정으로 고정**합니다. 운영 중 모델을 바꾸려면 재배포가 필요하다는 한계가 있습니다.

- OpenAI: gpt-4o-mini, gpt-4o, gpt-4-turbo
- Anthropic Claude: claude-sonnet-4, claude-opus-4, claude-haiku-4
- Google Gemini: gemini-2.5, gemini-1.5-pro, gemini-1.5-flash

### AI 페르소나 시스템

단순히 LLM에 diff를 던지는 것이 아니라, 변경사항을 분석해 가장 적합한 전문가 페르소나를 선택하고 전문화된 프롬프트로 리뷰를 생성합니다.

파일 경로, 확장자, 코드 키워드, 복잡도 패턴 등을 종합해 점수를 계산하고, 40점 이상이면 전문 페르소나를 활성화합니다.

| 페르소나 | 전문 영역 |
|----------|-----------|
| Security Auditor | 보안 취약점, 인증/인가, 입력 검증 |
| Performance Tuner | 성능 최적화, 쿼리 튜닝, 메모리 |
| Data Guardian | 데이터베이스, 트랜잭션, 데이터 정합성 |
| Backend Specialist | Spring Boot, FastAPI, 서버 아키텍처 |
| Frontend Specialist | React, TypeScript, UI/UX |
| DevOps Engineer | Docker, Kubernetes, CI/CD |
| Architect | 설계 패턴, 의존성 관리 |
| Quality Coach | 코드 품질, 테스트 전략, 컨벤션 |

### 안정성 처리

LLM API 호출 실패에 대비해 Retry와 CircuitBreaker 전략을 적용했습니다. API 일시 장애 시 자동 재시도하고, 연속 실패 시 회로를 열어 서버 전체에 영향이 퍼지지 않도록 합니다.

## 기술 스택 및 선택 이유

| 기술 | 선택 이유 |
|------|-----------|
| Java + Spring Boot | 익숙한 백엔드 스택, Webhook 서버와 외부 API 연동에 적합 |
| GitLab API | MR diff 조회 및 댓글 등록을 위한 GitLab REST API 활용 |
| Resilience4j | CircuitBreaker / Retry 패턴으로 LLM API 호출 안정성 확보 |

## 동작 흐름

```
1. MR 생성/수정 → GitLab이 Webhook 호출
2. 서버가 Secret Token 검증 후 MR diff 조회
3. diff 분석 → 페르소나 점수 계산 → 최적 페르소나 선택
4. 전문화된 프롬프트 생성 → LLM API 호출
5. GitLab MR에 코드 리뷰 댓글 등록
```
