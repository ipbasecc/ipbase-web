<template>
    <bizCard v-if="showBizcard" :cardData="bizCardDataRef" />
    <div :style="`backdrop-filter: blur(${blur}px);`">
        <q-toolbar class="container limit bg-primary text-white radius-xs">
            <q-tabs dense align="left" v-model="actived">
                <q-route-tab
                    v-for="(i, index) in navigation"
                    :key="index"
                    :to="`/brand/${channelId}/${i.val}`"
                    :label=i.name
                    :name="i.val"
                    @click="actived = i.val"
                />
            </q-tabs>
            <q-space />
            <q-btn v-if="isChannelOwner && !showBizcard" flat round dense icon="mdi-dots-vertical">
                <q-menu>
                    <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup @click="toggleBizcard">
                            <q-item-section side><q-icon name="mdi-qrcode-scan" /></q-item-section>
                            <q-item-section class="q-pr-md">我的微名片</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="$router.push(`/userinfo/bizcard`)">
                            <q-item-section side><q-icon name="mdi-cards-playing-outline" /></q-item-section>
                            <q-item-section class="q-pr-md">管理微名片</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="$router.push(`/brand/${channelIdRef}/favorite`)">
                            <q-item-section side><q-icon name="mdi-star" /></q-item-section>
                            <q-item-section class="q-pr-md">管理收藏夹</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable v-close-popup @click="$router.push('/userinfo/settings')">
                            <q-item-section side><q-icon name="settings" /></q-item-section>
                            <q-item-section class="q-pr-md">频道设置</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
            <q-btn v-if="!isChannelOwner || showBizcard" icon="mdi-qrcode-scan" flat round dense @click="toggleBizcard">
                <q-tooltip>
                    查看“TA”的微名片
                </q-tooltip>
            </q-btn>
        </q-toolbar>
        <div
          class="absolute-full z-unfab"
          :class="$q.dark.mode ? 'bg-black' : 'bg-white'"
          :style="`opacity: ${opacity};`"
        ></div>
    </div>
</template>
<script setup>
    import { inject, onMounted, ref, toRef, watch } from 'vue';
    import bizCard from "src/pages/BizCard/components/BizCard.vue";
    import useUserStore from "src/stores/user.js";
    import { useRouter,useRoute } from 'vue-router';

    const props = defineProps({
        channelId: {
            type: String,
            required: true
        },
        bizCardData: {
            type: Object,
            default() {
                return {}
            }
        },
        navigationData: {
            type: Object,
            default() {
                return {}
            }
        },
        channelPostId: {
            type: String,
            required: true
        }
    });

    const channelIdRef = toRef(props,'channelId');
    const bizCardDataRef = toRef(props,'bizCardData');
    const navigationDataRef = toRef(props,'navigationData');
    const channelPostIdRef = toRef(props,'channelPostId');
    const router = useRouter();
    const route = useRoute();

    const navigationBase = inject('navigationBase');
    const navigation = ref(navigationDataRef.value.length > 0 ? navigationDataRef.value.filter(i => i.enable) : navigationBase);
    // navigation.value = !channelPostIdRef.value && navigation.value.map(i => i.val != 'posts');
    if(!channelPostIdRef.value) {
        navigation.value = navigation.value.map(i => i.val != 'posts');
    }
    const actived = ref();
    
    // 这里的channelId由上层注入，是访问者当前正在访问的频道ID
    const userStore = useUserStore();
    const showBizcard = ref(false);
    const toggleBizcard = () => {
        showBizcard.value = !showBizcard.value
    }
    const isChannelOwner = ref(false);
    watch(
        [userStore,channelIdRef],
        () => {
            if (userStore.userId && channelIdRef.value) {
                // userStore.channelId是当前登陆者的频道ID
                isChannelOwner.value = userStore.channelId == channelIdRef.value;
            }
        },
        { immediate: true, deep: true }
    );
    watch(
        route,
        () => {
            if(route.name == 'channel_homepage') {
                // 未知bug 延时后跳转
                setTimeout(() => {
                    router.push(`/brand/${channelIdRef.value}/${navigation.value[0].val}`);
                }, 0);
            }
        },
        { immediate: true, deep: true }
    );

    const opacity = inject('opacity');
    const blur = inject('blur');
</script>