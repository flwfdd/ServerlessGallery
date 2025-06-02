<template>
  <section class="mb-6 sm:mb-12">
    <div
      class="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 transform hover:scale-[1.01] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(6,182,212,0.12)]">
      <div class="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6 relative inline-block">
        <div
          class="absolute bottom-2 left-0 right-0 h-2 bg-cyan-300 dark:bg-cyan-400/60 opacity-60 transform -rotate-1">
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 relative">{{ t('upload.title')
        }}
        </h2>
      </div>

      <!-- 上传拖拽区域 -->
      <div v-if="!isUploading" class="mb-4 sm:mb-6">
        <label @click="fileInput?.click()" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleFileDrop" class="block cursor-pointer group">
          <input ref="fileInput" type="file" @change="handleFileChange" multiple accept="*/*" class="sr-only" />
          <div
            class="border-3 border-dashed transition-all duration-200 rounded-2xl p-6 sm:p-12 text-center group-hover:scale-[1.02]"
            :class="isDragOver
              ? 'border-cyan-400 dark:border-cyan-400 bg-cyan-100 dark:bg-cyan-900/40 scale-[1.02]'
              : 'border-cyan-200 dark:border-cyan-400/50 bg-cyan-50 dark:bg-cyan-900/20 group-hover:border-cyan-300 dark:group-hover:border-cyan-400/70 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30'">
            <div
              class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mb-3 sm:mb-4 transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-200"
              :class="isDragOver
                ? 'bg-cyan-300 dark:bg-cyan-600/70 rotate-6 scale-110'
                : 'bg-cyan-200 dark:bg-cyan-600/50'">
              <Upload class="w-6 h-6 sm:w-8 sm:h-8 text-cyan-700 dark:text-cyan-300" />
            </div>
            <p class="text-base sm:text-lg font-semibold mb-2 transition-colors duration-200" :class="isDragOver
              ? 'text-cyan-800 dark:text-cyan-200'
              : 'text-slate-800 dark:text-slate-200 group-hover:text-cyan-800 dark:group-hover:text-cyan-300'">
              {{ isDragOver
                ? t('upload.dropFiles')
                : (selectedFiles.length > 0 ? t('upload.addMoreFiles') : t('upload.dropzone')) }}</p>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400">{{ t('upload.dropzoneSubtitle') }}</p>
          </div>
        </label>
      </div>

      <!-- 选中的文件列表 -->
      <div v-if="selectedFiles.length > 0" class="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        <div v-for="(file, index) in selectedFiles" :key="`${file.name}-${file.lastModified}-${index}`"
          class="bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-4 sm:p-6 shadow-[2px_2px_0px_0px_rgba(148,163,184,0.15)]">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 bg-rose-200 dark:bg-rose-600/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <component :is="getFileIcon(index)" :class="{ 'animate-spin': fileStatuses[index] === 'uploading' }"
                  class="w-5 h-5 sm:w-6 sm:h-6 text-rose-700 dark:text-rose-300" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base truncate">{{ file.name
                }}</p>
                <p class="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">{{ formatFileSize(file.size) }}
                </p>
              </div>
            </div>
            <button v-if="!isUploading" @click="removeFile(index)" :title="t('upload.remove')"
              class="w-8 h-8 bg-red-200 dark:bg-red-600/50 hover:bg-red-300 dark:hover:bg-red-500 text-red-700 dark:text-red-300 rounded-lg border-2 border-red-300 dark:border-red-500 transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 ml-2">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- 文件上传进度条 -->
          <div v-if="isUploading && fileProgresses[index] !== undefined" class="space-y-2">
            <div class="flex items-center justify-between text-xs sm:text-sm">
              <span class="text-slate-600 dark:text-slate-400 truncate">{{ getUploadStatusText(index) }}</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300 ml-2">{{
                Math.round(fileProgresses[index]) }}%</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300 ease-out" :class="getProgressBarClass(index)"
                :style="{ width: `${fileProgresses[index]}%` }">
              </div>
            </div>
          </div>
        </div>

        <!-- 总体上传进度 -->
        <div v-if="isUploading" class="mb-4 sm:mb-6">
          <div
            class="bg-slate-100 dark:bg-slate-600 border-2 border-slate-200 dark:border-slate-500 rounded-2xl p-4 sm:p-6">
            <div class="space-y-3 sm:space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <h3 class="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base">{{
                    t('upload.uploadProgress') }}</h3>
                  <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                    {{ t('upload.currentFile') }}: {{ currentUploadingFile }}
                  </p>
                </div>
                <div class="text-left sm:text-right">
                  <div class="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {{ Math.round(overallProgress) }}%
                  </div>
                  <div class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {{ completedFiles }} / {{ selectedFiles.length }} {{ t('fileList.files') }}
                  </div>
                </div>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 dark:from-cyan-500 dark:to-cyan-700 rounded-full transition-all duration-300 ease-out transform"
                  :style="{ width: `${overallProgress}%` }">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
          <button v-if="!isUploading" @click="clearAllFiles"
            class="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-medium px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-slate-600 transition-all duration-150 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(148,163,184,0.2)] w-full sm:w-auto">
            <X class="w-4 h-4" />
            {{ t('upload.clearAll') }}
          </button>
          <div v-else class="hidden sm:block"></div>

          <button @click="uploadFiles" :disabled="isUploading"
            class="bg-cyan-300 dark:bg-cyan-600 hover:bg-cyan-400 dark:hover:bg-cyan-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold px-6 sm:px-8 py-3 rounded-2xl border-2 border-cyan-400 dark:border-cyan-500 disabled:border-slate-400 dark:disabled:border-slate-600 transition-all duration-150 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:hover:scale-100 cursor-pointer shadow-[3px_3px_0px_0px_rgba(6,182,212,0.2)] w-full sm:w-auto">
            <component :is="isUploading ? LoaderCircle : Upload"
              :class="{ 'animate-spin': isUploading, 'animate-bounce': !isUploading }" class="w-5 h-5" />
            <span class="truncate">{{ isUploading ? t('upload.uploading') : t('upload.uploadButton', {
              count: selectedFiles.length
            }) }}</span>
          </button>
        </div>
      </div>

      <!-- 上传结果 -->
      <div v-if="uploadResults.length > 0" class="space-y-3">
        <div v-for="(result, index) in uploadResults" :key="index"
          class="rounded-2xl p-3 sm:p-4 border-2 shadow-[2px_2px_0px_0px_rgba(148,163,184,0.1)]"
          :class="'error' in result ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-600/50' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600/50'">
          <div v-if="!('error' in result) && 'url' in result" class="flex items-start gap-3">
            <div
              class="w-5 h-5 sm:w-6 sm:h-6 bg-green-200 dark:bg-green-600/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle class="w-3 h-3 sm:w-4 sm:h-4 text-green-700 dark:text-green-300" />
            </div>
            <p class="font-medium text-green-800 dark:text-green-200 text-xs sm:text-sm">{{ `${t('upload.success')} -
              ${result.message}` }}</p>
          </div>
          <div v-else class="flex items-start gap-3">
            <div
              class="w-5 h-5 sm:w-6 sm:h-6 bg-red-200 dark:bg-red-600/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <XCircle class="w-3 h-3 sm:w-4 sm:h-4 text-red-700 dark:text-red-300" />
            </div>
            <div class="min-w-0">
              <p class="font-medium text-red-800 dark:text-red-200 text-xs sm:text-sm">{{ `${t('upload.error')} -
                ${result.error}` }}
              </p>
              <p v-if="result.details" class="text-red-700 dark:text-red-300 text-xs break-words">{{ result.details }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { hc } from 'hono/client';
import { Check, CheckCircle, File, LoaderCircle, Upload, X, XCircle } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AppType } from '../../api/index';

