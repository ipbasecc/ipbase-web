<template>
    <q-layout view="hHh lpR fFf">
        <q-header class="bg-black text-white">
            <q-toolbar class="gap-sm">
                <q-toolbar-title> Title </q-toolbar-title>
                <q-space />
                <q-btn color="primary" no-caps label="join_meet" @click="join_meet" />
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md flex flex-center">
                <q-card bordered style="min-width: 300px;">
                    <q-card-section>
                        {{ redirectUrl }}
                    </q-card-section>
                    <q-card-section>
                        <q-btn color="positive" icon="mdi-wechat" label="微信扫码登陆" unelevated class="full-width"
                            @click="openWechatLogin()"
                        />
                    </q-card-section>
                </q-card>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup>
    import { onMounted, ref, useTemplateRef, computed, watchEffect } from 'vue';
    import { uiStore } from "src/hooks/global/useStore.js";
    import { generateWechatLoginUrl } from 'src/pages/UserCenter/hooks/useWechat';

    const redirectUrl = ref(generateWechatLoginUrl())
    const openWechatLogin = () => {
        window.location.href = redirectUrl.value
    }
    onMounted(() => {
        uiStore.pageLoaded = true;
    });
</script>