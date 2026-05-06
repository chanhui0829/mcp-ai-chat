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
        {
          role: 'system',
          content: `너는 사용자의 질문에 명확하고 유용한 답변을 제공하는 전문 AI 어시스턴트이다. 
- 반드시 한국어로만 답변해라.
- 기술적인 질문에는 구체적인 코드 예시와 설명을 포함해라.
- 복잡한 개념은 쉽게 설명해라.
- 답변은 간결하면서도 충분한 정보를 제공해라.
- 확실하지 않은 정보는 추측하지 말고 모른다고 인정해라.`,
        },
        { role: 'user', content: prompt },
      ],
      stream: true,
      temperature: 0.1,
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
        {
          role: 'system',
          content: '너는 대화 내용을 10자 이내의 짧은 한국어 제목으로 요약하는 전문가이다. 제목은 반드시 명사형으로 출력하고, 다른 설명이나 따옴표는 제거하고 괄호 안의 내용은 절대 포함하지 마라.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    });
    const title = response.choices?.[0]?.message?.content?.trim() || '새로운 대화';
    res.json({ title });
  } catch (error: any) {
    res.status(500).json({ error: '요약 실패' });
  }
};
