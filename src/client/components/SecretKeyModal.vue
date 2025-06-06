<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div
            class="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-600 p-6 w-full max-w-md transform transition-all duration-200 scale-100">
            <div class="text-center mb-6">
                <div
                    class="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-2xl mb-4">
                    <Lock class="w-8 h-8 text-amber-600 dark:text-amber-400 animate-bounce" />
                </div>
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {{ t('auth.unauthorized') }}
                </h3>
            </div>

            <div class="space-y-4">
                <div>
                    <input ref="inputRef" v-model="secretKey" type="password" :placeholder="t('auth.enterSecretKey')"
                        class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:border-amber-300 dark:focus:border-amber-500 focus:outline-none transition-all duration-150"
                        @keyup.enter="handleConfirm" />
                </div>

                <div v-if="errorMessage" class="text-red-600 dark:text-red-400 text-sm text-center">
                    {{ errorMessage }}
                </div>

                <button @click="handleConfirm" :disabled="!secretKey.trim() || isValidating"
                    class="w-full px-4 py-3 bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 disabled:bg-amber-300 dark:disabled:bg-amber-800 text-white font-semibold rounded-xl border-2 border-amber-600 dark:border-amber-700 disabled:border-amber-400 dark:disabled:border-amber-800 transition-all duration-150 hover:scale-105 active:scale-95 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <Loader v-if="isValidating" class="w-4 h-4 animate-spin" />
                    {{ t('common.confirm') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Loader, Lock } from 'lucide-vue-next';
import { nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
    show: boolean;
}>();

const emit = defineEmits<{
    confirm: [secretKey: string];
    cancel: [];
}>();

const secretKey = ref('');
const errorMessage = ref('');
const isValidating = ref(false);
const inputRef = ref<HTMLInputElement>();

// 当模态框显示时聚焦输入框
watch(() => props.show, async (show) => {
    if (show) {
        secretKey.value = '';
        errorMessage.value = '';
        isValidating.value = false;
        await nextTick();
        inputRef.value?.focus();
    }
});

const handleConfirm = () => {
    if (!secretKey.value.trim()) return;

    isValidating.value = true;
    errorMessage.value = '';

    // 延迟一下以显示加载状态
    setTimeout(() => {
        emit('confirm', secretKey.value.trim());
        isValidating.value = false;
    }, 200);
};

const handleCancel = () => {
    emit('cancel');
};

const showError = (message: string) => {
    errorMessage.value = message;
    isValidating.value = false;
};

defineExpose({ showError });
</script>