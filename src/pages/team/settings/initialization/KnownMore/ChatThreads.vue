<template>
    <q-carousel
      animated
      v-model="slide"
      :arrows="contral"
      :navigation="contral"
      infinite
      class="fit"
    >
      <q-carousel-slide :name="1" img-src="https://airspace.oss-cn-shanghai.aliyuncs.com/ipbase/public/images/Project_atomChat.png">
        <div class="absolute-bottom q-pa-xl column flex-center blur-xs">
          <div class="text-h2">“对象型”讨论</div>
          <div class="text-subtitle1">“就事说事”讨论互不干扰</div>
          <div class="text-subtitle1">任务、待办均关联独立讨论，讨论对象固定不再互相干扰</div>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  const slide = ref(1)
  const contral = ref(false)
  </script>
  
  <style scoped>
  </style>