/*
 * @Author: flwfdd
 * @Date: 2024-09-10 16:36:30
 * @LastEditTime: 2024-09-11 12:40:35
 * @Description: _(:з」∠)_
 */
import axios from 'axios';
import store from './store';
// import { useRouter, useRoute } from 'vue-router';
import router from "../router.ts";

const http = axios.create();

// 添加请求拦截器
http.interceptors.request.use(
  (config: any) => {
    if (config.url[0] == '/') config.url = store.api_url + config.url;
    config.headers['Authorization'] = 'Bearer ' + store.jwt;
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

// 添加响应拦截器
http.interceptors.response.use(
  (res) => {
    if (res.data.msg) window.$message.success(res.data.msg);
    return res;
  },
  (err) => {
    if (err.request.status == 500) {
      if (err.response.data.msg) window.$message.error(err.response.data.msg);
      else window.$message.error('出错了Orz');
    }
    else if (err.request.status == 401) {
      store.jwt = "";
      // 自动跳转
      const route = router.currentRoute.value;
      if (route.name != "login") {
        window.$message.error(err.response.data.msg || '请先登录awa');
      } else if (err.response.data.msg) {
        window.$message.error(err.response.data.msg);
      }
      if (route.meta.login) {
        router.push({ name: 'login', query: { redirect: encodeURIComponent(route.fullPath) } });
      }
    }
    else if (err.request.status == 400) {
      if (err.response.data.msg) window.$message.error(err.response.data.msg);
      else window.$message.error('请检查请求参数awa');
    }
    return Promise.reject(err);
  }
);

export default http;