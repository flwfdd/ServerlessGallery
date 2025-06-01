<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-slate-900/20 dark:bg-slate-900/40 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-2 sm:p-4 text-center sm:items-center">
          <TransitionChild as="template" enter="ease-out duration-200"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-150"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative transform overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6 text-left sm:my-8 w-full sm:max-w-2xl lg:p-8 shadow-[6px_6px_0px_0px_rgba(6,182,212,0.15)]">
              <div class="flex items-center justify-between mb-4 sm:mb-8">
                <DialogTitle as="h3"
                  class="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 relative inline-block">
                  {{ t('fileList.fileInfo') }}
                  <div
                    class="absolute -bottom-1 left-0 right-0 h-1 bg-blue-300 dark:bg-blue-400/60 opacity-60 transform rotate-0.5">
                  </div>
                </DialogTitle>
                <button @click="$emit('close')"
                  class="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300 rounded-lg sm:rounded-xl border-2 border-slate-300 dark:border-slate-600 transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 hover:rotate-90 cursor-pointer">
                  <X class="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div v-if="file" class="space-y-6 sm:space-y-8">
                <!-- 文件预览 -->
                <div v-if="file.mime_type.startsWith('image/')" class="text-center">
                  <div
                    class="inline-block rounded-xl sm:rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-600 hover:scale-105 hover:ring-4 hover:ring-cyan-200 dark:hover:ring-cyan-700 transition-transform duration-200">
                    <img :src="`/files/${file.filename}?level=mid`" :alt="file.title || file.filename"
                      class="max-w-full max-h-60 sm:max-h-80 object-contain" />
                  </div>
                </div>

                <!-- 基本信息 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-800 dark:text-slate-200">{{
                      t('fileList.fileName')
                    }}</label>
                    <div>
                      <input readonly :value="file.filename"
                        class="w-full rounded-lg sm:rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:border-cyan-300 dark:focus:border-cyan-500 bg-slate-50 dark:bg-slate-700 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-800 dark:text-slate-200">{{
                      t('fileList.mimeType')
                    }}</label>
                    <div>
                      <input readonly :value="file.mime_type"
                        class="w-full rounded-lg sm:rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:border-cyan-300 dark:focus:border-cyan-500 bg-slate-50 dark:bg-slate-700 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-800 dark:text-slate-200">{{
                      t('fileList.size')
                    }}</label>
                    <p class="text-slate-700 dark:text-slate-300 px-3 sm:px-4 py-2 sm:py-3 text-sm">
                      {{ formatFileSize(file.size) }}
                    </p>
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-800 dark:text-slate-200">{{
                      t('fileList.uploadTime')
                    }}</label>
                    <p class="text-slate-700 dark:text-slate-300 px-3 sm:px-4 py-2 sm:py-3 text-sm">
                      {{ formatDate(file.uploaded_at) }}
                    </p>
                  </div>
                  <div v-if="file.title" class="lg:col-span-2 space-y-2">
                    <label class="text-sm font-bold text-slate-800 dark:text-slate-200">{{
                      t('fileInfo.title')
                    }}</label>
                    <p class="text-slate-700 dark:text-slate-300 px-3 sm:px-4 py-2 sm:py-3 text-sm">
                      {{ file.title }}
                    </p>
                  </div>
                  <div v-if="file.description" class="lg:col-span-2 space-y-2">
                    <label class="text-sm font-bold text-slate-800 dark:text-slate-200">{{
                      t('fileInfo.description')
                    }}</label>
                    <p class="text-slate-700 dark:text-slate-300 px-3 sm:px-4 py-2 sm:py-3 text-sm">
                      {{ file.description }}
                    </p>
                  </div>
                </div>

                <!-- 分享链接 -->
                <div class="border-t-2 border-dashed border-slate-200 dark:border-slate-600 pt-6 sm:pt-8">
                  <h4
                    class="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 sm:mb-6">
                    <div
                      class="w-6 h-6 sm:w-8 sm:h-8 bg-violet-200 dark:bg-violet-600/50 rounded-lg sm:rounded-xl flex items-center justify-center transform -rotate-16 hover:rotate-0 transition-transform duration-200">
                      <Link class="w-4 h-4 sm:w-5 sm:h-5 text-violet-700 dark:text-violet-300" />
                    </div>
                    {{ t('fileList.shareLinks') }}
                  </h4>
                  <div class="space-y-3 sm:space-y-4">
                    <!-- 原始文件 -->
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-800 dark:text-slate-200">{{
                        t('fileList.originalFile') }}</label>
                      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <input readonly :value="`${currentOrigin}/files/${file.filename}`"
                          class="flex-1 rounded-lg sm:rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:border-cyan-300 dark:focus:border-cyan-500 bg-slate-50 dark:bg-slate-700 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200" />
                        <div class="flex gap-2 sm:gap-3">
                          <button @click="openInNewTab(`${currentOrigin}/files/${file.filename}`)"
                            class="flex-1 sm:flex-none bg-cyan-200 dark:bg-cyan-600 hover:bg-cyan-400 dark:hover:bg-cyan-500 text-cyan-800 dark:text-cyan-100 font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-cyan-400 dark:border-cyan-500 transition-all duration-150 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(6,182,212,0.2)] text-xs sm:text-sm">
                            <Copy class="w-3 h-3 sm:w-4 sm:h-4 hover:rotate-12 transition-transform duration-200" />
                            {{ t('fileList.open') }}
                          </button>
                          <button
                            @click="copyToClipboard(`${currentOrigin}/files/${file.filename}`, t('fileList.originalFileLink'))"
                            class="flex-1 sm:flex-none bg-cyan-200 dark:bg-cyan-600 hover:bg-cyan-400 dark:hover:bg-cyan-500 text-cyan-800 dark:text-cyan-100 font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-cyan-400 dark:border-cyan-500 transition-all duration-150 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(6,182,212,0.2)] text-xs sm:text-sm">
                            <Copy class="w-3 h-3 sm:w-4 sm:h-4 hover:rotate-12 transition-transform duration-200" />
                            {{ t('fileList.copy') }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- 压缩版本 -->
                    <div v-if="file.mime_type.startsWith('image/')" class="space-y-3 sm:space-y-4">
                      <div v-for="(level, label) in compressionLevels" :key="level" class="space-y-2">
                        <label class="text-sm font-bold text-slate-800 dark:text-slate-200">{{
                          label }}</label>
                        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <input readonly :value="`${currentOrigin}/files/${file.filename}?level=${level}`"
                            class="flex-1 rounded-lg sm:rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:border-cyan-300 dark:focus:border-cyan-500 bg-slate-50 dark:bg-slate-700 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200" />
                          <button
                            @click="copyToClipboard(`${currentOrigin}/files/${file.filename}?level=${level}`, `${label} ${t('fileList.link')}`)"
                            class="bg-cyan-200 dark:bg-cyan-600 hover:bg-cyan-400 dark:hover:bg-cyan-500 text-cyan-800 dark:text-cyan-100 font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-cyan-400 dark:border-cyan-500 transition-all duration-150 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(6,182,212,0.2)] text-xs sm:text-sm w-full sm:w-auto">
                            <Copy class="w-3 h-3 sm:w-4 sm:h-4 hover:rotate-12 transition-transform duration-200" />
                            {{ t('fileList.copy') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue';
import { Copy, Link, X } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FileMetadata } from '../../common/services';

const { t } = useI18n();

defineProps<{
  show: boolean;
  file: FileMetadata | null;
}>();

const emit = defineEmits<{
  close: [];
  showToast: [message: string];
}>();

// 计算属性
const currentOrigin = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
});

const compressionLevels = computed(() => ({
  [t('fileList.lowQuality')]: 'low',
  [t('fileList.midQuality')]: 'mid',
  [t('fileList.highQuality')]: 'high'
}));

// 工具函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const locale = t('common.dateLocale') || 'zh-CN';
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 操作函数
const openInNewTab = (url: string) => {
  window.open(url, '_blank');
};

const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text);
    emit('showToast', `${type}${t('fileList.copySuccess')}`);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    emit('showToast', t('fileList.copyFailed'));
  }
};
</script>