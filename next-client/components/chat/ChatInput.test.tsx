import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from '@/components/chat/ChatInput';

/**
 * ChatInput 컴포넌트 단위 테스트
 * - 전송 버튼이 제대로 동작하는지
 * - 스트리밍 중에 중지 버튼으로 바뀌는지
 * - 빈 입력값으로 전송하면 onSend 안 불리는지
 */

describe('ChatInput', () => {
  it('입력값이 있을 때 전송 버튼 클릭하면 onSend가 호출된다', async () => {
    const onSend = vi.fn();
    render(
      <ChatInput
        input="안녕하세요"
        setInput={vi.fn()}
        onSend={onSend}
        loading={false}
        typing=""
      />
    );

    await userEvent.click(screen.getByRole('button', { name: '메시지 전송' }));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('입력값이 비어있으면 전송 버튼이 비활성화된다', () => {
    render(
      <ChatInput
        input=""
        setInput={vi.fn()}
        onSend={vi.fn()}
        loading={false}
        typing=""
      />
    );

    const button = screen.getByRole('button', { name: '메시지 전송' });
    expect(button).toBeDisabled();
  });

  it('스트리밍 중(loading=true)이면 버튼이 응답 중지로 바뀐다', () => {
    render(
      <ChatInput
        input=""
        setInput={vi.fn()}
        onSend={vi.fn()}
        onStop={vi.fn()}
        loading={true}
        typing=""
      />
    );

    expect(screen.getByRole('button', { name: '응답 중지' })).toBeInTheDocument();
  });

  it('스트리밍 중 중지 버튼 클릭하면 onStop이 호출된다', async () => {
    const onStop = vi.fn();
    render(
      <ChatInput
        input=""
        setInput={vi.fn()}
        onSend={vi.fn()}
        onStop={onStop}
        loading={true}
        typing="응답 생성 중..."
      />
    );

    await userEvent.click(screen.getByRole('button', { name: '응답 중지' }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});