# 💬 MCP Chat

실시간 스트리밍 기반 AI 채팅 웹 애플리케이션입니다.
단순한 응답을 넘어 **SSE(Server-Sent Events)** 기술과 **Streamdown**을 활용하여 사용자에게 끊김 없는 대화 경험을 제공하는 데 집중했습니다.

---

## 🚀 주요 기능

### 💬 실시간 스트리밍 채팅

- **SSE(Server-Sent Events):** 서버에서 전달되는 데이터를 Chunk 단위로 즉시 수신하여 응답 속도 체감 지수 향상
- **Streamdown 인터랙션:** 실시간으로 수신되는 마크다운 데이터를 끊김 없이 렌더링
- **사용자 경험 최적화:** AI의 답변 중 다른 방으로 이동하거나 새로운 질문을 할 때의 예외 상황 처리

### ⚡ 성능 및 안정성 제어

- **Request Control:** `AbortController`를 활용하여 진행 중인 스트리밍 요청 취소 기능 지원
- **UI Sync:** `requestId`를 통한 비동기 응답 순서 보장 및 데이터 정합성 유지

### 📚 채팅 및 데이터 관리

- **채팅 관리:** 채팅 생성/삭제 및 `localStorage` 기반 대화 내역 유지
- **스마트 검색:** 사이드바 내 실시간 채팅 리스트 필터링
- **편의 기능:** AI 응답 결과 즉시 복사 버튼 지원

---

## 🧠 기술 스택

### Frontend

- **Core:** React, TypeScript, Vite
- **Streaming:** Streamdown (Markdown Rendering)
- **State:** Zustand (Global State), React Query (Server State)
- **UI:** Tailwind CSS

### Backend

- **Environment:** Node.js (Express)
- **API:** OpenRouter (Gemini, Llama)

---

## ✨ 구현 포인트 (Technical Highlights)

- **비완성형 JSON 파싱:** 스트리밍 중 데이터가 잘려 들어오는 경우(Chunk)를 대비한 버퍼링 파싱 로직 구현
- **상태 독립화:** `activeChatId`를 도입하여 여러 채팅방이 존재할 때 로딩 및 타이핑 상태가 서로 간섭하지 않도록 설계
- **비동기 흐름 제어:** 최신 요청과 이전 요청이 뒤섞이는 Race Condition 문제를 코드 레벨에서 해결
- **반응형 UI:** 모바일 환경에서도 쾌적한 사용이 가능하도록 사이드바 및 레이아웃 최적화

---

## 🏗️ 프로젝트 구조

```bash
src/
 ├── api/           # SSE 통신 및 AbortController 제어 로직
 ├── components/    # 기능별 UI 컴포넌트 (ChatInput, ChatWindow 등)
 ├── store/         # Zustand를 통한 전역 상태 관리 (chat.store)
 ├── App.tsx
 └── main.tsx
```
