/*
 * @Author: flwfdd
 * @Date: 2024-09-02 00:21:22
 * @LastEditTime: 2024-09-02 21:44:24
 * @Description: _(:з」∠)_
 */
import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';

// 存储接口
interface StoreAPI {
  save(filename: string, data: Buffer): Promise<void>;
  load(filename: string): Promise<Buffer>;
  delete(filename: string): Promise<void>;
}

// 本地存储
class LocalStore implements StoreAPI {
  async save(filename: string, data: Buffer): Promise<void> {
    // 检查目录是否存在
    const img_path = path.join(CONFIG.STORE.LOCAL.PATH, 'img');
    if (!fs.existsSync(img_path)) {
      fs.mkdirSync(img_path, { recursive: true });
    }

    // 保存文件
    const full_path = path.join(img_path, filename);
    fs.writeFileSync(full_path, data);
  }

  async load(filename: string): Promise<Buffer> {
    const full_path = path.join(CONFIG.STORE.LOCAL.PATH, 'img', filename);
    return fs.readFileSync(full_path);
  }

  async delete(filename: string): Promise<void> {
    const full_path = path.join(CONFIG.STORE.LOCAL.PATH, 'img', filename);
    fs.unlinkSync(full_path);
  }
}

// 存储管家
class Store implements StoreAPI {
  private stores: StoreAPI[] = [];

  constructor() {
    if (CONFIG.STORE.LOCAL.ACTIVE) {
      this.stores.push(new LocalStore());
    }
  }

  async save(filename: string, data: Buffer): Promise<void> {
    for (const store of this.stores) {
      await store.save(filename, data);
    }
  }

  async load(filename: string): Promise<Buffer> {
    for (const store of this.stores) {
      try {
        return await store.load(filename);
      } catch (error) {
        continue;
      }
    }
    throw new Error('文件不存在');
  }

  async delete(filename: string): Promise<void> {
    for (const store of this.stores) {
      try {
        await store.delete(filename);
        return;
      } catch (error) {
        continue;
      }
    }
    throw new Error('文件不存在');
  }
}

const store = new Store();

export { store };