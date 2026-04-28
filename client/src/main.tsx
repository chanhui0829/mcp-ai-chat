import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

/**
 * [Application Entry Point]
 * React Query와 React Router를 프로젝트 전역에 공급합니다.
 */

// TanStack Query 설정: 전역적인 비동기 상태 관리 및 캐싱 전략 수립
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 사용자 포커스 이동 시 자동 리페치 방지 (UX 선택)
      retry: 1, // 실패 시 재시도 횟수 제한
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
