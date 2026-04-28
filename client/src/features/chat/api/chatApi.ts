import axios from 'axios';

/**
 * @description MCP(Model Context Protocol) 서버 엔드포인트 설정
 * 환경 변수를 통해 개발(Local)과 운영(Vercel/Production) 환경의 API 주소를 동적으로 관리합니다.
 */
const MCP_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:4000/mcp'
    : `${import.meta.env.VITE_API_URL}/mcp`;

/**
 * [API Interface 정의]
 * API 응답 구조를 인터페이스로 명문화하여 타입 안정성을 확보하고,
 * 협업 시 데이터 구조에 대한 커뮤니케이션 비용을 줄입니다.
 */
interface ChatResponse {
  result: string;
}

interface StreamChunk {
  content: string;
}

interface SummaryResponse {
  title: string;
}

/**
 * 단발성 메시지 전송 함수
 * @param prompt 사용자 입력 메시지
 */
export const sendMessage = async (prompt: string): Promise<string> => {
  const { data } = await axios.post<ChatResponse>(MCP_URL, { prompt });
  return data.result;
};

/**
 * [핵심 로직] AI 응답 스트리밍(SSE) 처리 함수
 * * @description Server-Sent Events(SSE)를 활용한 실시간 데이터 수신 로직입니다.
 * 1. 스트리밍 종료 시 [DONE] 메시지를 수신하여 연결을 명확히 종료(Resource Leak 방지).
 * 2. 네트워크 패킷 분절 현상으로 인한 JSON 파싱 에러를 방지하기 위해 예외 처리를 강화함.
 * 3. 클로저를 활용하여 외부에서 스트림 연결을 강제로 해제할 수 있는 cleanup 함수를 반환함.
 */
export const sendMessageStream = (
  prompt: string,
  onChunk: (data: { chunk: string; full: string }) => void,
  onDone: (full: string) => void
) => {
  const url = `${MCP_URL}?prompt=${encodeURIComponent(prompt)}`;
  const eventSource = new EventSource(url);
  let fullText = '';

  eventSource.onmessage = (event) => {
    // 스트리밍 정상 종료 판단
    if (event.data === '[DONE]') {
      onDone(fullText);
      eventSource.close();
      return;
    }

    try {
      /**
       * [Technical Decision] 비정형 Chunk 데이터 유실 방지
       * 실시간 응답의 무결성을 보장하기 위해 각 chunk를 개별적으로 파싱하여 누적합니다.
       * 파싱 실패 시 전체 스트림이 깨지지 않도록 catch 블록에서 로깅 후 흐름을 유지합니다.
       */
      const parsed: StreamChunk = JSON.parse(event.data);
      const content = parsed.content || '';
      fullText += content;

      onChunk({
        chunk: content,
        full: fullText,
      });
    } catch (err) {
      console.error('[SSE Parsing Error]:', err);
    }
  };

  /**
   * [Cleanup Mechanism]
   * 컴포넌트 언마운트나 요청 취소 시 메모리 누수를 방지하기 위해
   * EventSource 인스턴스를 확실히 닫는 클로저 함수를 반환합니다.
   */
  return () => {
    eventSource.close();
  };
};

/**
 * 대화 타이틀 자동 요약 API
 * @param prompt 대화 내용 요약용 텍스트
 * @description 백엔드 엔드포인트 `/Tsummarize`와 매칭되어 실시간 대화 주제를 추출합니다.
 */
export const getChatSummary = async (prompt: string): Promise<string> => {
  try {
    const targetUrl = `${MCP_URL}/Tsummarize`;
    const { data } = await axios.post<SummaryResponse>(targetUrl, { prompt });
    return data.title;
  } catch (error) {
    console.error('[Summary API Error]:', error);
    return '새로운 대화'; // 실패 시 기본 타이틀 반환 (Fallback 처리)
  }
};
