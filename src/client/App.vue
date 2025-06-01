<template>
  <div class="min-h-screen bg-amber-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
    <!-- 纸张纹理背景 -->
    <div class="fixed inset-0 opacity-50"
      style="background-image: radial-gradient(circle at 2px 2px, rgba(156,163,175,0.3) 2px, transparent 0); background-size: 20px 20px;">
    </div>

    <div class="relative max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <!-- 应用头部 -->
      <AppHeader :theme="theme" @setTheme="setTheme" />

      <!-- 文件上传区域 -->
      <FileUpload @uploadComplete="handleUploadComplete" @showToast="showToastMessage" />

      <!-- 文件列表区域 -->
      <FileList ref="fileListRef" @openDetails="openDetailsModal" @openEdit="openEditModal"
        @confirmDelete="confirmDeleteFile" />
    </div>

    <!-- 文件详情模态框 -->
    <FileDetailsModal :show="showDetailsModal" :file="selectedFileForDetails" @close="closeDetailsModal"
      @showToast="showToastMessage" />

    <!-- 编辑模态框 -->
    <FileEditModal :show="showEditModal" :file="selectedFileForEdit" @close="closeEditModal"
      @updated="handleFileUpdated" @showToast="showToastMessage" />

    <!-- 删除确认模态框 -->
    <DeleteConfirmModal :show="showDeleteModal" :filename="fileToDelete" @close="closeDeleteModal"
      @deleted="handleFileDeleted" @showToast="showToastMessage" />

    <!-- 消息提示 -->
    <ToastNotification :show="showToast" :message="toastMessage" @hide="hideToast" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FileMetadata } from '../common/services';
import AppHeader from './components/AppHeader.vue';
import DeleteConfirmModal from './components/DeleteConfirmModal.vue';
import FileDetailsModal from './components/FileDetailsModal.vue';
import FileEditModal from './components/FileEditModal.vue';
import FileList from './components/FileList.vue';
import FileUpload from './components/FileUpload.vue';
import ToastNotification from './components/ToastNotification.vue';

const { t } = useI18n();

// Theme management
const theme = ref<'light' | 'dark' | 'system'>('system');

const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
  theme.value = newTheme;
  localStorage.setItem('theme', newTheme);
  applyTheme();
};

const applyTheme = () => {
  document.documentElement.classList.remove('dark');
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme.value === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }
};

const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
  if (savedTheme) {
    theme.value = savedTheme;
  }
  applyTheme();
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (theme.value === 'system') {
      applyTheme();
    }
  });
};

// 文件列表引用
const fileListRef = ref<InstanceType<typeof FileList>>();

// 模态框状态
const showDetailsModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedFileForDetails = ref<FileMetadata | null>(null);
const selectedFileForEdit = ref<FileMetadata | null>(null);
const fileToDelete = ref<string>('');

// 提示消息
const showToast = ref(false);
const toastMessage = ref('');

// 模态框操作
const openDetailsModal = (file: FileMetadata) => {
  selectedFileForDetails.value = file;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedFileForDetails.value = null;
};

const openEditModal = (file: FileMetadata) => {
  selectedFileForEdit.value = file;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedFileForEdit.value = null;
};

const confirmDeleteFile = (filename: string) => {
  fileToDelete.value = filename;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  fileToDelete.value = '';
};

// 处理文件更新后的回调
const handleFileUpdated = (updatedFile: FileMetadata) => {
  // 更新详情模态框中的文件信息
  if (selectedFileForDetails.value?.filename === updatedFile.filename) {
    selectedFileForDetails.value = updatedFile;
  }

  // 更新文件列表
  if (fileListRef.value) {
    fileListRef.value.refreshAfterUpdate(updatedFile);
  }
};

// 处理文件删除后的回调
const handleFileDeleted = () => {
  // 更新文件列表
  if (fileListRef.value) {
    fileListRef.value.refreshAfterDelete(fileToDelete.value);
  }
};

// 处理上传完成
const handleUploadComplete = () => {
  if (fileListRef.value) {
    fileListRef.value.loadFiles();
  }
};

// Toast 消息管理
const showToastMessage = (message: string) => {
  toastMessage.value = message;
  showToast.value = true;
};

const hideToast = () => {
  showToast.value = false;
};

// 初始化
onMounted(() => {
  initializeTheme();
  watch(theme, applyTheme);
});
</script>