<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-slate-900/20 dark:bg-slate-900/40 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-200"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-150"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 px-6 pb-6 pt-6 text-left sm:my-8 sm:w-full sm:max-w-lg sm:p-8 shadow-[6px_6px_0px_0px_rgba(245,158,11,0.15)]">
              <div class="flex items-center justify-between mb-8">
                <DialogTitle as="h3"
                  class="text-2xl font-bold text-slate-800 dark:text-slate-100 relative inline-block">
                  {{ t('fileInfo.editTitle') }}
                  <div
                    class="absolute -bottom-1 left-0 right-0 h-1 bg-amber-300 dark:bg-amber-400/60 opacity-60 transform -rotate-0.5">
                  </div>
                </DialogTitle>
                <button @click="$emit('close')"
                  class="w-10 h-10 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300 rounded-xl border-2 border-slate-300 dark:border-slate-600 transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 hover:rotate-90 cursor-pointer">
                  <X class="w-6 h-6" />
                </button>
              </div>

              <form @submit.prevent="saveFileInfo" class="space-y-6">
                <div class="space-y-3">
                  <label class="block text-sm font-bold text-slate-800 dark:text-slate-200">{{
                    t('fileInfo.title')
                  }}</label>
                  <input v-model="editForm.title" type="text" :placeholder="t('fileInfo.titlePlaceholder')"
                    class="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 focus:scale-[1.02]" />
                </div>
                <div class="space-y-3">
                  <label class="block text-sm font-bold text-slate-800 dark:text-slate-200">{{
                    t('fileInfo.description') }}</label>
                  <textarea v-model="editForm.description" rows="4" :placeholder="t('fileInfo.descriptionPlaceholder')"
                    class="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none resize-none transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 focus:scale-[1.02]"></textarea>
                </div>
                <div class="flex gap-3 pt-4">
                  <button type="button" @click="$emit('close')"
                    class="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border-2 border-slate-300 dark:border-slate-600 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(148,163,184,0.2)]">
                    {{ t('common.cancel') }}
                  </button>
                  <button type="submit" :disabled="isSaving"
                    class="flex-1 px-4 py-3 bg-amber-300 dark:bg-amber-600 hover:bg-amber-400 dark:hover:bg-amber-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-amber-800 dark:text-amber-100 font-semibold rounded-xl border-2 border-amber-400 dark:border-amber-500 disabled:border-slate-400 dark:disabled:border-slate-600 transition-all duration-150 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:hover:scale-100 cursor-pointer shadow-[3px_3px_0px_0px_rgba(245,158,11,0.2)]">
                    <component :is="isSaving ? Loader2 : Save" :class="{ 'animate-spin': isSaving }" class="w-4 h-4" />
                    {{ isSaving ? t('common.loading') : t('common.save') }}
                  </button>
                </div>
              </form>
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
import { hc } from 'hono/client';
import { Loader2, Save, X } from 'lucide-vue-next';
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AppType } from '../../api/index';
import type { FileMetadata } from '../../common/services';

const { t } = useI18n();
const client = hc<AppType>('/');

const props = defineProps<{
  show: boolean;
  file: FileMetadata | null;
}>();

const emit = defineEmits<{
  close: [];
  updated: [file: FileMetadata];
  showToast: [message: string];
}>();

// 编辑表单
const editForm = reactive({
  title: '',
  description: ''
});

const isSaving = ref(false);

// 监听文件变化，更新表单
watch(() => props.file, (newFile) => {
  if (newFile) {
    editForm.title = newFile.title || '';
    editForm.description = newFile.description || '';
  }
}, { immediate: true });

// 保存文件信息
const saveFileInfo = async () => {
  if (!props.file) return;

  isSaving.value = true;
  try {
    const response = await client.api.files[':filename'].$put({
      param: {
        filename: props.file.filename
      },
      json: {
        title: editForm.title || undefined,
        description: editForm.description || undefined
      }
    });

    if (response.ok) {
      const updatedFile: FileMetadata = {
        ...props.file,
        title: editForm.title || undefined,
        description: editForm.description || undefined
      };

      emit('updated', updatedFile);
      emit('showToast', t('fileList.updateSuccess'));
      emit('close');
    } else {
      const errorData = await response.json();
      emit('showToast', `${t('errors.loadFailed')}: ${(errorData as any).error || t('errors.serverError')}`);
    }
  } catch (error) {
    console.error('Error updating file info:', error);
    emit('showToast', t('errors.networkError'));
  } finally {
    isSaving.value = false;
  }
};
</script>