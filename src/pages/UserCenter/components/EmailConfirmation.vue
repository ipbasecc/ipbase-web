<template>
    <div class="email-confirmation">
      <q-card-section class="border-bottom">
        <div class="column no-wrap gap-sm items-center">
          <span class="row no-wrap items-center gap-md text-orange font-xx-large">
            <q-icon name="info" />
            注册成功！
          </span>
        </div>
      </q-card-section>
      
      <q-card-section>
        请检查您的注册邮箱，接收来自
        <span class="text-red font-bold-600">{{ appName }}</span>
        的邮件，点击其中的激活链接！
      </q-card-section>
    </div>
  </template>
  
  <script setup>
  defineProps({
    appName: {
      type: String,
      required: true
    }
  });
  </script>