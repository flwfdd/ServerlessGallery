<!--
 * @Author: flwfdd
 * @Date: 2024-09-10 16:46:16
 * @LastEditTime: 2024-09-11 12:54:43
 * @Description: _(:з」∠)_
-->
<template>
    <div class="container">
        <h1>Home</h1>
        <div>
            <n-button @click="showMessage">
                Hello
            </n-button>
        </div>
    </div>  
</template>

<script setup lang="ts">
const showMessage = () => window.$message.info('Hello World')
</script>