/*
 * @Author: flwfdd
 * @Date: 2024-09-01 12:09:28
 * @LastEditTime: 2024-09-03 00:26:27
 * @Description: _(:з」∠)_
 */
import Koa from 'koa';
const Router = require('@koa/router');
const { bodyParser } = require('@koa/bodyparser');
const multer = require('@koa/multer');
import jwt from 'jsonwebtoken';
import { CONFIG } from './config';
import { authMiddleware, errorMiddleware } from './middleware';
import { store } from './store';
import { ImageAPI, uploadImage } from './image';
const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(errorMiddleware);
app.use(router.routes()).use(router.allowedMethods());

router.get('/', (ctx: Koa.Context) => {
  ctx.body = 'Hello, Serverless Gallery!';
});

// 登录接口
router.post('/login', (ctx: Koa.Context) => {
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


// 上传接口
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: CONFIG.IMAGE.MAX_SIZE } });
router.post('/upload', authMiddleware, upload.single('file'), async (ctx: Koa.Context) => {
    const file = (ctx.request as any).file as Express.Multer.File;

    if (!file) {
      ctx.status = 400;
      ctx.body = { msg: '参数错误Orz' };
      return;
    }

    const image = await uploadImage(file.originalname, file.buffer, ctx.state.username);
    ctx.body = { image: image, msg: '上传成功OvO' };
});


app.listen(CONFIG.PORT, () => {
  console.log(`Server is running on http://localhost:${CONFIG.PORT}`);
});