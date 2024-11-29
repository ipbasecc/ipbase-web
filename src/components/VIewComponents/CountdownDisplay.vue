<!-- 当前组件仅显示倒计时数字，可以在需要的地方调用 -->
<template>
  <div v-if="count > 0" class="text-caption text-grey q-mt-sm">
    {{ count }}秒后自动跳转
  </div>
</template>

<script setup>
  defineProps({
    count: {
      type: Number,
      required: true
    }
  });
</script>