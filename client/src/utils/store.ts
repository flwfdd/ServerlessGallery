/*
 * @Author: flwfdd
 * @Date: 2024-09-10 16:37:51
 * @LastEditTime: 2024-09-24 14:57:29
 * @Description: _(:з」∠)_
 */
import { reactive, watch } from 'vue'
import package_json from '../../package.json'

let s = window.localStorage.getItem('store');
let x: any = {};
if (s) x = JSON.parse(s);
else x = {};

const store = reactive({
  version: package_json.version,
  api_url: "http://127.0.0.1:9000",
  token: x.token || "",
  theme_mode: x.theme_mode || "auto", // auto dark light
})

watch(store, () => {
  window.localStorage.setItem('store', JSON.stringify(store));
})

// console.log(store);

export default store