const { t } = useI18n();
const client = hc<AppType>('/');

const emit = defineEmits<{
  uploadComplete: [];
  showToast: [message: string];
}>();

// 文件上传相关状态
const fileInput = ref<HTMLInputElement>();
const selectedFiles = ref<File[]>([]);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadResults = ref<Array<any>>([]);

// 进度追踪状态
const fileProgresses = ref<Record<number, number>>({});
const fileStatuses = ref<Record<number, 'waiting' | 'uploading' | 'completed' | 'error'>>({});
const currentUploadingFile = ref('');
const completedFiles = ref(0);

// 计算总体进度
const overallProgress = computed(() => {
  if (selectedFiles.value.length === 0) return 0;
  const totalProgress = Object.values(fileProgresses.value).reduce((sum, progress) => sum + progress, 0);
  return totalProgress / selectedFiles.value.length;
});

// 获取文件图标
const getFileIcon = (index: number) => {
  const status = fileStatuses.value[index];
  if (status === 'uploading') return LoaderCircle;
  if (status === 'completed') return Check;
  if (status === 'error') return XCircle;
  return File;
};

// 获取上传状态文本
const getUploadStatusText = (index: number) => {
  const status = fileStatuses.value[index];
  switch (status) {
    case 'waiting': return t('upload.waiting');
    case 'uploading': return t('upload.uploading');
    case 'completed': return t('upload.completed');
    case 'error': return t('upload.error');
    default: return '';
  }
};

