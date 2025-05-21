import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
// 我们不再直接依赖 ApiResponse 从 common/types 在这个路由的响应中，
// 因为 Zod schema 会定义响应的形状，并且 Hono/client 会从中推断。
// import type { ApiResponse } from '../common/types'; 

// 我们将假设 Wrangler 预览/部署总是在生产环境中，
// 而 Vite 开发服务器会使用全新的 HTML 页面（不使用我们的 htmlShell）
// 这样我们不需要在服务器端检测环境
const htmlShell = (clientScriptPath: string, stylePath: string) => `
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ServerlessFS</title>
      <link href="${stylePath}" rel="stylesheet">
    </head>
    <body>
      <div id="app"></div>
      <script type="module" src="${clientScriptPath}"></script>
    </body>
  </html>
`;

// 定义 API 输入 (查询参数) 的 Schema
const greetQuerySchema = z.object({
  name: z.string().optional().default('World'),
});

// 定义 API 输出 (响应体) 的 Schema
const greetResponseSchema = z.object({
  message: z.string(),
});

const app = new Hono()
  .get('/', (c) => {
    // 服务器代码 (src/api/index.ts) 总是为生产环境（Wrangler/Cloudflare）服务
    // 它引用的资源是构建后的生产资源。
    // Vite 开发服务器 (pnpm run dev) 会使用根目录的 index.html，
    // 而不会执行这里的逻辑来渲染初始 HTML。
    const clientScript = '/static/client.js';
    const styleSheet = '/static/assets/style.css';
    return c.html(htmlShell(clientScript, styleSheet));
  })
  .get(
    '/api/greet',
    validator('query', (value, c) => {
      const parsed = greetQuerySchema.safeParse(value);
      if (!parsed.success) {
        return c.json({ error: 'Invalid query parameters', issues: parsed.error.issues }, 400);
      }
      return parsed.data; // 返回验证和转换后的数据
    }),
    (c) => {
      const { name } = c.req.valid('query'); // 获取验证后的查询参数
      // 响应数据将自动根据 greetResponseSchema (如果 Hono 支持输出验证的话，或手动确保一致)
      const responseData = { message: `Hello, ${name}!` };
      return c.json(responseData);
    }
  );

export default app;
export type AppType = typeof app; 