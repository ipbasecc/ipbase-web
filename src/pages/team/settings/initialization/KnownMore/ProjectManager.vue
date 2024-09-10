<template>
    <q-carousel
      animated
      v-model="slide"
      arrows
      navigation
      infinite
      class="fit"
    >
      <q-carousel-slide :name="1" class="bg-repeat-x bg-contain" img-src="https://airspace.oss-cn-shanghai.aliyuncs.com/ipbase/public/images/Project_chat.png">
        <div class="absolute-bottom q-pa-xl column flex-center blur-xs text-white">
          <div :class="$q.screen.lt.sm ? '' : 'text-h2'">项目讨论</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide :name="2" class="bg-repeat-x bg-contain" img-src="https://airspace.oss-cn-shanghai.aliyuncs.com/ipbase/public/images/Project_kanban.png">
        <div class="absolute-bottom q-pa-xl column flex-center blur-xs text-white">
          <div :class="$q.screen.lt.sm ? '' : 'text-h2'">事务看板</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide :name="3" class="bg-repeat-x bg-contain" img-src="https://airspace.oss-cn-shanghai.aliyuncs.com/ipbase/public/images/Project_segment.png">
        <div class="absolute-bottom q-pa-xl column flex-center blur-xs text-white">
          <div :class="$q.screen.lt.sm ? '' : 'text-h2'">影像生产</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide :name="4" class="bg-repeat-x bg-contain" img-src="https://airspace.oss-cn-shanghai.aliyuncs.com/ipbase/public/images/Project_storage.png">
        <div class="absolute-bottom q-pa-xl column flex-center blur-xs text-white">
          <div :class="$q.screen.lt.sm ? '' : 'text-h2'">文件共享</div>
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