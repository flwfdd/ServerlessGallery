<template>
  <TransitionRoot as="template" :show="show">
    <div class="fixed bottom-6 right-6 z-[100]">
      <TransitionChild as="template" enter="transform ease-out duration-300 transition"
        enter-from="translate-y-10 opacity-0 scale-90" enter-to="translate-y-0 opacity-100 scale-100"
        leave="transform ease-in duration-200 transition" leave-from="opacity-100 scale-100"
        leave-to="opacity-0 scale-95 translate-y-4">
        <div
          class="bg-white dark:bg-slate-800 border-2 border-cyan-300 dark:border-cyan-500 rounded-2xl px-6 py-4 hover:scale-105 transition-transform duration-150 shadow-[4px_4px_0px_0px_rgba(6,182,212,0.3)]">
          <div class="flex items-center gap-4">
            <div
              class="w-8 h-8 bg-cyan-200 dark:bg-cyan-600/50 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle class="w-5 h-5 text-cyan-700 dark:text-cyan-300" />
            </div>
            <p class="font-semibold text-slate-800 dark:text-slate-200">{{ message }}</p>
          </div>
        </div>
      </TransitionChild>
    </div>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionChild, TransitionRoot } from '@headlessui/vue';
import { CheckCircle } from 'lucide-vue-next';
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  message: string;
}>();

const toastTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const emit = defineEmits<{
  hide: [];
}>();

watch(() => props.show, (newShow) => {
  if (newShow) {
    if (toastTimeout.value) {
      clearTimeout(toastTimeout.value);
    }
    toastTimeout.value = setTimeout(() => {
      emit('hide');
      toastTimeout.value = null;
    }, 3000);
  }
});
</script>