// 获取进度条样式
const getProgressBarClass = (index: number) => {
  const status = fileStatuses.value[index];
  switch (status) {
    case 'uploading': return 'bg-gradient-to-r from-cyan-400 to-cyan-600 dark:from-cyan-500 dark:to-cyan-700';
    case 'completed': return 'bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700';
    case 'error': return 'bg-gradient-to-r from-red-400 to-red-600 dark:from-red-500 dark:to-red-700';
    default: return 'bg-slate-400 dark:bg-slate-500';
  }
};

// 文件选择处理
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const newFiles = Array.from(target.files);
    processNewFiles(newFiles);
  }
  // 清理input的value，确保可以重复选择相同文件
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 移除单个文件
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  // 清理对应的进度状态
  delete fileProgresses.value[index];
  delete fileStatuses.value[index];
  // 如果没有文件了，也清理input
  if (selectedFiles.value.length === 0 && fileInput.value) {
    fileInput.value.value = '';
  }
};

// 清空所有文件
const clearAllFiles = () => {
  selectedFiles.value = [];
  uploadResults.value = [];
  fileProgresses.value = {};
  fileStatuses.value = {};
  completedFiles.value = 0;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 单个文件上传函数（支持进度追踪）
// 由于 Hono RPC 不支持上传进度，所以这里使用 XMLHttpRequest 来实现
const uploadSingleFile = (file: File, index: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    // 上传进度处理
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        fileProgresses.value[index] = progress;
        fileStatuses.value[index] = 'uploading';
      }
    });

    // 完成处理
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          fileProgresses.value[index] = 100;
          fileStatuses.value[index] = 'completed';
          completedFiles.value++;
          resolve(response);
        } catch (error) {
          fileStatuses.value[index] = 'error';
          reject(new Error('Invalid response format'));
        }
      } else {
        fileStatuses.value[index] = 'error';
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error || 'Upload failed'));
        } catch {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      }
    });

    // 错误处理
    xhr.addEventListener('error', () => {
      fileStatuses.value[index] = 'error';
      reject(new Error('Network error during upload'));
    });

    // 中断处理
    xhr.addEventListener('abort', () => {
      fileStatuses.value[index] = 'error';
      reject(new Error('Upload was aborted'));
    });

    xhr.open('POST', '/api/files');
    xhr.send(formData);
  });
};

