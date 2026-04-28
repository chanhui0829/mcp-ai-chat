import { useEffect, useRef, useState } from 'react';

/**
 * @description 스마트 스크롤 제어를 위한 커스텀 훅
 * [Optimization]: 사용자의 스크롤 의도를 감지하여 하단 고정 여부를 결정합니다.
 */
export const useChatScroll = (dependencies: unknown[]) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollActive, setIsAutoScrollActive] = useState(true);

  // 스크롤 이벤트 핸들러: 임계값(150px)을 기준으로 자동 스크롤 모드 제어
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
    setIsAutoScrollActive(isAtBottom);
  };

  useEffect(() => {
    if (isAutoScrollActive && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'auto',
      });
    }
    // 의존성 배열을 안전하게 전개하여 변화 감지
  }, [...dependencies]);

  return { scrollRef, handleScroll };
};
