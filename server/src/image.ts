/*
 * @Author: flwfdd
 * @Date: 2024-09-02 10:44:18
 * @LastEditTime: 2024-09-02 21:44:11
 * @Description: _(:з」∠)_
 */

import crypto from 'crypto';
import { CONFIG } from './config';
import { store } from './store';
interface ImageAPI {
  filename: string;
  url: string;
  low_url: string;
  mid_url: string;
  high_url: string;
}

function uploadImage(filename: string, buffer: Buffer): ImageAPI {
  const suffix = filename.split('.').pop()?.toLowerCase();
  if (!suffix) {
    throw new Error('提取文件后缀错误');
  }
  const md5 = crypto.createHash('md5').update(buffer).digest('hex');
  filename = `${md5}.${suffix}`;
  store.save(filename, buffer);

  const url = `${CONFIG.IMAGE.BASE_URL}/${filename}`;
  const low_url = `${url}${CONFIG.IMAGE.LOW_SUFFIX}`;
  const mid_url = `${url}${CONFIG.IMAGE.MID_SUFFIX}`;
  const high_url = `${url}${CONFIG.IMAGE.HIGH_SUFFIX}`;
  return {
    filename,
    url,
    low_url,
    mid_url,
    high_url,
  };
}

export { ImageAPI, uploadImage };
