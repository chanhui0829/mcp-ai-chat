# MCP AI Chat

MCP 아키텍처 기반 AI 채팅 애플리케이션입니다.  
LLM이 직접 Tool(Function)을 선택하여 실행하는 구조를 구현했습니다.

---

## 🚀 주요 기능

- 🔧 Function Calling 기반 Tool 실행
- 🧠 LLM 기반 Tool 자동 선택
- 💬 채팅 UI (타이핑 애니메이션 포함)
- 💾 localStorage 기반 채팅 저장
- ⚡ Zustand를 통한 클라이언트 상태 관리
- 🔄 React Query를 통한 서버 상태 관리

---

## 🛠 기술 스택

- React + TypeScript
- Zustand
- React Query (@tanstack/react-query)
- Express (MCP 서버)
- OpenRouter API

---

## 💡 프로젝트 설명

기존의 rule-based 방식이 아닌,  
LLM이 직접 적절한 tool을 선택하는 구조로 설계된 AI 채팅 시스템입니다.

예를 들어:

- "번역해줘" → translate tool 실행
- "요약해줘" → summarize tool 실행
- "계산해줘" → calculate tool 실행

👉 이를 통해 확장성과 유연성을 갖춘 구조를 구현했습니다.

---

## 🧠 핵심 구현 포인트

- MCP(Model Context Protocol) 구조 적용
- Tool Map과 Tool 정의 분리
- Function Calling 기반 동적 실행
- UI / 상태 / API 완전 분리 구조

---

## 📌 느낀 점

단순한 채팅 UI 구현을 넘어,  
LLM과 Tool을 연결하는 구조 설계의 중요성을 이해할 수 있었습니다.

또한 Zustand와 React Query를 함께 사용하며  
클라이언트 상태와 서버 상태를 분리하는 경험을 했습니다.

---


## 🧑‍💻 실행 방법

```bash
npm install
npm run dev
