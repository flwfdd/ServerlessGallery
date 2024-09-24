/*
 * @Author: flwfdd
 * @Date: 2024-09-01 23:50:00
 * @LastEditTime: 2024-09-24 15:11:15
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
    for (const user of CONFIG.AUTH.USERS) {
      if (user.username === (decoded as { username: string }).username) {
        ctx.state.username = user.username;
        break;
      }
    }
    if (!ctx.state.username) throw new Error('Unknown user');
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { msg: '请先登录Orz' };
  }
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
    ctx.status = 500;
    ctx.body = { msg: '出错啦Orz' };
  }
  if (ctx.status === 400 && !ctx.body) {
    ctx.body = { msg: '参数错误Orz' };
  }
  if (ctx.status === 401 && !ctx.body) {
    ctx.body = { msg: '请先登录Orz' };
  }
  if (ctx.status === 404 && !ctx.body) {
    ctx.body = { msg: '404 Not Found' };
  }
  if (ctx.status === 500 && !ctx.body) {
    ctx.body = { msg: '出错啦Orz' };
  }
};

export { authMiddleware, errorMiddleware };