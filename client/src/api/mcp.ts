import axios from 'axios';

const MCP_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:4000/mcp'
    : `${import.meta.env.VITE_API_URL}/mcp`;

export const sendMessage = async (prompt: string) => {
  const { data } = await axios.post(MCP_URL, { prompt });
  return data.result;
};

export const sendMessageStream = (
  prompt: string,
  onChunk: (data: { chunk: string; full: string }) => void,
  onDone: (full: string) => void
) => {
  const url = `${MCP_URL}?prompt=${encodeURIComponent(prompt)}`;
  const eventSource = new EventSource(url);

  let fullText = '';

  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      onDone(fullText);
      eventSource.close();
      return;
    }

    try {
      const parsed = JSON.parse(event.data);
      const content = parsed.content || '';

      fullText += content;

      onChunk({
        chunk: content,
        full: fullText,
      });
    } catch (err) {
      console.error('Parsing error', err);
    }
  };

  eventSource.onerror = (err) => {
    console.error('SSE error', err);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
};
