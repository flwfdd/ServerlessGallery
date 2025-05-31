<template>
  <section>
    <div
      class="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl overflow-hidden transform hover:scale-[1.01] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(6,182,212,0.12)]">

      <!-- 标题栏 -->
      <div class="border-b-2 border-slate-200 dark:border-slate-600 p-8">
        <div class="flex items-center justify-between">
          <div class="text-2xl font-bold text-slate-800 dark:text-slate-100 relative inline-block">
            <div
              class="absolute bottom-0 left-0 right-0 h-2 bg-cyan-300 dark:bg-cyan-400/60 opacity-60 transform -rotate-1">
            </div>
            <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100 relative">{{
              t('fileList.title') }}
            </h2>
          </div>

          <button @click="loadFiles" :disabled="isLoadingFiles"
            class="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:bg-slate-50 dark:disabled:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 disabled:border-slate-100 dark:disabled:border-slate-800 transition-all duration-150 flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(148,163,184,0.1)]">
            <component :is="isLoadingFiles ? Loader2 : RotateCcw" :class="{ 'animate-spin': isLoadingFiles }"
              class="w-4 h-4" />
            {{ t('common.refresh') }}
          </button>
        </div>

        <!-- 筛选区域 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- 搜索框 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{{
              t('fileList.search') }}</label>
            <div class="relative group focus-within:scale-[1.02] transition-all duration-150">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors duration-200" />
              <input v-model="searchQuery" @input="debouncedSearch" type="text"
                :placeholder="t('fileList.searchPlaceholder')"
                class="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 shadow-[1px_1px_0px_0px_rgba(148,163,184,0.1)]" />
            </div>
          </div>

          <!-- 文件类型筛选 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{{
              t('fileList.fileType') }}</label>
            <Listbox v-model="selectedMimeType" @update:modelValue="loadFiles">
              <div class="relative">
                <ListboxButton
                  class="relative w-full cursor-pointer rounded-xl bg-white dark:bg-slate-700 py-3 pl-4 pr-10 text-left border-2 border-slate-200 dark:border-slate-600 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 focus:scale-[1.02] shadow-[1px_1px_0px_0px_rgba(148,163,184,0.1)]">
                  <span class="block truncate text-slate-800 dark:text-slate-200">{{
                    fileTypeOptions.find(option => option.value === selectedMimeType)?.label ||
                    t('fileList.allTypes')}}</span>
                  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronsUpDown class="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </span>
                </ListboxButton>

                <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                  leave-to-class="opacity-0">
                  <ListboxOptions
                    class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-base border-2 border-slate-200 dark:border-slate-600 shadow-lg focus:outline-none sm:text-sm">
                    <ListboxOption v-slot="{ active, selected }" v-for="option in fileTypeOptions" :key="option.value"
                      :value="option.value" as="template">
                      <li :class="[
                        active ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200' : 'text-slate-900 dark:text-slate-100',
                        'relative cursor-pointer select-none py-2 pl-4 pr-4'
                      ]">
                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                          {{ option.label }}
                        </span>
                        <span v-if="selected"
                          class="absolute inset-y-0 right-0 flex items-center pr-3 text-cyan-600 dark:text-cyan-400">
                          <Check class="h-4 w-4" aria-hidden="true" />
                        </span>
                      </li>
                    </ListboxOption>
                  </ListboxOptions>
                </transition>
              </div>
            </Listbox>
          </div>

          <!-- 排序方式 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{{
              t('fileList.sortBy') }}</label>
            <Listbox v-model="sortBy" @update:modelValue="loadFiles">
              <div class="relative">
                <ListboxButton
                  class="relative w-full cursor-pointer rounded-xl bg-white dark:bg-slate-700 py-3 pl-4 pr-10 text-left border-2 border-slate-200 dark:border-slate-600 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 focus:scale-[1.02] shadow-[1px_1px_0px_0px_rgba(148,163,184,0.1)]">
                  <span class="block truncate text-slate-800 dark:text-slate-200">{{
                    sortByOptions.find(option => option.value === sortBy)?.label}}</span>
                  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronsUpDown class="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </span>
                </ListboxButton>

                <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                  leave-to-class="opacity-0">
                  <ListboxOptions
                    class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-base border-2 border-slate-200 dark:border-slate-600 shadow-lg focus:outline-none sm:text-sm">
                    <ListboxOption v-slot="{ active, selected }" v-for="option in sortByOptions" :key="option.value"
                      :value="option.value" as="template">
                      <li :class="[
                        active ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200' : 'text-slate-900 dark:text-slate-100',
                        'relative cursor-pointer select-none py-2 pl-4 pr-4'
                      ]">
                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                          {{ option.label }}
                        </span>
                        <span v-if="selected"
                          class="absolute inset-y-0 right-0 flex items-center pr-3 text-cyan-600 dark:text-cyan-400">
                          <Check class="h-4 w-4" aria-hidden="true" />
                        </span>
                      </li>
                    </ListboxOption>
                  </ListboxOptions>
                </transition>
              </div>
            </Listbox>
          </div>

          <!-- 排序顺序 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{{
              t('fileList.sortOrder') }}</label>
            <Listbox v-model="sortOrder" @update:modelValue="loadFiles">
              <div class="relative">
                <ListboxButton
                  class="relative w-full cursor-pointer rounded-xl bg-white dark:bg-slate-700 py-3 pl-4 pr-10 text-left border-2 border-slate-200 dark:border-slate-600 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 focus:scale-[1.02] shadow-[1px_1px_0px_0px_rgba(148,163,184,0.1)]">
                  <span class="block truncate text-slate-800 dark:text-slate-200">{{
                    sortOrderOptions.find(option => option.value === sortOrder)?.label}}</span>
                  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronsUpDown class="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </span>
                </ListboxButton>

                <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                  leave-to-class="opacity-0">
                  <ListboxOptions
                    class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-base border-2 border-slate-200 dark:border-slate-600 shadow-lg focus:outline-none sm:text-sm">
                    <ListboxOption v-slot="{ active, selected }" v-for="option in sortOrderOptions" :key="option.value"
                      :value="option.value" as="template">
                      <li :class="[
                        active ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200' : 'text-slate-900 dark:text-slate-100',
                        'relative cursor-pointer select-none py-2 pl-4 pr-4'
                      ]">
                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                          {{ option.label }}
                        </span>
                        <span v-if="selected"
                          class="absolute inset-y-0 right-0 flex items-center pr-3 text-cyan-600 dark:text-cyan-400">
                          <Check class="h-4 w-4" aria-hidden="true" />
                        </span>
                      </li>
                    </ListboxOption>
                  </ListboxOptions>
                </transition>
              </div>
            </Listbox>
          </div>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="p-8">
        <div v-if="isLoadingFiles" class="text-center py-20">
          <div
            class="inline-flex items-center justify-center w-16 h-16 bg-cyan-200 dark:bg-cyan-600/50 rounded-2xl mb-4 transform rotate-3">
            <Loader2 class="w-8 h-8 animate-spin text-cyan-700 dark:text-cyan-300" />
          </div>
          <p class="text-lg font-medium text-slate-800 dark:text-slate-200">{{ t('common.loading') }}</p>
        </div>

        <div v-else-if="fileList.length === 0" class="text-center py-20">
          <div
            class="inline-flex items-center justify-center w-20 h-20 bg-slate-200 dark:bg-slate-600 rounded-2xl mb-6 transform -rotate-3">
            <FolderOpen class="w-10 h-10 text-slate-600 dark:text-slate-400" />
          </div>
          <p class="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">{{ searchQuery ?
            t('fileList.noResults') : t('fileList.noFiles') }}</p>
          <p class="text-slate-600 dark:text-slate-400">{{ searchQuery ? t('fileList.noResultsDesc') :
            t('fileList.noFilesDesc') }}</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="(file, index) in fileList" :key="file.filename"
            class="bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-150 hover:scale-[1.01] group shadow-[2px_2px_0px_0px_rgba(148,163,184,0.15)]">
            <div class="flex items-center gap-6">
              <!-- 文件预览 -->
              <div class="flex-shrink-0">
                <div class="relative">
                  <img v-if="file.mime_type.startsWith('image/')" :src="`/files/${file.filename}?level=mid`"
                    :alt="file.title || file.filename"
                    class="w-16 h-16 object-cover rounded-xl border-2 border-slate-200 dark:border-slate-500 group-hover:-rotate-8 group-hover:scale-105 transition-transform duration-200" />
                  <FileIcon v-else :mime-type="file.mime_type" :filename="file.filename" />
                </div>
              </div>

              <!-- 文件信息 -->
              <div class="flex-1 min-w-0">
                <h3
                  class="font-bold text-slate-800 dark:text-slate-200 truncate text-lg group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-200">
                  {{ file.title || file.filename }}
                </h3>
                <p class="text-slate-500 dark:text-slate-500 truncate text-sm">
                  {{ file.description || '&nbsp;' }}
                </p>
                <p class="text-slate-600 dark:text-slate-400">
                  {{ formatFileSize(file.size) }} • {{ formatDate(file.uploaded_at) }}
                </p>
              </div>

              <!-- 操作按钮 -->
              <div class="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                <button @click="$emit('openDetails', file)"
                  class="w-10 h-10 bg-blue-200 dark:bg-blue-600/50 hover:bg-blue-300 dark:hover:bg-blue-500 text-blue-700 dark:text-blue-300 rounded-xl border-2 border-blue-300 dark:border-blue-500 transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer hover:rotate-3 shadow-[1px_1px_0px_0px_rgba(59,130,246,0.2)]">
                  <Eye class="w-5 h-5" />
                </button>
                <button @click="$emit('openEdit', file)"
                  class="w-10 h-10 bg-amber-200 dark:bg-amber-600/50 hover:bg-amber-300 dark:hover:bg-amber-500 text-amber-700 dark:text-amber-300 rounded-xl border-2 border-amber-300 dark:border-amber-500 transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer hover:-rotate-3 shadow-[1px_1px_0px_0px_rgba(245,158,11,0.2)]">
                  <Edit class="w-5 h-5" />
                </button>
                <button @click="$emit('confirmDelete', file.filename)"
                  class="w-10 h-10 bg-red-200 dark:bg-red-600/50 hover:bg-red-300 dark:hover:bg-red-500 text-red-700 dark:text-red-300 rounded-xl border-2 border-red-300 dark:border-red-500 transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer hover:rotate-3 shadow-[1px_1px_0px_0px_rgba(239,68,68,0.2)]">
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="fileList.length > 0"
          class="mt-8 flex items-center justify-between pt-8 border-t-2 border-dashed border-slate-200 dark:border-slate-600">
          <div class="text-slate-700 dark:text-slate-300 font-medium">
            {{ t('fileList.showing') }} {{ currentOffset + 1 }}-{{ Math.min(currentOffset + currentLimit,
              totalFiles || fileList.length) }}
            {{ totalFiles ? ` ${t('common.all')} ${totalFiles} ${t('fileList.files')}` : '' }}
          </div>
          <div class="flex gap-3">
            <button @click="previousPage" :disabled="currentOffset === 0"
              class="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border-2 border-slate-300 dark:border-slate-600 disabled:border-slate-200 dark:disabled:border-slate-700 transition-all duration-150 hover:scale-105 active:scale-95 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(148,163,184,0.2)]">
              {{ t('fileList.previous') }}
            </button>
            <button @click="nextPage" :disabled="fileList.length < currentLimit"
              class="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border-2 border-slate-300 dark:border-slate-600 disabled:border-slate-200 dark:disabled:border-slate-700 transition-all duration-150 hover:scale-105 active:scale-95 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(148,163,184,0.2)]">
              {{ t('fileList.next') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from '@headlessui/vue';
import { hc } from 'hono/client';
import {
  Check,
  ChevronsUpDown,
  Edit,
  Eye,
  FolderOpen,
  Loader2,
  RotateCcw,
  Search,
  Trash2
} from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AppType } from '../../api/index';
import type { FileMetadata, ListFilesOptions } from '../../common/services';
import FileIcon from './FileIcon.vue';

const { t } = useI18n();
const client = hc<AppType>('/');

const emit = defineEmits<{
  openDetails: [file: FileMetadata];
  openEdit: [file: FileMetadata];
  confirmDelete: [filename: string];
}>();

// 文件列表相关状态
const fileList = ref<FileMetadata[]>([]);
const isLoadingFiles = ref(false);
const searchQuery = ref('');
const selectedMimeType = ref('');
const sortBy = ref<ListFilesOptions['sortBy']>('uploaded_at');
const sortOrder = ref<ListFilesOptions['sort']>('desc');
const currentOffset = ref(0);
const currentLimit = ref(20);
const totalFiles = ref<number | null>(null);

// 筛选选项
const fileTypeOptions = computed(() => [
  { value: '', label: t('fileList.allTypes') },
  { value: 'image/', label: t('fileList.images') },
  { value: 'video/', label: t('fileList.videoFiles') },
  { value: 'audio/', label: t('fileList.audioFiles') },
  { value: 'text/', label: t('fileList.textFiles') },
  { value: 'application/pdf', label: t('fileList.pdfFiles') },
  { value: 'application/zip', label: t('fileList.archiveFiles') },
  { value: 'application/vnd.openxmlformats-officedocument', label: t('fileList.officeFiles') }
]);

const sortByOptions = computed(() => [
  { value: 'uploaded_at', label: t('fileList.uploadTime') },
  { value: 'size', label: t('fileList.fileSize') }
]);

const sortOrderOptions = computed(() => [
  { value: 'desc', label: t('fileList.descending') },
  { value: 'asc', label: t('fileList.ascending') }
]);

// 加载文件列表
const loadFiles = async () => {
  isLoadingFiles.value = true;
  try {
    const options: Record<string, string> = {
      limit: currentLimit.value.toString(),
      offset: currentOffset.value.toString(),
      sortBy: sortBy.value || 'uploaded_at',
      sort: sortOrder.value || 'desc',
    };

    if (selectedMimeType.value) {
      options.mime_type = selectedMimeType.value;
    }

    if (searchQuery.value.trim()) {
      options.search = searchQuery.value.trim();
    }

    const response = await client.api.files.$get({ query: options });
    const data = await response.json();

    if (response.ok) {
      fileList.value = (data as any).files || [];
      totalFiles.value = (data as any).count || null;
    } else {
      console.error('Failed to load files:', data);
      fileList.value = [];
    }
  } catch (error) {
    console.error('Error loading files:', error);
    fileList.value = [];
  } finally {
    isLoadingFiles.value = false;
  }
};

// 分页
const nextPage = () => {
  currentOffset.value += currentLimit.value;
  loadFiles();
};

const previousPage = () => {
  if (currentOffset.value >= currentLimit.value) {
    currentOffset.value -= currentLimit.value;
  } else {
    currentOffset.value = 0;
  }
  loadFiles();
};

// 搜索防抖
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    currentOffset.value = 0;
    loadFiles();
  }, 500);
};

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

// 公开方法供父组件调用
defineExpose({
  loadFiles,
  refreshAfterUpdate: (updatedFile: FileMetadata) => {
    const fileIndex = fileList.value.findIndex(f => f.filename === updatedFile.filename);
    if (fileIndex !== -1) {
      fileList.value[fileIndex] = updatedFile;
    }
  },
  refreshAfterDelete: (filename: string) => {
    fileList.value = fileList.value.filter(f => f.filename !== filename);
  }
});

// 初始化
onMounted(() => {
  loadFiles();
});
</script>