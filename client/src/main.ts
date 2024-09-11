/*
 * @Author: flwfdd
 * @Date: 2024-09-10 16:15:34
 * @LastEditTime: 2024-09-11 12:41:57
 * @Description: _(:з」∠)_
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App);
app.use(router)
app.mount('#app')
