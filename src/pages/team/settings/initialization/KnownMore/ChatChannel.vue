<template>
    <q-carousel
      animated
      v-model="slide"
      arrows
      navigation
      infinite
      class="fit"
    >
      <q-carousel-slide :name="1" class="bg-repeat-x bg-contain" img-src="https://airspace.oss-cn-shanghai.aliyuncs.com/ipbase/public/images/Channel.png">
        <div class="absolute-bottom q-pa-xl column flex-center blur-xs text-white">
          <div :class="$q.screen.lt.sm ? '' : 'text-h2'">独立的讨论频道</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide :name="2" class="bg-repeat-x bg-contain" img-src="https://airspace.oss-cn-shanghai.aliyuncs.com/ipbase/public/images/Project_chat.png">
        <div class="absolute-bottom q-pa-xl column flex-center blur-xs text-white">
          <div :class="$q.screen.lt.sm ? '' : 'text-h2'">与项目关联的讨论频道</div>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  const slide = ref(1)
  </script>
  
  <style scoped>
  </style>