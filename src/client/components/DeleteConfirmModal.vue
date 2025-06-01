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
              class="relative transform overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6 text-left sm:my-8 w-full sm:max-w-md lg:p-8 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.15)]">
              <div class="text-center">
                <div
                  class="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-red-200 dark:bg-red-600/50 border-2 border-red-300 dark:border-red-500 mb-4 sm:mb-6 animate-bounce">
                  <AlertTriangle class="h-6 w-6 sm:h-8 sm:w-8 text-red-700 dark:text-red-300" />
                </div>
                <div>
                  <DialogTitle as="h3"
                    class="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-2 sm:mb-3">
                    {{ t('deleteModal.title') }}
                  </DialogTitle>
                  <div>
                    <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">
                      {{ t('deleteModal.message', { filename }) }}
                    </p>
                    <p class="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
                      {{ t('deleteModal.warning') }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button @click="$emit('close')"
                  class="w-full sm:flex-1 rounded-lg sm:rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base">
                  {{ t('common.cancel') }}
                </button>
                <button @click="deleteFile" :disabled="isDeleting"
                  class="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl bg-red-300 dark:bg-red-600/70 hover:bg-red-400 dark:hover:bg-red-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 px-4 py-3 font-semibold text-red-800 dark:text-red-100 disabled:text-slate-600 dark:disabled:text-slate-400 border-2 border-red-400 dark:border-red-500 disabled:border-slate-400 dark:disabled:border-slate-600 transition-all duration-150 hover:scale-105 active:scale-95 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed text-sm sm:text-base">
                  <component :is="isDeleting ? Loader2 : Trash2" :class="{ 'animate-spin': isDeleting }"
                    class="w-4 h-4 sm:w-5 sm:h-5" />
                  {{ isDeleting ? t('deleteModal.deleting') : t('deleteModal.confirm') }}
                </button>
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
import { hc } from 'hono/client';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-vue-next';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AppType } from '../../api/index';

const { t } = useI18n();
const client = hc<AppType>('/');

const props = defineProps<{
  show: boolean;
  filename: string;
}>();

const emit = defineEmits<{
  close: [];
  deleted: [];
  showToast: [message: string];
}>();

const isDeleting = ref(false);

// 删除文件
const deleteFile = async () => {
  if (!props.filename) return;

  isDeleting.value = true;
  try {
    const response = await client.api.files[':filename'].$delete({
      param: {
        filename: props.filename
      }
    });

    if (response.ok) {
      emit('deleted');
      emit('showToast', t('fileList.deleteSuccess'));
      emit('close');
    } else {
      const errorData = await response.json();
      emit('showToast', `${t('errors.loadFailed')}: ${(errorData as any).error || t('errors.serverError')}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    emit('showToast', t('errors.networkError'));
  } finally {
    isDeleting.value = false;
  }
};
</script>