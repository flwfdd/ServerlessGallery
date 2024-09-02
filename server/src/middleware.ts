/*
 * @Author: flwfdd
 * @Date: 2024-09-01 23:50:00
 * @LastEditTime: 2024-09-03 00:28:00
 * @Description: _(:з」∠)_
 */
import Koa from 'koa';
import jwt from 'jsonwebtoken';
import { CONFIG } from './config';

// 鉴权中间件
const authMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
  try {
    const token = ctx.header.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, CONFIG.AUTH.JWT_SECRET);
    ctx.state.username = (decoded as { username: string }).username;
  } catch (error) {
    console.log(error);
    ctx.status = 401;
    ctx.body = { msg: '请先登录' };
  }
  await next();
};

// 错误处理中间件
const errorMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
  try {
    await next();
  } catch (error: any) {
    console.log(error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      ctx.status = 400;
      ctx.body = { msg: '太大啦Orz' };
      return;
    }
  }
};

export { authMiddleware, errorMiddleware };