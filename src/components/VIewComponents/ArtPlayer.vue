<template>
  <div v-show="instance" ref="ArtplayerRef"></div>
</template>

<script setup>
  import { ref, toRefs, onMounted, onBeforeUnmount, nextTick, useTemplateRef } from 'vue'
  import Artplayer from "artplayer";

  const props = defineProps({
    option: {
      type: Object,
      required: true,
    }
  });
  const emit = defineEmits(['get-instance', 'fullscreenWeb']);
  const { option } = toRefs(props);
  const ArtplayerRef = useTemplateRef('ArtplayerRef'); // 创建一个响应式引用作为DOM元素的引用
  const instance = ref(null); // 创建一个响应式引用来存储Artplayer实例

  onMounted(() => {
    instance.value = new Artplayer({
      ...option.value,
      container: ArtplayerRef.value,
    });

    nextTick(() => {
      emit('get-instance', instance.value);
    });

    instance.value.on('fullscreenWeb', (state) => {
      emit('fullscreenWeb', state);
    });

    instance.value.on('fullscreen', (state) => {
      emit('fullscreen', state);
    });
  });

  onBeforeUnmount(() => {
    if (instance.value && instance.value.destroy) {
      instance.value.destroy(false);
    }
  });
</script>