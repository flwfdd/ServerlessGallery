/*
 * @Author: flwfdd
 * @Date: 2024-09-02 10:44:18
 * @LastEditTime: 2024-09-04 11:27:42
 * @Description: _(:з」∠)_
 */
import crypto from 'crypto';
import { CONFIG } from './config';
import { store } from './store';


// 返回前端的图片信息
interface ImageAPI {
  filename: string; // 文件名
  url: string; // 原始图片链接
  low_url: string; // 低清图片链接
  mid_url: string; // 中清图片链接
  high_url: string; // 高清图片链接
  upload_time: string; // 上传时间 格式为ISO
}

// 存储的图片信息
interface ImageInfoType {
  username: string; // 上传用户名
  upload_time: string; // 上传时间 格式为ISO
  size: number; // 文件大小
}

type ImagesInfoType = {
  [filename: string]: ImageInfoType; // 文件名
}


// 将存储的图片信息转换为前端API
const filename2ImageAPI = (filename: string, image_info: ImageInfoType): ImageAPI => {
  const url = `${CONFIG.IMAGE.BASE_URL}/${filename}`;
  return {
    filename,
    url,
    low_url: `${url}${CONFIG.IMAGE.LOW_SUFFIX}`,
    mid_url: `${url}${CONFIG.IMAGE.MID_SUFFIX}`,
    high_url: `${url}${CONFIG.IMAGE.HIGH_SUFFIX}`,
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
  filename = `${md5}.${suffix}`;
  store.save('/img/' + filename, buffer);

  // 更新图片信息
  const images_info = await getImagesInfo();
  const image_info: ImageInfoType = {
    username,
    upload_time: new Date().toISOString(),
    size: buffer.length,
  };
  images_info[filename] = image_info;
  await setImagesInfo(images_info);
  return filename2ImageAPI(filename, image_info);
}


// 获取图片列表
const getImageList = async (order_by: 'time' | 'size', order_type: 'up' | 'down', page: number, page_size: number): Promise<ImageAPI[]> => {
  const images_info = await getImagesInfo();
  const images_info_list = Object.keys(images_info).map(key => {
    return {
      filename: key,
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
  return images_list.map(image_info => filename2ImageAPI(image_info.filename, image_info));
}


// 删除图片
const deleteImage = async (filename: string) => {
  await store.delete('/img/' + filename);
  const images_info = await getImagesInfo();
  delete images_info[filename];
  await setImagesInfo(images_info);
}

export { ImageAPI, uploadImage, getImageList, deleteImage }
