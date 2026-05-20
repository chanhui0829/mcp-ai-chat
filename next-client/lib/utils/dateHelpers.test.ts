

import { describe, it, expect } from 'vitest';

import { formatTime, formatDate, isSameDay } from '@/lib/utils/dateHelpers';

describe('isSameDay', () => {
  it('같은 날 다른 시간이면 true를 반환한다', () => {

    expect(isSameDay('2024-05-01T00:00:00', '2024-05-01T23:59:59')).toBe(true);
  });

  it('날짜가 다르면 false를 반환한다', () => {
    expect(isSameDay('2024-05-01T23:59:59', '2024-05-02T00:00:00')).toBe(false);
  });
});


describe('formatDate', () => {

  it('오늘 날짜면 "오늘"을 반환한다', () => {
    const today = new Date().toISOString();
    expect(formatDate(today)).toBe('오늘');
  });

  it('어제 날짜면 "어제"를 반환한다', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDate(yesterday.toISOString())).toBe('어제');
  });

  it('이상한 값이 들어오면 빈 문자열을 반환한다', () => {

    expect(formatDate('이상한값')).toBe('');
  });
});


describe('formatTime', () => {

  it('빈 문자열이 들어오면 빈 문자열을 반환한다', () => {
    expect(formatTime('')).toBe('');
  });

  it('유효한 ISO 날짜 문자열이 들어오면 시간 형식으로 반환한다', () => {
    const result = formatTime('2024-05-01T14:30:00');
    // PM/AM이 포함된 형식을 허용하도록 정규식 변경
    expect(result).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
  });
});