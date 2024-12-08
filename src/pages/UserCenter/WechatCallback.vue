<!-- src/pages/WechatCallback.vue -->
<template>
    <div class="q-space"></div>
  <div class="absolute-full column flex-center">
    <div class="q-space"></div>
    <div class="column gap-md flex-center">
      <q-img
        src="/logo.png"
        :ratio="1"
        width="10rem"
        height="10rem"
        spinner-color="primary"
        spinner-size="82px"
        class="q-mb-xl"
      />
      <div v-if="!feedback" class="row gap-sm items-center text-h6 q-mt-lg">
        <span class="q-mr-md">正在获取授权，请稍后</span>
        <q-spinner-dots
          size="2rem"
          :thickness="5"
        />
      </div>
    </div>
    <div class="q-space"></div>
    <div class="q-space"></div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useQuasar } from 'quasar'
  import { storeUserData } from 'src/api/strapi.js';
  import { uiStore } from 'src/hooks/global/useStore';

  const $q = useQuasar()
  const router = useRouter()
  const route = useRoute()

  const feedback = ref(null)

  const handleCallback = async () => {
    try {
      const code = route.query.code
      const state = route.query.state

      if (!code) {
        throw new Error('未获取到授权码')
      }

      // 调用后端 API 处理登录
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}api/auth/wechat/callback?code=${code}&state=${state}`)
      const data = await response.json()

      feedback.value = data
      const res = {
        data: data
      }
      await storeUserData(res)
      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      $q.notify({
        type: 'negative',
        message: error.message || '登录失败，请重试'
      })
      // router.push('/login')
    }
  }

  onMounted(async () => {
    uiStore.pageLoaded = true;
    await handleCallback();
  })
</script>