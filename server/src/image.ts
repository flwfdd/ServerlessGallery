/*
 * @Author: flwfdd
 * @Date: 2024-09-02 10:44:18
 * @LastEditTime: 2024-11-28 12:27:43
 * @Description: _(:з」∠)_
 */
import crypto from 'crypto';
import { CONFIG } from './config';
import { store } from './store';
import path from 'path';


// 返回前端的图片信息
interface ImageAPI {
  mid: string; // 图片ID 即文件名
  url: string; // 原始图片链接
  low_url: string; // 低清图片链接
  mid_url: string; // 中清图片链接
  high_url: string; // 高清图片链接
  text: string; // 图片备注
  upload_time: string; // 上传时间 格式为ISO
}

// 存储的图片信息
interface ImageInfoType {
  username: string; // 上传用户名
  upload_time: string; // 上传时间 格式为ISO
  size: number; // 文件大小
  text: string; // 图片备注
}

type ImagesInfoType = {
  [mid: string]: ImageInfoType; // 文件名
}


// 将存储的图片信息转换为前端API
const mid2ImageAPI = (mid: string, image_info: ImageInfoType): ImageAPI => {
  const url = path.join(CONFIG.IMAGE.BASE_URL, 'img', mid);
  return {
    mid,
    url,
    low_url: `${url}${CONFIG.IMAGE.LOW_SUFFIX}`,
    mid_url: `${url}${CONFIG.IMAGE.MID_SUFFIX}`,
    high_url: `${url}${CONFIG.IMAGE.HIGH_SUFFIX}`,
    text: image_info.text,
    upload_time: image_info.upload_time,
  };
}


// 获取图片信息字典
const getImagesInfo = async (): Promise<ImagesInfoType> => {
  if (await store.exists('images.json')) {
    const images_info_buffer = await store.load('images.json');
    const images_info = JSON.parse(images_info_buffer.toString());
    return images_info;
  } else {
    return {};
  }
}


// 设置图片信息字典
const setImagesInfo = async (images_info: ImagesInfoType) => {
  await store.save('images.json', Buffer.from(JSON.stringify(images_info)));
}


// 上传图片
const uploadImage = async (filename: string, buffer: Buffer, username: string): Promise<ImageAPI> => {
  const suffix = filename.split('.').pop()?.toLowerCase();
  if (!suffix) {
    throw new Error('提取文件后缀错误');
  }
  const md5 = crypto.createHash('md5').update(buffer).digest('hex');
  const mid = `${md5}.${suffix}`;
  store.save('/img/' + mid, buffer);

  // 更新图片信息
  const images_info = await getImagesInfo();
  const image_info: ImageInfoType = {
    username,
    upload_time: new Date().toISOString(),
    size: buffer.length,
    text: "",
  };
  images_info[mid] = image_info;
  await setImagesInfo(images_info);
  return mid2ImageAPI(mid, image_info);
}


// 获取图片列表
const getImageList = async (order_by: 'time' | 'size', order_type: 'up' | 'down', page: number, page_size: number): Promise<ImageAPI[]> => {
  const images_info = await getImagesInfo();
  const images_info_list = Object.keys(images_info).map(key => {
    return {
      mid: key,
      ...images_info[key],
    };
  });
  images_info_list.sort((a, b) => {
    if (order_by === 'time') {
      return order_type === 'up' ? a.upload_time.localeCompare(b.upload_time) : b.upload_time.localeCompare(a.upload_time);
    } else {
      return order_type === 'up' ? a.size - b.size : b.size - a.size;
    }
  });
  const images_list = images_info_list.slice(page * page_size, (page + 1) * page_size);
  return images_list.map(image_info => mid2ImageAPI(image_info.mid, image_info));
}


// 删除图片
const deleteImage = async (mid: string) => {
  await store.delete('/img/' + mid);
  const images_info = await getImagesInfo();
  delete images_info[mid];
  await setImagesInfo(images_info);
}

// 编辑图片备注
const editImage = async (mid: string, text: string) => {
  const images_info = await getImagesInfo();
  images_info[mid].text = text;
  await setImagesInfo(images_info);
}

export { ImageAPI, uploadImage, getImageList, deleteImage, editImage };
