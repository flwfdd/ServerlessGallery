<template>
    <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h1 class="text-3xl font-bold text-center text-blue-600 mb-6">{{ message }}</h1>
            <p class="text-gray-700 text-center mb-6">This part is rendered by Vue with Tailwind CSS!</p>

            <div class="flex items-center justify-center space-x-2 mb-6">
                <Switch v-model="enabled" :class="enabled ? 'bg-blue-600' : 'bg-gray-200'"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <span :class="enabled ? 'translate-x-6' : 'translate-x-1'"
                        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                </Switch>
                <span :class="enabled ? 'text-blue-600' : 'text-gray-500'">
                    {{ enabled ? 'Enabled' : 'Disabled' }}
                </span>
            </div>
            <p class="text-xs text-gray-500 text-center mb-8">Using Headless UI Switch component.</p>

            <!-- API Call Demo -->
            <div class="text-center border-t pt-6">
                <button @click="callApi"
                    class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                    Call API (/api/greet)
                </button>
                <p v-if="apiMessage" class="mt-4 text-gray-800 bg-gray-100 p-3 rounded-md shadow-sm">
                    API Response: <span class="font-semibold">{{ apiMessage }}</span>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Switch } from '@headlessui/vue';
import { hc } from 'hono/client';
import { ref } from 'vue';
import type { AppType } from '../api/index'; // 导入后端导出的 AppType

const client = hc<AppType>('/'); // 使用 AppType

const message = ref('Hello from Vue with Tailwind!');
const enabled = ref(false);
const apiMessage = ref('');

const callApi = async () => {
    try {
        // 使用类型安全的客户端调用 API
        // $get, $post 等方法对应 HTTP 方法
        // client.api.greet 指向 /api/greet 路由
        const response = await client.api.greet.$get({
            query: { name: 'VueClient (RPC)' } // 查询参数是类型化的
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // 响应数据也是类型化的
        apiMessage.value = data.message;

    } catch (error: any) {
        console.error("Failed to call API:", error);
        // Hono Client 抛出的错误可能包含更详细的信息
        if (error.message) {
            apiMessage.value = `API Error: ${error.message}`;
        } else {
            apiMessage.value = 'Failed to fetch message from API.';
        }
    }
};
</script>