// 批量上传文件
const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) {
    emit('showToast', t('errors.uploadFailed'));
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;
  uploadResults.value = [];
  completedFiles.value = 0;

  // 初始化所有文件状态
  selectedFiles.value.forEach((_, index) => {
    fileProgresses.value[index] = 0;
    fileStatuses.value[index] = 'waiting';
  });

  // 逐个上传文件
  for (let i = 0; i < selectedFiles.value.length; i++) {
    const file = selectedFiles.value[i];
    currentUploadingFile.value = file.name;

    try {
      const result = await uploadSingleFile(file, i);
      uploadResults.value.push(result);
    } catch (error: any) {
      console.error('Upload error:', error);
      uploadResults.value.push({
        error: t('upload.error'),
        details: error.message,
        filename: file.name
      });
    }

    uploadProgress.value = i + 1;
  }

  isUploading.value = false;
  currentUploadingFile.value = '';

  // 上传完成后通知父组件
  emit('uploadComplete');

  // 显示完成提示
  const successCount = uploadResults.value.filter(result => !('error' in result)).length;
  const totalCount = selectedFiles.value.length;

  if (successCount === totalCount) {
    emit('showToast', t('upload.success') + ` ${successCount} ${t('fileList.files')}`);
  } else {
    emit('showToast', `${t('upload.success')}: ${successCount}, ${t('upload.error')}: ${totalCount - successCount}`);
  }

  // 清空选择的文件
  selectedFiles.value = [];
  fileProgresses.value = {};
  fileStatuses.value = {};
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 工具函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 文件大小限制 (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

// 通用文件处理函数
const processNewFiles = (newFiles: File[]) => {
  // 过滤掉大于100MB的文件
  const validFiles: File[] = [];
  const oversizedFiles: File[] = [];

  newFiles.forEach(file => {
    if (file.size > MAX_FILE_SIZE) {
      oversizedFiles.push(file);
    } else {
      validFiles.push(file);
    }
  });

  // 显示过滤结果
  if (oversizedFiles.length > 0) {
    const oversizedNames = oversizedFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', ');
    emit('showToast', t('upload.filesFilteredBySize', {
      count: oversizedFiles.length,
      files: oversizedNames,
      maxSize: '100MB'
    }));
  }

  if (validFiles.length === 0) {
    return; // 没有有效文件，直接返回
  }

  // 如果已有文件，则添加新文件；否则直接替换
  if (selectedFiles.value.length > 0) {
    // 检查重复文件（基于文件名和大小）
    const existingFileKeys = new Set(
      selectedFiles.value.map(f => `${f.name}-${f.size}-${f.lastModified}`)
    );

    const uniqueNewFiles = validFiles.filter(f =>
      !existingFileKeys.has(`${f.name}-${f.size}-${f.lastModified}`)
    );

    const duplicateCount = validFiles.length - uniqueNewFiles.length;

    if (uniqueNewFiles.length > 0) {
      selectedFiles.value = [...selectedFiles.value, ...uniqueNewFiles];
      uploadResults.value = [];

      // 显示添加成功的提示
      if (duplicateCount > 0) {
        emit('showToast', t('upload.addedFilesWithDuplicates', {
          added: uniqueNewFiles.length,
          duplicates: duplicateCount
        }));
      } else {
        emit('showToast', t('upload.addedFiles', { count: uniqueNewFiles.length }));
      }
    } else if (duplicateCount > 0) {
      // 全部都是重复文件
      emit('showToast', t('upload.allDuplicateFiles'));
    }
  } else {
    selectedFiles.value = validFiles;
    uploadResults.value = [];
    // 重置进度状态
    fileProgresses.value = {};
    fileStatuses.value = {};
    completedFiles.value = 0;

    emit('showToast', t('upload.addedFiles', { count: validFiles.length }));
  }
};

// 拖拽相关状态
const isDragOver = ref(false);

const handleDragOver = () => {
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  const dataTransfer = event.dataTransfer;
  if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
    const newFiles = Array.from(dataTransfer.files);
    processNewFiles(newFiles);
  }
};
</script>