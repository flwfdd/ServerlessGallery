<template>
  <header class="mb-12">
    <div
      class="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-8 relative transform hover:scale-[1.02] transition-all duration-200 group shadow-[3px_3px_0px_0px_rgba(6,182,212,0.15)]">
      <div class="flex items-center justify-between">
        <div class="relative">
          <div
            class="absolute bottom-1 left-0 right-0 h-4 bg-cyan-300 dark:bg-cyan-400/60 opacity-60 transform -rotate-1 group-hover:rotate-1 transition-transform duration-200">
          </div>
          <h1 class="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 relative">{{ t('header.title')
          }}
          </h1>
        </div>

        <!-- 主题和语言切换 -->
        <div class="flex items-center gap-4">
          <!-- Github -->
          <a href="https://github.com/flwfdd/ZenGallery" target="_blank"
            class="w-10 h-10 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(148,163,184,0.2)] transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-cyan-100 dark:hover:bg-cyan-600 hover:text-slate-700 dark:hover:text-slate-300">
            <Github class="w-4 h-4" />
          </a>

          <!-- 语言切换器 -->
          <LanguageSwitcher />

          <!-- 主题切换 -->
          <div
            class="bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-1 shadow-[2px_2px_0px_0px_rgba(148,163,184,0.2)]">
            <div class="flex gap-1">
              <button @click="$emit('setTheme', 'light')" :title="t('theme.light')"
                :class="theme === 'light' ? 'bg-yellow-200 text-slate-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                class="w-10 h-10 rounded-xl transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer">
                <Sun class="w-4 h-4 transition-transform hover:rotate-12" />
              </button>
              <button @click="$emit('setTheme', 'dark')" :title="t('theme.dark')"
                :class="theme === 'dark' ? 'bg-cyan-700 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                class="w-10 h-10 rounded-xl transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer">
                <Moon class="w-4 h-4 transition-transform hover:-rotate-12" />
              </button>
              <button @click="$emit('setTheme', 'system')" :title="t('theme.system')"
                :class="theme === 'system' ? 'bg-yellow-200 dark:bg-cyan-700 text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                class="w-10 h-10 rounded-xl transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer">
                <SunMoon class="w-4 h-4 transition-transform hover:scale-110" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Github, Moon, Sun, SunMoon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from './LanguageSwitcher.vue';

const { t } = useI18n();

defineProps<{
  theme: 'light' | 'dark' | 'system';
}>();

defineEmits<{
  setTheme: [theme: 'light' | 'dark' | 'system'];
}>();
</script>