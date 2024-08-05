<template>
    <q-carousel
      animated
      v-model="slide"
      :arrows="contral"
      :navigation="contral"
      infinite
      class="fit"
    >
      <q-carousel-slide :name="1" img-src="public/images/Project_share.png">
        <div class="absolute-bottom q-pa-xl column flex-center blur-xs">
          <div class="text-h2">共享数据</div>
          <div class="text-subtitle1">卡片、规划均可生成共享连接</div>
          <div class="text-subtitle1">您可以设置共享有效期、查看次数，设定共享内容</div>
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