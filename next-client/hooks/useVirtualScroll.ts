'use client';

import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  isStreaming?: boolean;
}

interface UseVirtualScrollOptions {
  items: VirtualItem[];
  estimateSize?: number;
  overscan?: number;
}

interface UseVirtualScrollReturn {
  parentRef: React.RefObject<HTMLDivElement | null>;
  getVirtualItems: () => ReturnType<ReturnType<typeof useVirtualizer>['getVirtualItems']>;
  getTotalSize: () => number;
  measureElement: (element: Element | null) => void;
}

/**
 * @description 가상 스크롤 로직을 캡슐화한 커스텀 훅
 * [Technical Point]
 * 1. Logic Separation: ChatWindow 컴포넌트에서 가상 스크롤 로직 분리
 * 2. Reusability: 다른 컴포넌트에서도 가상 스크롤 재사용 가능
 * 3. Consistency: useChatScroll과 동일한 패턴으로 로직 분리
 */
export const useVirtualScroll = ({
  items,
  estimateSize = 150,
  overscan = 5,
}: UseVirtualScrollOptions): UseVirtualScrollReturn => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const measureElement = useCallback(
    (element: Element | null) => {
      if (element) virtualizer.measureElement(element);
    },
    [virtualizer]
  );

  return {
    parentRef,
    getVirtualItems: () => virtualizer.getVirtualItems(),
    getTotalSize: () => virtualizer.getTotalSize(),
    measureElement,
  };
};
