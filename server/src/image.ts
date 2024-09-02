/*
 * @Author: flwfdd
 * @Date: 2024-09-02 10:44:18
 * @LastEditTime: 2024-09-03 00:41:46
 * @Description: _(:з」∠)_
 */

import crypto from 'crypto';
import { CONFIG } from './config';
import { store } from './store';

interface ImageAPI {
  filename: string; // 文件名
  url: string; // 原始图片链接
  low_url: string; // 低清图片链接
  mid_url: string; // 中清图片链接
  high_url: string; // 高清图片链接
}

type ImagesInfoType = {
  [filename: string]: { // 文件名
    username: string; // 上传用户名
    upload_time: string; // 上传时间 格式为ISO
    size: number; // 文件大小
  }
}

const getImagesInfo = async (): Promise<ImagesInfoType> => {
  if (await store.exists('images.json')) {
    const images_info_buffer = store.load('images.json');
    const images_info = JSON.parse(images_info_buffer.toString());
    return images_info;
  } else {
    return {};
  }
}

const setImagesInfo = async (images_info: ImagesInfoType) => {
  await store.save('images.json', Buffer.from(JSON.stringify(images_info)));
}

const uploadImage = async (filename: string, buffer: Buffer, username: string): Promise<ImageAPI> => {
  const suffix = filename.split('.').pop()?.toLowerCase();
  if (!suffix) {
    throw new Error('提取文件后缀错误');
  }
  const md5 = crypto.createHash('md5').update(buffer).digest('hex');
  filename = `${md5}.${suffix}`;
  store.save('/img/' + filename, buffer);

  // 更新图片信息
  const images_info = await getImagesInfo();
  images_info[filename] = {
    username,
    upload_time: new Date().toISOString(),
    size: buffer.length,
  };
  await setImagesInfo(images_info);

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
