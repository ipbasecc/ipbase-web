<template>
    <q-carousel
      animated
      v-model="slide"
      :arrows="contral"
      :navigation="contral"
      infinite
      class="fit"
    >
      <q-carousel-slide :name="1" class="bg-repeat-x bg-contain" img-src="https://airspace.oss-cn-shanghai.aliyuncs.com/ipbase/public/images/Team_person.png">
        <div class="absolute-bottom q-pa-xl column flex-center blur-xs text-white">
          <div :class="$q.screen.lt.sm ? '' : 'text-h2'">整合团队与个人</div>
          <div v-if="!$q.screen.lt.sm" class="text-subtitle1">允许个人附加内容到团队，且仅自己可见</div>
          <div v-if="!$q.screen.lt.sm" class="text-subtitle1">就“团队事务”，为自己建立“清单”，自我管理与团队目标自动对齐！</div>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </template>
  
  <script setup>
  import {ref} from 'vue'

  const slide = ref(1)
  const contral = ref(false)
  </script>
  
  <style scoped>
  </style>