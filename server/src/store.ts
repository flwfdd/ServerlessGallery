/*
 * @Author: flwfdd
 * @Date: 2024-09-02 00:21:22
 * @LastEditTime: 2024-09-11 16:33:47
 * @Description: _(:з」∠)_
 */
import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';
import COS, { CosError } from 'cos-nodejs-sdk-v5';

// 存储接口
interface StoreAPI {
  save(filename: string, data: Buffer): Promise<void>;
  load(filename: string): Promise<Buffer>;
  delete(filename: string): Promise<void>;
  exists(filename: string): Promise<boolean>;
}

// 本地存储
class LocalStore implements StoreAPI {
  async save(filepath: string, data: Buffer): Promise<void> {
    const full_path = path.join(CONFIG.STORE.LOCAL.PATH, filepath);
    // 检查父目录是否存在
    const parent_path = path.dirname(full_path);
    if (!fs.existsSync(parent_path)) {
      fs.mkdirSync(parent_path, { recursive: true });
    }

    // 保存文件
    fs.writeFileSync(full_path, data);
  }

  async load(filepath: string): Promise<Buffer> {
    const full_path = path.join(CONFIG.STORE.LOCAL.PATH, filepath);
    return fs.readFileSync(full_path);
  }

  async delete(filepath: string): Promise<void> {
    const full_path = path.join(CONFIG.STORE.LOCAL.PATH, filepath);
    fs.unlinkSync(full_path);
  }

  async exists(filepath: string): Promise<boolean> {
    const full_path = path.join(CONFIG.STORE.LOCAL.PATH, filepath);
    return fs.existsSync(full_path);
  }
}

// 腾讯云COS存储
class COSStore implements StoreAPI {
  private cos: COS;

  constructor() {
    this.cos = new COS({
      SecretId: CONFIG.STORE.COS.SECRET_ID,
      SecretKey: CONFIG.STORE.COS.SECRET_KEY,
    });
  }

  async save(filepath: string, data: Buffer): Promise<void> {
    const full_path = path.join(CONFIG.STORE.COS.ROOT, filepath);
    await this.cos.putObject({ Bucket: CONFIG.STORE.COS.BUCKET, Region: CONFIG.STORE.COS.REGION, Key: full_path, Body: data });
  }

  async load(filepath: string): Promise<Buffer> {
    const full_path = path.join(CONFIG.STORE.COS.ROOT, filepath);
    const res = await this.cos.getObject({ Bucket: CONFIG.STORE.COS.BUCKET, Region: CONFIG.STORE.COS.REGION, Key: full_path });
    return res.Body
  }

  async delete(filepath: string): Promise<void> {
    const full_path = path.join(CONFIG.STORE.COS.ROOT, filepath);
    const res = await this.cos.deleteObject({ Bucket: CONFIG.STORE.COS.BUCKET, Region: CONFIG.STORE.COS.REGION, Key: full_path });
  }

  async exists(filepath: string): Promise<boolean> {
    const full_path = path.join(CONFIG.STORE.COS.ROOT, filepath);
    try {
      const res = await this.cos.headObject({ Bucket: CONFIG.STORE.COS.BUCKET, Region: CONFIG.STORE.COS.REGION, Key: full_path });
    } catch (error: any) {
      if (error.statusCode == 404) {
        return false;
      }
      throw error;
    }
    return true;
  }
}

// 存储管家
class Store implements StoreAPI {
  private store: StoreAPI;

  constructor() {
    if (CONFIG.STORE.TYPE === 'COS') {
      this.store = new COSStore();
    } else {
      this.store = new LocalStore();
    }
  }

  async save(filepath: string, data: Buffer): Promise<void> {
    try {
      await this.store.save(filepath, data);
    } catch (error) {
      throw new Error('保存失败Orz');
    }
  }

  async load(filepath: string): Promise<Buffer> {
    try {
      return await this.store.load(filepath);
    } catch (error) {
      throw new Error('读取失败Orz');
    }
  }

  async delete(filepath: string): Promise<void> {
    try {
      await this.store.delete(filepath);
    } catch (error) {
      throw new Error('删除失败Orz');
    }
  }

  async exists(filepath: string): Promise<boolean> {
    try {
      return await this.store.exists(filepath);
    } catch (error) {
      throw new Error('检查失败Orz');
    }
  }
}

const store = new Store();

export { store };