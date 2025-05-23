<template>
  <div class="min-h-screen bg-amber-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
    <!-- 纸张纹理背景 -->
    <div class="fixed inset-0 opacity-50"
      style="background-image: radial-gradient(circle at 2px 2px, rgba(156,163,175,0.3) 2px, transparent 0); background-size: 20px 20px;">
    </div>

    <div class="relative max-w-6xl mx-auto px-6 py-8">
      <!-- 标题区域 -->
      <header class="mb-12">
        <div
          class="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-8 relative transform hover:scale-[1.02] transition-all duration-200 group shadow-[3px_3px_0px_0px_rgba(6,182,212,0.15)]">
          <div class="flex items-center justify-between">
            <div class="relative">
              <div
                class="absolute bottom-1 left-0 right-0 h-4 bg-cyan-300 dark:bg-cyan-400/60 opacity-60 transform -rotate-1">
              </div>
              <h1 class="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 relative">Serverless Gallery</h1>
            </div>

            <!-- 主题切换 -->
            <div
              class="bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-1 shadow-[2px_2px_0px_0px_rgba(148,163,184,0.2)]">
              <div class="flex gap-1">
                <button @click="setTheme('light')"
                  :class="theme === 'light' ? 'bg-yellow-200 text-slate-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                  class="w-10 h-10 rounded-xl transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer">
                  <Sun class="w-4 h-4 transition-transform hover:rotate-12" />
                </button>
                <button @click="setTheme('dark')"
                  :class="theme === 'dark' ? 'bg-cyan-700 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                  class="w-10 h-10 rounded-xl transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer">
                  <Moon class="w-4 h-4 transition-transform hover:-rotate-12" />
                </button>
                <button @click="setTheme('system')"
                  :class="theme === 'system' ? 'bg-yellow-200 dark:bg-cyan-700 text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                  class="w-10 h-10 rounded-xl transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer">
                  <SunMoon class="w-4 h-4 transition-transform hover:scale-110" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- 上传区域 -->
      <section class="mb-12">
        <div
          class="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-8 transform hover:scale-[1.01] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(6,182,212,0.12)]">
          <div class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 relative inline-block">
            <div
              class="absolute bottom-2 left-0 right-0 h-2 bg-cyan-300 dark:bg-cyan-400/60 opacity-60 transform -rotate-1">
            </div>
            <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 relative">上传文件</h2>
          </div>

          <!-- 上传拖拽区域 -->
          <div class="mb-6">
            <label class="block cursor-pointer group">
              <input ref="fileInput" type="file" @change="handleFileChange" multiple accept="*/*" class="sr-only" />
              <div
                class="border-3 border-dashed border-cyan-200 dark:border-cyan-400/50 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl p-12 text-center transition-all duration-200 group-hover:border-cyan-300 dark:group-hover:border-cyan-400/70 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 group-hover:scale-[1.02]">
                <div
                  class="inline-flex items-center justify-center w-16 h-16 bg-cyan-200 dark:bg-cyan-600/50 rounded-2xl mb-4 transform rotate-3 group-hover:rotate-6 group-hover:scale-110 transition-all duration-200">
                  <Upload
                    class="w-8 h-8 text-cyan-700 dark:text-cyan-300 transition-transform group-hover:translate-y-[-2px]" />
                </div>
                <p
                  class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-cyan-800 dark:group-hover:text-cyan-300 transition-colors duration-200">
                  点击选择文件或拖拽到此处</p>
                <p class="text-slate-600 dark:text-slate-400">支持多文件选择，单个文件最大 50MB</p>
              </div>
            </label>
          </div>

          <!-- 选中的文件列表 -->
          <div v-if="selectedFiles.length > 0" class="space-y-4 mb-6">
            <div v-for="(file, index) in selectedFiles" :key="`${file.name}-${file.lastModified}-${index}`"
              class="bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(148,163,184,0.15)]">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 bg-rose-200 dark:bg-rose-600/50 rounded-xl flex items-center justify-center transform -rotate-2 hover:rotate-0 transition-transform duration-200">
                    <File class="w-6 h-6 text-rose-700 dark:text-rose-300" />
                  </div>
                  <div>
                    <p class="font-semibold text-slate-800 dark:text-slate-200">{{ file.name }}</p>
                    <p class="text-slate-600 dark:text-slate-400 text-sm">{{ (file.size / 1024).toFixed(2) }} KB</p>
                  </div>
                </div>
                <button @click="removeFile(index)"
                  class="w-8 h-8 bg-red-200 dark:bg-red-600/50 hover:bg-red-300 dark:hover:bg-red-500 text-red-700 dark:text-red-300 rounded-lg border-2 border-red-300 dark:border-red-500 transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- 批量上传按钮 -->
            <div class="flex justify-end">
              <button @click="uploadFiles" :disabled="isUploading"
                class="bg-cyan-300 dark:bg-cyan-600 hover:bg-cyan-400 dark:hover:bg-cyan-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold px-8 py-3 rounded-2xl border-2 border-cyan-400 dark:border-cyan-500 disabled:border-slate-400 dark:disabled:border-slate-600 transition-all duration-150 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:hover:scale-100 cursor-pointer shadow-[3px_3px_0px_0px_rgba(6,182,212,0.2)]">
                <component :is="isUploading ? Loader2 : Upload"
                  :class="{ 'animate-spin': isUploading, 'animate-bounce': !isUploading }" class="w-5 h-5" />
                {{ isUploading ? `上传中 (${uploadProgress}/${selectedFiles.length})...` : `开始上传 (${selectedFiles.length}
                个文件)` }}
              </button>
            </div>
          </div>

          <!-- 上传结果 -->
          <div v-if="uploadResults.length > 0" class="space-y-3">
            <div v-for="(result, index) in uploadResults" :key="index"
              class="rounded-2xl p-4 border-2 shadow-[2px_2px_0px_0px_rgba(148,163,184,0.1)]"
              :class="'error' in result ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-600/50' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600/50'">
              <div v-if="!('error' in result) && 'url' in result" class="flex items-center gap-3">
                <div class="w-6 h-6 bg-green-200 dark:bg-green-600/50 rounded-full flex items-center justify-center">
                  <CheckCircle class="w-4 h-4 text-green-700 dark:text-green-300" />
                </div>
                <p class="font-medium text-green-800 dark:text-green-200 text-sm">{{ result.message }}</p>
              </div>
              <div v-else class="flex items-center gap-3">
                <div class="w-6 h-6 bg-red-200 dark:bg-red-600/50 rounded-full flex items-center justify-center">
                  <XCircle class="w-4 h-4 text-red-700 dark:text-red-300" />
                </div>
                <div>
                  <p class="font-medium text-red-800 dark:text-red-200 text-sm">{{ result.error }}</p>
                  <p v-if="result.details" class="text-red-700 dark:text-red-300 text-xs">{{ result.details }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 文件管理区域 -->
      <section>
        <div
          class="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl overflow-hidden transform hover:scale-[1.01] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(6,182,212,0.12)]">

          <!-- 标题栏 -->
          <div class="bg-slate-50 dark:bg-slate-700 border-b-2 border-slate-200 dark:border-slate-600 p-8">
            <div class="flex items-center justify-between">
              <div class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 relative inline-block">
                <div
                  class="absolute bottom-2 left-0 right-0 h-2 bg-cyan-300 dark:bg-cyan-400/60 opacity-60 transform -rotate-1">
                </div>
                <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 relative">文件列表</h2>
              </div>

              <button @click="loadFiles" :disabled="isLoadingFiles"
                class="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium px-4 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-600 disabled:border-slate-200 dark:disabled:border-slate-700 transition-all duration-150 flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(148,163,184,0.2)]">
                <component :is="isLoadingFiles ? Loader2 : RotateCcw" :class="{ 'animate-spin': isLoadingFiles }"
                  class="w-4 h-4" />
                刷新
              </button>
            </div>
          </div>

          <!-- 筛选区域 -->
          <div class="bg-amber-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-600 p-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">搜索</label>
                <div class="relative group">
                  <Search
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors duration-200" />
                  <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="搜索文件..."
                    class="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 focus:scale-[1.02] shadow-[1px_1px_0px_0px_rgba(148,163,184,0.1)]" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">文件类型</label>
                <select v-model="selectedMimeType" @change="loadFiles"
                  class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 focus:scale-[1.02] cursor-pointer shadow-[1px_1px_0px_0px_rgba(148,163,184,0.1)]">
                  <option value="">所有类型</option>
                  <option value="image/">图片文件</option>
                  <option value="text/">文本文件</option>
                  <option value="application/pdf">PDF 文档</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">排序方式</label>
                <select v-model="sortBy" @change="loadFiles"
                  class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 focus:scale-[1.02] cursor-pointer shadow-[1px_1px_0px_0px_rgba(148,163,184,0.1)]">
                  <option value="uploaded_at">上传时间</option>
                  <option value="size">文件大小</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">排序顺序</label>
                <select v-model="sortOrder" @change="loadFiles"
                  class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 focus:scale-[1.02] cursor-pointer shadow-[1px_1px_0px_0px_rgba(148,163,184,0.1)]">
                  <option value="desc">从新到旧</option>
                  <option value="asc">从旧到新</option>
                </select>
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
              <p class="text-lg font-medium text-slate-800 dark:text-slate-200">加载中...</p>
            </div>

            <div v-else-if="fileList.length === 0" class="text-center py-20">
              <div
                class="inline-flex items-center justify-center w-20 h-20 bg-slate-200 dark:bg-slate-600 rounded-2xl mb-6 transform -rotate-3">
                <FolderOpen class="w-10 h-10 text-slate-600 dark:text-slate-400" />
              </div>
              <p class="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">暂无文件</p>
              <p class="text-slate-600 dark:text-slate-400">上传第一个文件开始使用</p>
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
                      <div v-else
                        class="w-16 h-16 bg-rose-200 dark:bg-rose-600/50 rounded-xl border-2 border-rose-300 dark:border-rose-500 flex items-center justify-center transform group-hover:-rotate-8 group-hover:scale-105 transition-transform duration-200">
                        <File class="w-8 h-8 text-rose-700 dark:text-rose-300" />
                      </div>
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
                  <div
                    class="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                    <button @click="openDetailsModal(file)"
                      class="w-10 h-10 bg-blue-200 dark:bg-blue-600/50 hover:bg-blue-300 dark:hover:bg-blue-500 text-blue-700 dark:text-blue-300 rounded-xl border-2 border-blue-300 dark:border-blue-500 transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer hover:rotate-3 shadow-[1px_1px_0px_0px_rgba(59,130,246,0.2)]">
                      <Eye class="w-5 h-5" />
                    </button>
                    <button @click="openEditModal(file)"
                      class="w-10 h-10 bg-amber-200 dark:bg-amber-600/50 hover:bg-amber-300 dark:hover:bg-amber-500 text-amber-700 dark:text-amber-300 rounded-xl border-2 border-amber-300 dark:border-amber-500 transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer hover:-rotate-3 shadow-[1px_1px_0px_0px_rgba(245,158,11,0.2)]">
                      <Edit class="w-5 h-5" />
                    </button>
                    <button @click="confirmDeleteFile(file.filename)"
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
                显示 {{ currentOffset + 1 }}-{{ Math.min(currentOffset + currentLimit, totalFiles || fileList.length) }}
                {{ totalFiles ? `共 ${totalFiles} 个文件` : '' }}
              </div>
              <div class="flex gap-3">
                <button @click="previousPage" :disabled="currentOffset === 0"
                  class="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border-2 border-slate-300 dark:border-slate-600 disabled:border-slate-200 dark:disabled:border-slate-700 transition-all duration-150 hover:scale-105 active:scale-95 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(148,163,184,0.2)]">
                  上一页
                </button>
                <button @click="nextPage" :disabled="fileList.length < currentLimit"
                  class="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border-2 border-slate-300 dark:border-slate-600 disabled:border-slate-200 dark:disabled:border-slate-700 transition-all duration-150 hover:scale-105 active:scale-95 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(148,163,184,0.2)]">
                  下一页
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 文件详情模态框 -->
    <TransitionRoot as="template" :show="showDetailsModal">
      <Dialog as="div" class="relative z-50" @close="closeDetailsModal">
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
                class="relative transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 px-6 pb-6 pt-6 text-left sm:my-8 sm:w-full sm:max-w-2xl sm:p-8 shadow-[6px_6px_0px_0px_rgba(6,182,212,0.15)]">
                <div class="flex items-center justify-between mb-8">
                  <DialogTitle as="h3"
                    class="text-2xl font-bold text-slate-800 dark:text-slate-100 relative inline-block">
                    文件详情
                    <div
                      class="absolute -bottom-1 left-0 right-0 h-1 bg-blue-300 dark:bg-blue-400/60 opacity-60 transform rotate-0.5">
                    </div>
                  </DialogTitle>
                  <button @click="closeDetailsModal"
                    class="w-10 h-10 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300 rounded-xl border-2 border-slate-300 dark:border-slate-600 transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 hover:rotate-90 cursor-pointer">
                    <X class="w-6 h-6" />
                  </button>
                </div>

                <div v-if="selectedFileForDetails" class="space-y-8">
                  <!-- 文件预览 -->
                  <div v-if="selectedFileForDetails.mime_type.startsWith('image/')" class="text-center">
                    <div
                      class="inline-block rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-600 hover:scale-105 hover:ring-4 hover:ring-cyan-200 dark:hover:ring-cyan-700 transition-transform duration-200">
                      <img :src="`/files/${selectedFileForDetails.filename}?level=mid`"
                        :alt="selectedFileForDetails.title || selectedFileForDetails.filename"
                        class="max-h-80 object-contain" />
                    </div>
                  </div>

                  <!-- 基本信息 -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-800 dark:text-slate-200">文件名</label>
                      <div>
                        <input readonly :value="selectedFileForDetails.filename"
                          class="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:border-cyan-300 dark:focus:border-cyan-500 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm font-mono text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-800 dark:text-slate-200">文件类型</label>
                      <div>
                        <input readonly :value="selectedFileForDetails.mime_type"
                          class="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:border-cyan-300 dark:focus:border-cyan-500 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm font-mono text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-800 dark:text-slate-200">文件大小</label>
                      <p class="text-slate-700 dark:text-slate-300 px-4 py-3">
                        {{ formatFileSize(selectedFileForDetails.size) }}
                      </p>
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-800 dark:text-slate-200">上传时间</label>
                      <p class="text-slate-700 dark:text-slate-300 px-4 py-3">
                        {{ formatDate(selectedFileForDetails.uploaded_at) }}
                      </p>
                    </div>
                    <div v-if="selectedFileForDetails.title" class="md:col-span-2 space-y-2">
                      <label class="text-sm font-bold text-slate-800 dark:text-slate-200">标题</label>
                      <p class="text-slate-700 dark:text-slate-300 px-4 py-3">
                        {{ selectedFileForDetails.title }}
                      </p>
                    </div>
                    <div v-if="selectedFileForDetails.description" class="md:col-span-2 space-y-2">
                      <label class="text-sm font-bold text-slate-800 dark:text-slate-200">描述</label>
                      <p class="text-slate-700 dark:text-slate-300 px-4 py-3">
                        {{ selectedFileForDetails.description }}
                      </p>
                    </div>
                  </div>

                  <!-- 分享链接 -->
                  <div class="border-t-2 border-dashed border-slate-200 dark:border-slate-600 pt-8">
                    <h4 class="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">
                      <div
                        class="w-8 h-8 bg-violet-200 dark:bg-violet-600/50 rounded-xl flex items-center justify-center transform -rotate-16 hover:rotate-0 transition-transform duration-200">
                        <Link class="w-5 h-5 text-violet-700 dark:text-violet-300" />
                      </div>
                      分享链接
                    </h4>
                    <div class="space-y-4">
                      <!-- 原始文件 -->
                      <div class="space-y-2">
                        <label class="text-sm font-bold text-slate-800 dark:text-slate-200">原始文件</label>
                        <div class="flex gap-3">
                          <input readonly :value="`${currentOrigin}/files/${selectedFileForDetails.filename}`"
                            class="flex-1 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:border-cyan-300 dark:focus:border-cyan-500 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm font-mono text-slate-800 dark:text-slate-200" />
                          <button
                            @click="copyToClipboard(`${currentOrigin}/files/${selectedFileForDetails.filename}`, '原文件链接')"
                            class="bg-cyan-200 dark:bg-cyan-600 hover:bg-cyan-400 dark:hover:bg-cyan-500 text-cyan-800 dark:text-cyan-100 font-semibold px-4 py-3 rounded-xl border-2 border-cyan-400 dark:border-cyan-500 transition-all duration-150 flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(6,182,212,0.2)]">
                            <Copy class="w-4 h-4 hover:rotate-12 transition-transform duration-200" />
                            复制
                          </button>
                        </div>
                      </div>

                      <!-- 压缩版本 -->
                      <div v-if="selectedFileForDetails.mime_type.startsWith('image/')" class="space-y-4">
                        <div v-for="(level, label) in { '低质量': 'low', '中质量': 'mid', '高质量': 'high' }" :key="level"
                          class="space-y-2">
                          <label class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ label }}</label>
                          <div class="flex gap-3">
                            <input readonly
                              :value="`${currentOrigin}/files/${selectedFileForDetails.filename}?level=${level}`"
                              class="flex-1 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:border-cyan-300 dark:focus:border-cyan-500 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm font-mono text-slate-800 dark:text-slate-200" />
                            <button
                              @click="copyToClipboard(`${currentOrigin}/files/${selectedFileForDetails.filename}?level=${level}`, `${label}链接`)"
                              class="bg-cyan-200 dark:bg-cyan-600 hover:bg-cyan-400 dark:hover:bg-cyan-500 text-cyan-800 dark:text-cyan-100 font-semibold px-4 py-3 rounded-xl border-2 border-cyan-400 dark:border-cyan-500 transition-all duration-150 flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(6,182,212,0.2)]">
                              <Copy class="w-4 h-4 hover:rotate-12 transition-transform duration-200" />
                              复制
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- 编辑模态框 -->
    <TransitionRoot as="template" :show="showEditModal">
      <Dialog as="div" class="relative z-50" @close="closeEditModal">
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
                    编辑文件信息
                    <div
                      class="absolute -bottom-1 left-0 right-0 h-1 bg-amber-300 dark:bg-amber-400/60 opacity-60 transform -rotate-0.5">
                    </div>
                  </DialogTitle>
                  <button @click="closeEditModal"
                    class="w-10 h-10 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300 rounded-xl border-2 border-slate-300 dark:border-slate-600 transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 hover:rotate-90 cursor-pointer">
                    <X class="w-6 h-6" />
                  </button>
                </div>

                <form @submit.prevent="saveFileInfo" class="space-y-6">
                  <div class="space-y-3">
                    <label class="block text-sm font-bold text-slate-800 dark:text-slate-200">标题</label>
                    <input v-model="editForm.title" type="text"
                      class="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 focus:scale-[1.02]"
                      placeholder="输入文件标题..." />
                  </div>
                  <div class="space-y-3">
                    <label class="block text-sm font-bold text-slate-800 dark:text-slate-200">描述</label>
                    <textarea v-model="editForm.description" rows="4"
                      class="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:border-cyan-300 dark:focus:border-cyan-500 focus:outline-none transition-all duration-150 resize-none hover:border-slate-300 dark:hover:border-slate-500 focus:scale-[1.02]"
                      placeholder="输入文件描述..."></textarea>
                  </div>
                  <div class="flex justify-end gap-4 pt-6">
                    <button type="button" @click="closeEditModal"
                      class="px-6 py-3 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border-2 border-slate-300 dark:border-slate-600 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer">
                      取消
                    </button>
                    <button type="submit" :disabled="isSavingFileInfo"
                      class="bg-cyan-300 dark:bg-cyan-600 hover:bg-cyan-400 dark:hover:bg-cyan-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold px-6 py-3 rounded-xl border-2 border-cyan-400 dark:border-cyan-500 disabled:border-slate-400 dark:disabled:border-slate-600 transition-all duration-150 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed">
                      <component :is="isSavingFileInfo ? Loader2 : Save" :class="{ 'animate-spin': isSavingFileInfo }"
                        class="w-5 h-5" />
                      {{ isSavingFileInfo ? '保存中...' : '保存更改' }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- 删除确认模态框 -->
    <TransitionRoot as="template" :show="showDeleteModal">
      <Dialog as="div" class="relative z-50" @close="closeDeleteModal">
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
                class="relative transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 px-6 pb-6 pt-6 text-left sm:my-8 sm:w-full sm:max-w-md sm:p-8 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.15)]">
                <div class="text-center">
                  <div
                    class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-200 dark:bg-red-600/50 border-2 border-red-300 dark:border-red-500 transform -rotate-3 mb-6 animate-bounce">
                    <AlertTriangle class="h-8 w-8 text-red-700 dark:text-red-300" />
                  </div>
                  <div>
                    <DialogTitle as="h3" class="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                      删除文件
                    </DialogTitle>
                    <div>
                      <p class="text-slate-600 dark:text-slate-400 mb-2">
                        确定要删除文件 <span class="font-bold text-slate-800 dark:text-slate-200">{{ fileToDelete }}</span> 吗？
                      </p>
                      <p class="text-sm text-red-600 dark:text-red-400 font-medium">
                        此操作不可撤销！
                      </p>
                    </div>
                  </div>
                </div>
                <div class="mt-8 flex gap-4">
                  <button @click="closeDeleteModal"
                    class="flex-1 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer">
                    取消
                  </button>
                  <button @click="deleteFile" :disabled="isDeletingFile"
                    class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-300 dark:bg-red-600/70 hover:bg-red-400 dark:hover:bg-red-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 px-4 py-3 font-semibold text-red-800 dark:text-red-100 disabled:text-slate-600 dark:disabled:text-slate-400 border-2 border-red-400 dark:border-red-500 disabled:border-slate-400 dark:disabled:border-slate-600 transition-all duration-150 hover:scale-105 active:scale-95 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed">
                    <component :is="isDeletingFile ? Loader2 : Trash2" :class="{ 'animate-spin': isDeletingFile }"
                      class="w-5 h-5" />
                    {{ isDeletingFile ? '删除中...' : '确认删除' }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- 消息提示 -->
    <TransitionRoot as="template" :show="showToast">
      <div class="fixed bottom-6 right-6 z-[100]">
        <TransitionChild as="template" enter="transform ease-out duration-200 transition"
          enter-from="translate-y-2 opacity-0 scale-95" enter-to="translate-y-0 opacity-100 scale-100"
          leave="transform ease-in duration-150 transition" leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95">
          <div
            class="bg-white dark:bg-slate-800 border-2 border-cyan-300 dark:border-cyan-500 rounded-2xl px-6 py-4 animate-bounce-in hover:scale-105 transition-transform duration-150 shadow-[4px_4px_0px_0px_rgba(6,182,212,0.3)]">
            <div class="flex items-center gap-4">
              <div
                class="w-8 h-8 bg-cyan-200 dark:bg-cyan-600/50 rounded-full flex items-center justify-center animate-success-pulse">
                <CheckCircle class="w-5 h-5 text-cyan-700 dark:text-cyan-300" />
              </div>
              <p class="font-semibold text-slate-800 dark:text-slate-200">{{ toastMessage }}</p>
            </div>
          </div>
        </TransitionChild>
      </div>
    </TransitionRoot>
  </div>
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
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Edit,
  Eye,
  File,
  FolderOpen,
  Link,
  Loader2,
  Moon,
  RotateCcw,
  Save,
  Search,
  Sun,
  SunMoon,
  Trash2,
  Upload,
  X,
  XCircle
} from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import type { AppType } from '../api/index';
import type { FileMetadata, ListFilesOptions } from '../common/services';

const client = hc<AppType>('/');

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

// 多文件上传相关状态
const fileInput = ref<HTMLInputElement>();
const selectedFiles = ref<File[]>([]);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadResults = ref<Array<any>>([]);

// 文件列表相关状态
const fileList = ref<FileMetadata[]>([]);
const isLoadingFiles = ref(false);
const isDeletingFile = ref<boolean>(false);
const searchQuery = ref('');
const selectedMimeType = ref('');
const sortBy = ref<ListFilesOptions['sortBy']>('uploaded_at');
const sortOrder = ref<ListFilesOptions['sort']>('desc');
const currentOffset = ref(0);
const currentLimit = ref(20);
const totalFiles = ref<number | null>(null);

// 模态框状态
const showDetailsModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedFileForDetails = ref<FileMetadata | null>(null);
const selectedFileForEdit = ref<FileMetadata | null>(null);
const fileToDelete = ref<string>('');

// 编辑表单
const editForm = ref({
  title: '',
  description: ''
});
const isSavingFileInfo = ref(false);

// 提示消息
const showToast = ref(false);
const toastMessage = ref('');

// 计算属性
const currentOrigin = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
});

