import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

// 从localStorage获取用户偏好语言，默认为中文
const getStoredLanguage = (): string => {
    const stored = localStorage.getItem('preferred-language')
    if (stored && ['zh', 'en'].includes(stored)) {
        return stored
    }
    // 检查浏览器语言偏好
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('zh')) {
        return 'zh'
    }
    return 'zh' // 默认中文
}

export const i18n = createI18n({
    legacy: false, // 使用 Composition API 模式
    locale: getStoredLanguage(),
    fallbackLocale: 'zh',
    messages: {
        zh,
        en
    }
})

export const supportedLocales = [
    { code: 'zh', name: '中文', nativeName: '中文' },
    { code: 'en', name: 'English', nativeName: 'English' }
]

// 切换语言的工具函数
export const switchLanguage = (locale: string) => {
    if (supportedLocales.some(l => l.code === locale)) {
        i18n.global.locale.value = locale as any
        localStorage.setItem('preferred-language', locale)
        document.documentElement.lang = locale
    }
}

// 获取当前语言
export const getCurrentLanguage = () => {
    return i18n.global.locale.value
} 