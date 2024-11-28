/*
 * @Author: flwfdd
 * @Date: 2024-09-01 12:09:28
 * @LastEditTime: 2024-11-28 12:43:29
 * @Description: _(:з」∠)_
 */
import Koa from 'koa';
import cors from '@koa/cors';
const Router = require('@koa/router');
const { bodyParser } = require('@koa/bodyparser');
const multer = require('@koa/multer');
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { CONFIG } from './config';
import { authMiddleware, errorMiddleware } from './middleware';
import { uploadImage, getImageList, deleteImage, editImage } from './image';
const app = new Koa();
const router = new Router();

app.use(cors());
app.use(bodyParser());
app.use(errorMiddleware);
app.use(router.routes()).use(router.allowedMethods());

router.get('/', (ctx: Koa.Context) => {
  ctx.body = 'Hello, Serverless Gallery!';
});

// 用户接口
router.get('/user',authMiddleware, (ctx: Koa.Context) => {
  if(ctx.state.username){
    ctx.body = { username: ctx.state.username };
  } else {
    ctx.status = 401;
  }
});

// 登录接口
router.post('/login', (ctx: Koa.Context) => {
  const schema = z.object({
    username: z.string(),
    password: z.string(),
  });
  if (!schema.safeParse(ctx.request.body).success) {
    ctx.status = 400;
    return;
  }
  const { username, password } = ctx.request.body as { username: string; password: string };

  const user = CONFIG.AUTH.USERS.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ username: user.username }, CONFIG.AUTH.JWT_SECRET, { expiresIn: CONFIG.AUTH.EXPIRES_IN });
    ctx.body = { token: token };
  } else {
    ctx.status = 401;
    ctx.body = { msg: '用户名或密码错误' };
  }
});


// 上传
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: CONFIG.IMAGE.MAX_SIZE } });
router.post('/image', authMiddleware, upload.single('file'), async (ctx: Koa.Context) => {
  const file = (ctx.request as any).file as Express.Multer.File;

  if (!file) {
    ctx.status = 400;
    return;
  }

  const image = await uploadImage(file.originalname, file.buffer, ctx.state.username);
  ctx.body = { image: image, msg: '上传成功OvO' };
});


// 获取列表
router.get('/images', authMiddleware, async (ctx: Koa.Context) => {
  const schema = z.object({
    order: z.enum(['time_up', 'time_down', 'size_up', 'size_down']),
    page: z.coerce.number().int().min(0),
    page_size: z.coerce.number().int().min(1),
    search: z.string().optional(),
  });
  if (!schema.safeParse(ctx.query).success) {
    ctx.status = 400;
    return;
  }

  const { order, page, page_size, search } = ctx.query;
  const order_by = (order as string).split('_')[0] as 'time' | 'size';
  const order_type = (order as string).split('_')[1] as 'up' | 'down';

  const images = await getImageList(
    order_by,
    order_type,
    parseInt(page as string),
    parseInt(page_size as string)
  );
  if (search) {
    ctx.body = images.filter(image => image.text.includes(search as string));
  } else {
    ctx.body = images;
  }
});


// 删除图片
router.delete('/image/:mid', authMiddleware, async (ctx: Koa.Context) => {
  const schema = z.object({
    mid: z.string(),
  });
  if (!schema.safeParse(ctx.params).success) {
    ctx.status = 400;
    return;
  }
  const { mid } = ctx.params;
  await deleteImage(mid as string);
  ctx.body = { msg: '删除成功OvO' };
});

// 编辑图片备注
router.put('/image/:mid', authMiddleware, async (ctx: Koa.Context) => {
  const paramsSchema = z.object({
    mid: z.string(),
  });
  const bodySchema = z.object({
    text: z.string(),
  });
  if (!paramsSchema.safeParse(ctx.params).success || !bodySchema.safeParse(ctx.request.body).success) {
    ctx.status = 400;
    return;
  }
  const { mid } = ctx.params;
  const { text } = ctx.request.body as { text: string };
  await editImage(mid as string, text);
  ctx.body = { msg: '编辑成功OvO' };
});

app.listen(CONFIG.PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${CONFIG.PORT}`);
});
