<!--
 * @Author: flwfdd
 * @Date: 2024-09-11 12:35:46
 * @LastEditTime: 2024-09-11 12:40:14
 * @Description: _(:з」∠)_
-->
<script setup lang="ts">
import { useMessage, type MessageApi } from 'naive-ui';

declare global {
    interface Window {
        $message: MessageApi;
    }
}

window.$message = useMessage();
</script>

<template></template>