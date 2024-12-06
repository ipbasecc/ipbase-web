<!-- src/pages/WechatCallback.vue -->
<template>
    <q-page class="flex flex-center">
        mm_info: {{ mm_info }}
      <q-spinner-dots color="primary" size="40px" />
      <p class="text-caption text-grey q-mt-md">正在处理登录...</p>
    </q-page>
  </template>
  
  <script setup>
    import { onMounted } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import { useQuasar } from 'quasar'
  
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()

    const mm_info = ref({})
  
    const handleCallback = async () => {
      try {
        const code = route.query.code
        const state = route.query.state
  
        if (!code) {
          throw new Error('未获取到授权码')
        }

  
        // // 调用后端 API 处理登录
        // const response = await fetch(`${process.env.APP_URI}/api/connect/wechat/callback?code=${code}&state=${state}`)
        // const data = await response.json()
  
        // if (data.jwt) {
        //   // 保存 token
        //   localStorage.setItem('jwt', data.jwt)
        //   // 保存用户信息
        //   localStorage.setItem('user', JSON.stringify(data.user))
  
        //   // 显示成功提示
        //   $q.notify({
        //     type: 'positive',
        //     message: '登录成功'
        //   })
  
        //   // 跳转到首页或其他页面
        //   router.push('/')
        // } else {
        //   throw new Error('登录失败')
        // }
      } catch (error) {
        console.error('Login error:', error)
        $q.notify({
          type: 'negative',
          message: error.message || '登录失败，请重试'
        })
        // router.push('/login')
      }
    }
    const getMattermostToken = async () => {
        const MM_URL = 'https://chat.yihu.team'
        const MM_OAUTH_CLIENT_ID = 'irgipzd133dnjx3aui5fddcm8w'
        const MM_OAUTH_CLIENT_SECRET = '7m6rojnpbbyh8gy9hscq119pio'
        const MM_API = 'https://chat.yihu.team/api/v4'
        const PUBLIC_URL = 'https://yihu.team'
        const MM_MASTER_TOKEN = 'htpnauumh3g9urb8pikin1oc6a'
        
        try {
            const params = {
                token: MM_MASTER_TOKEN,
                login_id: 'e6n57ursipgbxx5fei3zsotsur'
            }
            const loginResponse = await axios.post(
                `${MM_API}/users/login`,
                params
            );

            // 从响应头中获取 token
            const token = loginResponse.headers.token;
            mm_info.value = {
                token: token
            }
            return

            // 使用 access token 查找用户
            const userResponse = await axios.get(`${MM_API}/users/email/${email}`, {
                headers: {
                Authorization: `Bearer ${access_token}`,
                },
            });

            const mattermostUser = userResponse.data;

            return {
                id: mattermostUser.id,
                username: mattermostUser.username,
                email: mattermostUser.email,
                token: access_token
            };
        } catch (error) {
            // console.error('Mattermost token error:', error.response?.data || error.message);
            throw new Error('Failed to get Mattermost token', error);
        }
    }
  
    onMounted(() => {
        const code = route.query.code
        const state = route.query.state
        if(code) {
            getMattermostToken(code)
        }
    })
  </script>