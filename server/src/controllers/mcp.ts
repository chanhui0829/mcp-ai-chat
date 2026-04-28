import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * [Controller] 실시간 채팅 스트리밍 로직
 */
export const streamChat = async (req: Request, res: Response) => {
  const prompt = req.query.prompt as string;

  try {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.chat.completions.create({
      model: 'openrouter/free',
      messages: [
        { role: 'system', content: `너는 개발자를 돕는 전문 어시스턴트이다... (생략)` },
        { role: 'user', content: `${prompt}(반드시 한국어로만 답변해.)` },
      ],
      stream: true,
      temperature: 0.3,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).end();
  }
};

/**
 * [Controller] 채팅 제목 요약 로직
 */
export const summarizeTitle = async (req: Request, res: Response) => {
  const { prompt } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: 'openrouter/free',
      messages: [
        { role: 'system', content: '10자 이내의 짧은 한국어 제목을 생성하라...' },
        { role: 'user', content: `다음 내용을 요약해줘: ${prompt}` },
      ],
      temperature: 0.3,
    });
    const title = response.choices?.[0]?.message?.content?.trim() || '새로운 대화';
    res.json({ title });
  } catch (error: any) {
    res.status(500).json({ error: '요약 실패' });
  }
};
