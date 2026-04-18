import express from 'express';
import cors from 'cors';
import axios from 'axios';
import OpenAI from 'openai';
import 'dotenv/config';

const app = express();
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://mcp-flowchat.vercel.app'],
    methods: ['GET'],
    credentials: true,
  })
);
app.use(express.json());

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * 🔥 MCP endpoint (SSE)
 */
app.get('/mcp', async (req, res) => {
  console.log('🔥 MCP HIT', req.query.prompt);
  const prompt = req.query.prompt as string;

  try {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (res.flushHeaders) res.flushHeaders();

    const stream = await openai.chat.completions.create({
      model: 'openrouter/free',
      messages: [
        {
          role: 'system',
          content: `
너는 개발자를 돕는 AI다.

1. 반드시 한국어로만 답변한다.
2. 코드 제외 설명은 한국어만 사용한다.
3. 코드에는 줄바꿈을 포함한다.
`,
        },
        { role: 'user', content: prompt },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';

      if (content) {
        res.write(`data: ${Buffer.from(content, 'utf-8').toString()}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err) {
    console.error(err);
    res.write(`data: ❌ 오류 발생\n\n`);
    res.end();
  }
});

app.listen(4000, () => {
  console.log('🔥 SSE VERSION ACTIVE');
  console.log('🚀 MCP Server (SSE) running');
});
