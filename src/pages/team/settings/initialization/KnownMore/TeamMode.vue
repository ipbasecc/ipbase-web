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
          <div v-if="!$q.screen.lt.sm" class="text-h2">团队协作模式</div>
          <div class="text-subtitle1">与成员全体、或分组、或独立联系、协作</div>
          <div v-if="!$q.screen.lt.sm" class="text-subtitle1">事务沙盘、讨论主题、频道、项目，全功能开启</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide :name="2" class="bg-repeat-x bg-contain" img-src="https://airspace.oss-cn-shanghai.aliyuncs.com/ipbase/public/images/Team_1by1.png">
        <div class="absolute-bottom q-pa-xl column flex-center blur-xs text-white">
          <div v-if="!$q.screen.lt.sm" class="text-h2">一对一服务模式</div>
          <div class="text-subtitle1">与成员一对一联系，成员之间彼此隔离</div>
          <div v-if="!$q.screen.lt.sm" class="text-subtitle1">仅开启项目功能，全员讨论功能禁用、成员仅可见与其相关内容</div>
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