// 文件选择处理（修复重复选择问题）
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFiles.value = Array.from(target.files);
    uploadResults.value = [];
  } else {
    selectedFiles.value = [];
  }
  // 关键修复：清理input的value，确保可以重复选择相同文件
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 移除单个文件
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  // 如果没有文件了，也清理input
  if (selectedFiles.value.length === 0 && fileInput.value) {
    fileInput.value.value = '';
  }
};

// 提示消息函数
const toastTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const showToastMessage = (message: string) => {
  toastMessage.value = message;
  showToast.value = true;
  if (toastTimeout.value) {
    clearTimeout(toastTimeout.value);
  }
  toastTimeout.value = setTimeout(() => {
    showToast.value = false;
    toastTimeout.value = null;
  }, 3000);
};

// 批量上传文件
const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) {
    showToastMessage('请先选择文件');
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;
  uploadResults.value = [];

  for (let i = 0; i < selectedFiles.value.length; i++) {
    const file = selectedFiles.value[i];

    try {
      const response = await client.api.files.$post({
        form: { file },
      });

      const responseBody = await response.json();
      uploadResults.value.push(responseBody);

    } catch (error: any) {
      console.error('Upload error:', error);
      uploadResults.value.push({
        error: '上传失败',
        details: error.message,
        filename: file.name
      });
    }

    uploadProgress.value = i + 1;
  }

  isUploading.value = false;

  // 上传完成后刷新文件列表
  await loadFiles();

  // 显示完成提示
  const successCount = uploadResults.value.filter(result => !('error' in result)).length;
  const totalCount = selectedFiles.value.length;

  if (successCount === totalCount) {
    showToastMessage(`成功上传 ${successCount} 个文件`);
  } else {
    showToastMessage(`上传完成：${successCount} 成功，${totalCount - successCount} 失败`);
  }

  // 清空选择的文件
  selectedFiles.value = [];
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

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

// 删除文件
const deleteFile = async () => {
  if (!fileToDelete.value) return;

  isDeletingFile.value = true;
  try {
    const response = await client.api.files[':filename'].$delete({
      param: {
        filename: fileToDelete.value
      }
    });

    if (response.ok) {
      fileList.value = fileList.value.filter(f => f.filename !== fileToDelete.value);
      showToastMessage('文件已删除');
      closeDeleteModal();
      await loadFiles();
    } else {
      const errorData = await response.json();
      showToastMessage(`删除失败: ${(errorData as any).error || '未知错误'}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    showToastMessage('删除文件时发生错误');
  } finally {
    isDeletingFile.value = false;
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
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 模态框函数
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
  editForm.value = {
    title: file.title || '',
    description: file.description || ''
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedFileForEdit.value = null;
  editForm.value = { title: '', description: '' };
};

const confirmDeleteFile = (filename: string) => {
  fileToDelete.value = filename;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  fileToDelete.value = '';
};

// 复制到剪贴板
const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showToastMessage(`${type}已复制到剪贴板`);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    showToastMessage('复制失败，请手动选择链接');
  }
};

// 保存文件信息
const saveFileInfo = async () => {
  if (!selectedFileForEdit.value) return;

  isSavingFileInfo.value = true;
  try {
    const response = await client.api.files[':filename'].$put({
      param: {
        filename: selectedFileForEdit.value.filename
      },
      json: {
        title: editForm.value.title || undefined,
        description: editForm.value.description || undefined
      }
    });

    if (response.ok) {
      const fileIndex = fileList.value.findIndex(f => f.filename === selectedFileForEdit.value!.filename);
      if (fileIndex !== -1) {
        fileList.value[fileIndex] = {
          ...fileList.value[fileIndex],
          title: editForm.value.title || undefined,
          description: editForm.value.description || undefined
        };
      }

      if (selectedFileForDetails.value?.filename === selectedFileForEdit.value.filename) {
        selectedFileForDetails.value = {
          ...selectedFileForDetails.value,
          title: editForm.value.title || undefined,
          description: editForm.value.description || undefined
        };
      }

      showToastMessage('文件信息已更新');
      closeEditModal();
    } else {
      const errorData = await response.json();
      showToastMessage(`更新失败: ${(errorData as any).error || '未知错误'}`);
    }
  } catch (error) {
    console.error('Error updating file info:', error);
    showToastMessage('更新文件信息时发生错误');
  } finally {
    isSavingFileInfo.value = false;
  }
};

// 初始化
onMounted(() => {
  initializeTheme();
  watch(theme, applyTheme);
  loadFiles();
});

</script>