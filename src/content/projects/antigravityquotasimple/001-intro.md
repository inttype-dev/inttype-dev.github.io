---
title: "Antigravity Quota Simple 프로젝트 소개"
description: "VS Code 상태 표시줄에서 Antigravity AI Quota 사용량을 바로 확인하는 확장 프로그램"
pubDate: 2026-03-07T01:00:00
tags: ["TypeScript", "VS Code Extension API"]
draft: false
---

## 한 줄 소개

Antigravity AI의 Quota 사용량을 VS Code 상태 표시줄에서 바로 확인할 수 있는 확장 프로그램입니다.

- [Open VSX Registry](https://open-vsx.org/extension/inttype-dev/antigravity-quota-simple)
- [GitHub](https://github.com/inttype-dev/AntigravityQuotaSimple)

---

## 왜 만들었나

Antigravity IDE를 쓰다 보면 현재 모델의 Quota가 얼마나 남았는지 확인할 때마다 Settings → Models 화면을 직접 열어야 했습니다. 매번 이동하는 것이 불편해서, 상태 표시줄에서 바로 볼 수 있으면 좋겠다고 생각해 만들게 됐습니다.

기존에 비슷한 Extension들이 있었지만, 내부 API를 호출하는 방식이 정책과 보안 측면에서 걱정이 됐습니다. 그래서 로컬에 저장된 데이터를 직접 읽는 다른 접근 방식으로 구현했습니다. 자세한 내용은 [직접 만든 이유](/posts/antigravityquotasimple/try) 글에 정리해뒀습니다.

---

## 주요 기능

### 상태 표시줄 인디케이터

현재 모델의 Quota 사용률에 따라 아이콘과 색상이 변합니다.

| 사용률 | 색상 |
|--------|------|
| 0 ~ 24% | 파란색 |
| 25 ~ 49% | 초록색 |
| 50 ~ 74% | 노란색 |
| 75 ~ 99% | 주황색 |
| 100% (소진) | 빨간색 |

할당량이 소진된 경우 다음 리셋까지 남은 시간도 함께 표시됩니다.

### Webview 패널

모든 모델의 Quota 현황을 한 화면에서 볼 수 있는 패널입니다. 모델별로 원형 progress ring 카드를 그리드 레이아웃으로 배치했습니다.

### 자동 갱신

- 30초 간격으로 백그라운드에서 자동 갱신
- Antigravity 창이 포커스를 되찾을 때 즉시 갱신

---

## 기술 스택

| 기술 | 역할 |
|------|------|
| TypeScript | 확장 전체 구현 |
| VS Code Extension API | 상태 표시줄, Webview 패널 등 UI 제어 |
| SQLite (`state.vscdb`) | Quota 데이터 로컬 저장소 |
| Protobuf (직접 파싱) | DB에 저장된 바이너리 데이터 디코딩 |

---

## 버전

| 버전 | 내용 |
|------|------|
| v0.0.1 | 상태 표시줄 기본 기능 (MVP) |
| v0.1.0 | Webview 패널 추가 |
| v0.2.0 (예정) | 언어 설정, 표시 모델 수, 갱신 주기 설정 |
