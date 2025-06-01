<template>
  <Menu as="div" class="relative" v-slot="{ open }">
    <!-- 当前语言显示按钮 -->
    <MenuButton
      class="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(148,163,184,0.2)]">
      <Globe class="w-4 h-4" />
      <span class="text-xs sm:text-sm font-medium hidden sm:inline">{{ currentLanguage.nativeName }}</span>
      <span class="text-xs font-medium sm:hidden">{{ currentLanguage.code.toUpperCase() }}</span>
      <ChevronDown :class="{ 'rotate-180': open }" class="w-3 h-3 transition-transform duration-200" />
    </MenuButton>

    <!-- 语言选择下拉菜单 -->
    <transition enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-[-10px]" enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150" leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-[-10px]">
      <MenuItems
        class="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl shadow-lg min-w-[120px] sm:min-w-[140px] z-50 overflow-hidden focus:outline-none">
        <div class="py-1">
          <MenuItem v-for="locale in supportedLocales" :key="locale.code" v-slot="{ active, close }">
          <button @click="switchToLanguage(locale.code, close)" :class="[
            'w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm transition-colors duration-150 flex items-center gap-2',
            locale.code === getCurrentLanguage()
              ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 font-medium'
              : active
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                : 'text-slate-700 dark:text-slate-300'
          ]">
            <span>{{ locale.nativeName }}</span>
            <CheckCircle v-if="locale.code === getCurrentLanguage()"
              class="w-3 h-3 ml-auto text-cyan-600 dark:text-cyan-400" />
          </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { CheckCircle, ChevronDown, Globe } from 'lucide-vue-next'
import { computed } from 'vue'
import { getCurrentLanguage, supportedLocales, switchLanguage } from '../../i18n'

const currentLanguage = computed(() => {
  return supportedLocales.find(l => l.code === getCurrentLanguage()) || supportedLocales[0]
})

const switchToLanguage = (langCode: string, close: () => void) => {
  switchLanguage(langCode)
  close()
}
</script>