<!--
 * @Author: flwfdd
 * @Date: 2024-09-10 16:46:16
 * @LastEditTime: 2024-11-28 12:49:38
 * @Description: _(:з」∠)_
-->
<template>
  <div class="container">
    <h1>Gallery</h1>
    <n-grid cols="2 600:3">
      <n-gi>
        <n-card v-for="item in gallery.list" :key="item.mid" size="small">
          <template #cover>
            <n-image :src="item.low_url" :preview-src="item.high_url" />
          </template>
          <n-space size="small">
            <n-button secondary size="tiny" type="primary">低</n-button>
            <n-button secondary size="tiny" type="primary">中</n-button>
            <n-button secondary size="tiny" type="primary">高</n-button>
            <n-button secondary size="tiny" type="primary">原</n-button>
            <n-button secondary size="tiny" type="info">文</n-button>
            <n-popconfirm @positive-click="" :show-icon="false" positive-text="是" negative-text="否">
              <template #trigger>
                <n-button secondary size="tiny" type="error">删</n-button>
              </template>
              汝真断舍离耶？
            </n-popconfirm>

          </n-space>
          <span style="font-size: 12px;">{{ FormatTime(item.upload_time) }}</span>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import http from '@/utils/request';
import { FormatTime } from '@/utils/tools';
import { onMounted, reactive } from 'vue';

interface ImageAPI {
  mid: string; // 图片ID
  url: string; // 原始图片链接
  low_url: string; // 低清图片链接
  mid_url: string; // 中清图片链接
  high_url: string; // 高清图片链接
  upload_time: string; // 上传时间 格式为ISO
}

const gallery = reactive({
  order: 'time_down',
  page: 0,
  page_size: 24,
  loading: false,
  end: false,
  list: [] as ImageAPI[],
});

function Load() {
  gallery.loading = true;
  http.get('/images', {
    params: {
      order: gallery.order,
      page: gallery.page,
      page_size: gallery.page_size,
    }
  }).then(res => {
    if (res.data.length == 0) {
      gallery.end = true;
    } else {
      gallery.list = gallery.list.concat(res.data);
      gallery.page++;
    }
    gallery.loading = false;
  }).catch(() => {
    gallery.loading = false;
  })
}

onMounted(() => {
  Load();
})

</script>