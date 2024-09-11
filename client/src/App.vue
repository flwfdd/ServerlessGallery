<!--
 * @Author: flwfdd
 * @Date: 2024-09-11 12:21:15
 * @LastEditTime: 2024-09-11 15:54:15
 * @Description: _(:з」∠)_
-->
<script setup lang="ts">
import { NIcon, darkTheme, lightTheme, useOsTheme } from 'naive-ui'
import LightThemeOverrides from '@/utils/naive-ui-light-theme-overrides.json';
import DarkThemeOverrides from '@/utils/naive-ui-dark-theme-overrides.json';
import { useRouter, useRoute } from 'vue-router';
import { onMounted, computed } from 'vue';
import RefreshOutlined from '@vicons/material/RefreshOutlined'
import ArrowBackOutlined from '@vicons/material/ArrowBackOutlined'
import BrightnessAutoOutlined from '@vicons/material/BrightnessAutoOutlined'
import LightModeOutlined from '@vicons/material/LightModeOutlined'
import DarkModeOutlined from '@vicons/material/DarkModeOutlined'
import GlobalComponents from './components/GlobalComponents.vue';
import { hitokoto, WatchNetwork } from './utils/tools';
import axios from 'axios';

import store from './utils/store';

const isDark = computed(() => {
  if (store.theme_mode === "auto") {
    return useOsTheme().value === "dark";
  } else {
    return store.theme_mode === "dark";
  }
})
const theme = computed(() => isDark.value ? darkTheme : lightTheme);
const themeOverrides = computed(() => isDark.value ? DarkThemeOverrides : LightThemeOverrides);

function ChangeTheme() {
  if (store.theme_mode === "auto") {
    store.theme_mode = "light";
  } else if (store.theme_mode === "light") {
    store.theme_mode = "dark";
  } else {
    store.theme_mode = "auto";
  }
}

const router = useRouter();
const route = useRoute();

function ToTop() {
  window.scrollTo(0, 0);
}

function Refresh() {
  window.location.reload();
}

onMounted(() => {
  // 自动升级到https
  if (location.protocol == 'http:') {
    axios.get(`https${location.href.substring(4)}`).then(() => {
      location.protocol = 'https:';
    })
  };

  // 监测网络
  WatchNetwork();
})

</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides" :theme="theme">
    <n-global-style />
    <n-el>
      <GlobalComponents></GlobalComponents>
      <n-layout>
        <n-layout-header bordered style="background-color:var(--primary-color)">
          <n-space class="container" justify="space-between">
            <div style="height:42px;display: flex;align-items: center;padding: 4px;">
              <n-button @click="router.push('/home')" text style="font-size: 24px;color:#FFF">画廊图床</n-button>
            </div>
            <div style="display:flex;align-items:center;height:100%;">
              <n-button @click="router.go(-1)" quaternary circle size="large" color="white">
                <template #icon>
                  <n-icon>
                    <ArrowBackOutlined />
                  </n-icon>
                </template>
              </n-button>
              <n-button @click="Refresh" quaternary circle size="large" color="white">
                <template #icon>
                  <n-icon>
                    <RefreshOutlined />
                  </n-icon>
                </template>
              </n-button>
              <n-button @click="ChangeTheme" quaternary circle size="large" color="white">
                <template #icon>
                  <n-icon>
                    <LightModeOutlined v-if="store.theme_mode == 'light'" />
                    <DarkModeOutlined v-else-if="store.theme_mode == 'dark'" />
                    <BrightnessAutoOutlined v-else />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </n-space>
        </n-layout-header>

        <n-layout-content justify="center" style="margin: 11px;min-height: 89vh;">
          <router-view v-slot="{ Component }">
            <keep-alive :max="42">
              <component :is="Component" v-if="route.meta.keepAlive != false" :key="route.fullPath" />
            </keep-alive>
            <component :is="Component" v-if="route.meta.keepAlive == false" />
          </router-view>
        </n-layout-content>


        <n-layout-footer style="text-align:center;min-height: 11vh;">
          <h4 style="margin: auto;font-size: 14px;">{{ hitokoto }}</h4>
          <div><n-button @click="ToTop" text size="large">👆回到顶部👆</n-button></div>
          <div>
            <n-a href="https://github.com/BIT101-dev" target="_blank">GitHub</n-a>
            ｜
            <n-a href="https://bit101-project.feishu.cn/wiki/OY1Xw6y27iNZqgkSDCkc5Cfdnjc" target="_blank">加入BIT101</n-a>
          </div>
          <div style="font-size: 14px;">Powered⚡ by BIT101 Project Team with 💖.</div>

        </n-layout-footer>
      </n-layout>
    </n-el>
  </n-config-provider>
</template>

<style>
@font-face {
  font-family: "Noto Serif";
  src: local("Noto Serif SC Light"),
    local("Noto Serif SC"),
    local("Noto Serif CJK Light"),
    local("Noto Serif CJK"),
    local("Source Han Serif CN Light"),
    local("Source Han Serif CN");
  font-display: swap;
  font-weight: 300;
}

@font-face {
  font-family: "Noto Serif";
  src: local("Noto Serif SC Medium"),
    local("Noto Serif SC"),
    local("Noto Serif CJK Medium"),
    local("Noto Serif CJK"),
    local("Source Han Serif CN Medium"),
    local("Source Han Serif CN");
  font-display: swap;
  font-weight: 500;
}

@font-face {
  font-family: "Noto Serif";
  src: local("Noto Serif SC Bold"),
    local("Noto Serif CJK Bold"),
    local("Source Han Serif CN Bold");
  font-display: swap;
  font-weight: 700;
}

@font-face {
  font-family: "Noto Serif";
  src: local("Noto Serif SC Heavy"),
    local("Noto Serif CJK Heavy"),
    local("Source Han Serif CN Heavy");
  font-display: swap;
  font-weight: 900;
}

#app,
body {
  font-family: "Noto Serif", "Noto Serif SC", serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
}

.container {
  max-width: 666px;
  margin: auto;
}

::selection {
  color: #fff;
  background: #00bcd4;
}
</style>