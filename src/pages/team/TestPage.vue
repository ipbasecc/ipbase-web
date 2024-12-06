<!-- src/pages/WechatLogin.vue -->
<template>
    <q-page class="flex flex-center">
        <div class="login-container">
            <q-card class="login-card">
                <q-card-section class="text-center">
                    <h4 class="text-h5 q-mb-md">微信扫码登录</h4>
                    <!-- 登录方式切换 -->
                    <q-tabs v-model="loginType" dense class="text-grey" active-color="primary" indicator-color="primary"
                        align="justify" narrow-indicator>
                        <q-tab name="wechat" label="微信登录" />
                        <q-tab name="password" label="账号密码" />
                    </q-tabs>
                    <q-tab-panels v-model="loginType" animated>
                        <!-- 微信扫码登录面板 -->
                        <q-tab-panel name="wechat">
                            <div class="qrcode-container">
                                <div v-if="!qrcodeLoading" class="qrcode">
                                    <!-- 使用 QR 组件显示二维码 -->
                                    <QrcodeVue :value="qrcodeUrl" :size="360" level="H" />
                                </div>
                                <div v-else class="flex flex-center">
                                    <q-spinner-dots color="primary" size="40px" />
                                </div>

                                <!-- 二维码过期刷新按钮 -->
                                <q-btn v-if="qrcodeExpired" flat color="primary" label="刷新二维码" class="q-mt-md"
                                    @click="refreshQrcode" />

                                <!-- 提示文字 -->
                                <p class="text-caption text-grey q-mt-md">
                                    请使用微信扫描二维码登录
                                </p>
                            </div>
                            {{ qrcodeUrl }}
                        </q-tab-panel>

                        <!-- 账号密码登录面板 -->
                        <q-tab-panel name="password">
                            <!-- 这里可以放置你现有的账号密码登录表单 -->
                            <p class="text-caption text-grey">请使用账号密码登录</p>
                        </q-tab-panel>
                    </q-tab-panels>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup>
    import { ref, onMounted, onUnmounted } from 'vue'
    import QrcodeVue from "qrcode.vue";

    const loginType = ref('wechat')
    const qrcodeUrl = ref('')
    const qrcodeLoading = ref(true)
    const qrcodeExpired = ref(false)
    let checkLoginTimer = null

    // 生成微信登录URL
    const generateWechatLoginUrl = () => {
        const appId = process.env.WECHAT_APP_ID
        // 修改这里：使用 auth/wechat/callback 作为回调路径
        const redirectUri = encodeURIComponent(`${process.env.APP_URI}/api/auth/wechat/callback`)
        const state = Math.random().toString(36).substring(7)
        
        // 检测是否在微信浏览器中
        const isWechat = new RegExp('MicroMessenger', 'i').test(navigator.userAgent)
        
        // 根据环境选择不同的URL和参数
        const baseUrl = isWechat 
            ? 'https://open.weixin.qq.com/connect/oauth2/authorize'
            : 'https://open.weixin.qq.com/connect/qrconnect'
        
        // 使用 snsapi_login 作为 scope
        const scope = isWechat ? 'snsapi_userinfo' : 'snsapi_login'
        
        return `${baseUrl}?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
    }

    // 初始化二维码
    const initQrcode = () => {
        qrcodeLoading.value = true
        qrcodeExpired.value = false

        // 这里应该调用你的后端 API 获取二维码图片 URL
        qrcodeUrl.value = generateWechatLoginUrl()
        qrcodeLoading.value = false

        // 设置二维码过期时间（2分钟）
        setTimeout(() => {
            qrcodeExpired.value = true
        }, 120000)
    }

    // 刷新二维码
    const refreshQrcode = () => {
        initQrcode()
    }

    // 检查登录状态
    const checkLoginStatus = () => {
        // 这里应该实现检查登录状态的逻辑
        // 可以通过 state 参数来验证登录回调
    }

    onMounted(() => {
        initQrcode()
        // 启动定时检查登录状态
        checkLoginTimer = setInterval(checkLoginStatus, 2000)
    })

    onUnmounted(() => {
        // 清理定时器
        if (checkLoginTimer) {
            clearInterval(checkLoginTimer)
        }
    })

</script>