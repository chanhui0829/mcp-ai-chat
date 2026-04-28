import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import mcpRouter from './routes/mcp';

const app = express();
const PORT = 4000;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

/**
 * [Routing] 도메인별 라우터 등록
 */
app.use('/mcp', mcpRouter);

app.listen(PORT, () => {
  console.log(`🚀 MCP Server is running on http://localhost:${PORT}`);
});
