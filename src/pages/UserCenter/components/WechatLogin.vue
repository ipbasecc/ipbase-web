<template>
    <div class="column no-wrap">
        <div class="row no-wrap items-center q-my-lg">
            <div class="op-5 full-width border-bottom" />
            <span class="q-px-lg op-5">OR</span>
            <div class="op-5 full-width border-bottom" />
        </div>
        <div class="row no-wrap flex-center">
            <q-btn color="positive" icon="mdi-wechat" label="微信扫码登陆" class="full-width" unelevated
                @click="handleWechatLoginClick()" />
        </div>
        <q-dialog v-model="showWechatDialog" maximized persistent :class="$q.dark.mode ? 'bg-dark' : 'bg-white'">
            <div v-if="showWebview" class="absolute-full column flex-center">
                <webview ref="wechatWebview" :src="wechatAuthUrl"
                    style="width: 1px; height: 1px; position: absolute; top: -9999px;" @dom-ready="handleDomReady"
                    webpreferences="nodeIntegration, contextIsolation" allowpopups />
                <q-card bordered v-if="QRCodeURL" class="radius-sm overflow-hidden">
                    <q-card-section class="q-pa-xl">
                        <q-img :src="QRCodeURL" :ratio="1" width="20rem" height="20rem" spinner-color="primary"
                            spinner-size="82px" class="border radius-sm overflow-hidden" />
                    </q-card-section>
                    <q-card-section class="border-top row no-wrap gap-lg flex-center">
                        <q-icon name="mdi-wechat" size="xl" />
                        <div class="text-h4 text-center">微信扫码登陆</div>
                    </q-card-section>
                </q-card>
            </div>

            <div v-else class="absolute-full column flex-center">
                <div class="column gap-md flex-center">
                    <q-img src="/logo.png" :ratio="1" width="10rem" height="10rem" spinner-color="primary"
                        spinner-size="82px" class="q-mb-xl" />
                    <div v-if="!feedback" class="row gap-sm items-center text-h6 q-mt-lg">
                        <span class="q-mr-md">正在获取授权，请稍后</span>
                        <q-spinner-dots size="2rem" :thickness="5" />
                    </div>
                </div>
            </div>
        </q-dialog>
    </div>
</template>
<script setup>
    import { ref, computed } from 'vue';
    import { generateWechatLoginUrl } from '../hooks/useWechat';
    import { useRouter } from 'vue-router';
    import { useQuasar } from 'quasar';
    import { storeUserData } from 'src/api/strapi.js';

    const router = useRouter();
    const $q = useQuasar();
    const showWechatDialog = ref(false);
    const showWebview = ref(true);
    const wechatWebview = ref(null);
    const wechatAuthUrl = ref('');
    const QRCodeURL = ref('');
    const isWechatBrowser = computed(() => /MicroMessenger/i.test(navigator.userAgent));
    const isElectron = computed(() => $q.platform.is.electron);

    const handleWechatLoginClick = async () => {
        if (isElectron.value) {
            wechatAuthUrl.value = generateWechatLoginUrl();
            showWechatDialog.value = true;
        } else {
            window.location.href = generateWechatLoginUrl(isWechatBrowser.value);
        }
    };


    const handleDomReady = async () => {
        const webview = wechatWebview.value;
        if (!webview) return;

        try {
            console.log('Webview DOM ready');

            // 添加错误事件监听
            webview.addEventListener('did-fail-load', (error) => {
                console.error('Webview failed to load:', error);
            });

            // 等待 webview 加载完成
            webview.addEventListener('did-finish-load', async () => {
                console.log('Webview finished loading');

                // 修改获取二维码的脚本，增加等待时间和错误处理
                const result = await webview.executeJavaScript(`
                    new Promise((resolve) => {
                        setTimeout(() => {
                            const img = document.querySelector('img');
                            console.log('Found image:', img);
                            resolve(img ? img.src : null);
                        }, 1000); // 等待 1 秒确保页面完全加载
                    });
                `);
                
                console.log('QR code result:', result);
                if (result) {
                    QRCodeURL.value = result;
                } else {
                    console.error('Failed to get QR code image');
                }

                // 监听导航事件
                webview.addEventListener('will-navigate', async (event) => {
                    // console.log('Will navigate:', event.url);
                    if (event.url.includes('/api/connect/wechat/callback')) {
                        const urlObj = new URL(event.url);
                        const code = urlObj.searchParams.get('code');
                        const state = urlObj.searchParams.get('state');
                        showWebview.value = false;

                        // 调用后端 API 处理登录
                        const response = await fetch(`${process.env.BACKEND_URI}api/auth/wechat/callback?code=${code}&state=${state}`)
                        const data = await response.json()
                        const res = {
                            data: data
                        }
                        await storeUserData(res)
                        router.push('/')
                    }
                });
            });
        } catch (error) {
            console.error('Failed to handle webview:', error);
        }
    };
</script>