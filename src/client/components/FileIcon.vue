<template>
  <div :class="[
    'w-16 h-16 rounded-xl border-2 flex items-center justify-center transform group-hover:-rotate-8 group-hover:scale-105 transition-transform duration-200',
    iconConfig.bgClass,
    iconConfig.borderClass
  ]">
    <component :is="iconConfig.icon" :class="[iconConfig.iconClass, 'w-8 h-8']" />
  </div>
</template>

<script setup lang="ts">
import {
  Archive,
  AudioLines,
  File,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FileVideo
} from 'lucide-vue-next';
import { computed } from 'vue';

interface Props {
  mimeType: string
  filename?: string
}

const props = withDefaults(defineProps<Props>(), {
  filename: ''
})

const iconConfig = computed(() => {
  const mimeType = props.mimeType.toLowerCase()
  const extension = props.filename.toLowerCase().split('.').pop() || ''

  // 图片文件
  if (mimeType.startsWith('image/')) {
    return {
      icon: FileImage,
      bgClass: 'bg-green-200 dark:bg-green-600/50',
      borderClass: 'border-green-300 dark:border-green-500',
      iconClass: 'text-green-700 dark:text-green-300'
    }
  }

  // 视频文件
  if (mimeType.startsWith('video/')) {
    return {
      icon: FileVideo,
      bgClass: 'bg-purple-200 dark:bg-purple-600/50',
      borderClass: 'border-purple-300 dark:border-purple-500',
      iconClass: 'text-purple-700 dark:text-purple-300'
    }
  }

  // 音频文件
  if (mimeType.startsWith('audio/')) {
    return {
      icon: AudioLines,
      bgClass: 'bg-indigo-200 dark:bg-indigo-600/50',
      borderClass: 'border-indigo-300 dark:border-indigo-500',
      iconClass: 'text-indigo-700 dark:text-indigo-300'
    }
  }

  // PDF文档
  if (mimeType === 'application/pdf') {
    return {
      icon: FileType,
      bgClass: 'bg-red-200 dark:bg-red-600/50',
      borderClass: 'border-red-300 dark:border-red-500',
      iconClass: 'text-red-700 dark:text-red-300'
    }
  }

  // 文本文件
  if (mimeType.startsWith('text/') ||
    ['txt', 'md', 'markdown', 'json', 'xml', 'yaml', 'yml'].includes(extension)) {
    return {
      icon: FileText,
      bgClass: 'bg-blue-200 dark:bg-blue-600/50',
      borderClass: 'border-blue-300 dark:border-blue-500',
      iconClass: 'text-blue-700 dark:text-blue-300'
    }
  }

  // 代码文件
  if (['js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'html', 'css', 'scss', 'less'].includes(extension) ||
    mimeType.includes('javascript') || mimeType.includes('typescript')) {
    return {
      icon: FileCode,
      bgClass: 'bg-emerald-200 dark:bg-emerald-600/50',
      borderClass: 'border-emerald-300 dark:border-emerald-500',
      iconClass: 'text-emerald-700 dark:text-emerald-300'
    }
  }

  // 压缩文件
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension) ||
    mimeType.includes('zip') || mimeType.includes('compressed')) {
    return {
      icon: Archive,
      bgClass: 'bg-orange-200 dark:bg-orange-600/50',
      borderClass: 'border-orange-300 dark:border-orange-500',
      iconClass: 'text-orange-700 dark:text-orange-300'
    }
  }

  // Office文档
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'odt', 'ods', 'odp'].includes(extension) ||
    mimeType.includes('officedocument') || mimeType.includes('opendocument')) {
    return {
      icon: FileSpreadsheet,
      bgClass: 'bg-cyan-200 dark:bg-cyan-600/50',
      borderClass: 'border-cyan-300 dark:border-cyan-500',
      iconClass: 'text-cyan-700 dark:text-cyan-300'
    }
  }

  // 默认文件
  return {
    icon: File,
    bgClass: 'bg-slate-200 dark:bg-slate-600/50',
    borderClass: 'border-slate-300 dark:border-slate-500',
    iconClass: 'text-slate-700 dark:text-slate-300'
  }
})
</script>