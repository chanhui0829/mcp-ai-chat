import axios from 'axios';

const MCP_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:4000/mcp'
    : `${import.meta.env.VITE_API_URL}/mcp`;

export const sendMessage = async (prompt: string) => {
  const { data } = await axios.post(MCP_URL, { prompt });
  return data.result;
};

export const sendMessageStream = async (prompt: string, onChunk: (text: string) => void) => {
  try {
    const res = await fetch(MCP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) throw new Error('서버 응답 오류');

    const reader = res.body?.getReader();
    if (!reader) throw new Error('스트림 없음');

    const decoder = new TextDecoder();

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 🔥 SSE 파싱
      const lines = buffer.split('\n');

      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const text = line.replace('data: ', '');

          if (text === '[DONE]') return;

          onChunk(text);
        }
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};
