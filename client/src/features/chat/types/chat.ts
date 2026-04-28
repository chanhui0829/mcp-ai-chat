/**
 * [DB Schema Type]
 * Supabase DB의 chat_messages 테이블 구조와 1:1로 매칭되는 타입입니다.
 * DB 데이터는 관례상 snake_case를 사용하므로, 이를 명시하여 혼선을 방지합니다.
 */
export interface DBChatMessage {
  id: string;
  role: 'user' | 'assistant'; // 또는 'ai' (DB 설정에 맞춤)
  content: string;
  created_at: string;
  session_id: string;
}

/**
 * [Domain Type]
 * 프론트엔드 어플리케이션 전반에서 사용하는 클린한 데이터 타입입니다.
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string; // created_at을 UI용으로 변환
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}
