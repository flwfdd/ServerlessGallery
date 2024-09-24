<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { FormRules, FormItemRule, FormInst } from 'naive-ui';
import http from '@/utils/request';
import store from '@/utils/store';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const user = reactive({
  username: "",
  password: "",
})

const form_ref = ref<FormInst | null>(null);
const rules: FormRules = {
  username: [
    {
      required: true,
      validator(_: FormItemRule, value: string) {
        if (!value) {
          return new Error('空空如也呢')
        }
        return true
      },
      trigger: ['input', 'blur']
    }
  ],
  password: [
    {
      required: true,
      validator(_: FormItemRule, value: string) {
        if (!value) {
          return new Error('空空如也呢')
        }
        return true
      },
      trigger: ['input', 'blur']
    }
  ]
}

// 登陆状态
const status = ref(false);
function CheckStatus() {
  http.get('/user')
    .then(res => {
      status.value = true;
      user.username = res.data.username;
      if (route.query.redirect) router.push(decodeURIComponent(route.query.redirect as string));
    })
    .catch(() => {
      status.value = false;
    })
}


function Login() {
  form_ref.value?.validate((err) => {
    if (!err) {
      http.post('/login', {
        username: user.username,
        password: user.password
      }).then(res => {
        store.token = res.data.token;
        CheckStatus();
      })
    } else {
      window.$message.error('请检查输入qwq')
    }
  })
}

onMounted(() => { CheckStatus(); })

function Logout() { store.token = ""; CheckStatus(); }

</script>

<template>
  <div class="container">
    <n-card size="small">
      <n-alert :show-icon="false" :type="status ? 'success' : 'error'" title="此时此刻">
        <template v-if="status">
          🥳 欢迎！ {{ user.username }}<br />
          抑或你想<n-button @click="Logout" text type="primary" style="margin:4px">注销</n-button>
        </template>
        <template v-else>
          未登录
        </template>
      </n-alert>
      <n-form v-if="!status" ref="form_ref" :rules="rules" :model="user" style="margin-top: 16px;">
        <n-form-item path="username" label="用户名">
          <n-input v-model:value="user.username" placeholder="请输入BIT学号" />
        </n-form-item>

        <n-form-item path="password" label="密码">
          <n-input v-model:value="user.password" type="password" show-password-on="click" placeholder="告诉我你的秘密" />
        </n-form-item>

        <n-button @click="Login" block>登录</n-button>
      </n-form>
    </n-card>
    <br />
  </div>
</template>
