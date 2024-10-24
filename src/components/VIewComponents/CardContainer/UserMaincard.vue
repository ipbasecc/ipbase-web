<template>
  <q-card v-if="cardTypeRef === 'channel_owner_card'" bordered flat>
    <q-img
        :src="brand"
        :ratio="16/9"
        spinner-color="primary"
        spinner-size="42px"
    >
        <section class="absolute-full column no-wrap gap-sm flex-center q-pa-lg">
            <q-avatar size="100px">
                <q-img
                    :src="avatar"
                    :ratio="1"
                    spinner-color="primary"
                    spinner-size="22px"
                />
            </q-avatar>
            <div class="row flex-center">
                <q-chip
                    v-for="(i,index) in self_tags" :key="index" :label="i"
                    square dense icon="tag" color="primary" text-color="white"
                >
                </q-chip>
            </div>
        </section>
    </q-img>
    <div class="column no-wrap q-pa-md text-center">
        <span class="font-large font-bold-600">{{ userDataRef.username }}</span>
        <span v-if="userDataRef.profile?.title" class="font-medium">{{ userDataRef.profile.title }}</span>
        <span v-if="userDataRef.profile?.bio" class="font-medium">{{ userDataRef.profile.bio }}</span>
        <span v-if="userDataRef.profile?.description" class="font-medium q-mt-sm op-7">{{ userDataRef.profile.description }}</span>
    </div>
    <div v-if="!is_current_user" class="absolute-top-right q-pa-sm">
        <q-btn
            :color="isFollowed ? `${$q.dark.mode ? 'grey-8' : 'grey-3'}` : 'primary'"
            :label="isFollowed ? `取消关注` : `关注'TA'`"
            unelevated
            dense
            flat
            padding="xs md"
            :class="isFollowed ? `${$q.dark.mode ? 'text-white' : 'text-black'}` : ''"
            @click="followFn()"
        >
            <q-popup-proxy v-if="isFollowed" cover>
                <q-card bordered style="min-width: 240px;">
                    <q-card-section class="row no-wrap items-center border-bottom q-py-sm">
                        <span>确认取消关注？</span>
                        <q-space />
                        <q-btn flat dense size="sm" round icon="close" v-close-popup />
                    </q-card-section>
                    <q-card-section>
                        <q-btn unelevated color="primary" icon="check" label="确认取消关注" class="full-width" v-close-popup @click="updateFollowsFn" />
                    </q-card-section>
                </q-card>
            </q-popup-proxy>
        </q-btn>
    </div>
    <q-card-section v-if="!is_current_user" class="q-pa-sm border-top">
        <q-btn
            unelevated
            icon="chat"
            color="positive"
            class="full-width"
            label="与 “TA” 交谈"
            @click="sendDirectMsg()"
        >
        </q-btn>
    </q-card-section>
  </q-card>
  <template v-if="cardTypeRef === 'user_card'">
    <q-item-section top avatar>
        <AutoAvatar :attributes="userDataRef"/>
    </q-item-section>
    <q-item-section @click="channelId && $router.push(`/brand/${channelId}`)">
        {{ userDataRef.username }}
    </q-item-section>
    <q-item-section v-if="isLogged && !is_current_user" side class="hover-show">
        <q-btn
            :color="isFollowed ? `${$q.dark.mode ? 'grey-4' : 'grey-6'}` : 'primary'"
            :label="isFollowed ? `取消` : `关注`"
            unelevated dense flat
            padding="xs sm"
            :class="isFollowed ? `${$q.dark.mode ? 'text-white' : 'text-black'}` : ''"
            @click="followFn()"
        >
            <q-popup-proxy v-if="isFollowed" cover>
                <q-card bordered style="min-width: 240px;">
                    <q-card-section class="row no-wrap items-center border-bottom q-py-sm">
                        <span>确认取消关注？</span>
                        <q-space />
                        <q-btn flat dense size="sm" round icon="close" v-close-popup />
                    </q-card-section>
                    <q-card-section>
                        <q-btn unelevated color="primary" icon="check" label="确认取消关注" class="full-width" v-close-popup @click="updateFollowsFn" />
                    </q-card-section>
                </q-card>
            </q-popup-proxy>
        </q-btn>
    </q-item-section>
  </template>
<q-dialog persistent>
    <q-card bordered style="min-width: 240px;">
        <q-card-section class="row no-wrap items-center border-bottom">
            <span>您已关注了'TA',是否继续？</span>
            <q-space />
            <q-btn flat dense size="sm" round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-sm">
            <q-btn color="primary" icon="check" label="确认取消关注" class="full-width" v-close-popup @click="updateFollowsFn" />
        </q-card-section>
    </q-card>
</q-dialog>
<q-dialog
    v-model="showDirectMsg" persistent
    :maximized="!$q.screen.gt.sm" :full-height="$q.screen.gt.sm" :full-width="$q.screen.gt.sm"
    transition-show="slide-down"
    transition-hide="slide-up"
    :class="!$q.screen.gt.sm ? 'z-max' : ''"
>
    <div class="flex flex-center">
        <DirectMmchat :targetData="userDataRef" :a="userStore && userStore.mm_profile.id" :b="userDataRef.mm_profile.id" />
    </div>
</q-dialog>
</template>

<script setup>
import {computed, inject, ref, toRef, watch, watchEffect} from "vue";
import {updateFollows} from "src/apollo/api/api.js";
import {updateFollowed} from 'src/api/strapi.js'
import useUserStore from 'src/stores/user.js'
import {useQuasar} from 'quasar';
import AutoAvatar from 'src/components/VIewComponents/AutoAvatar.vue';
import DirectMmchat from 'src/components/VIewComponents/Chat/DirectMmchat.vue';
import {teamStore} from "src/hooks/global/useStore";

const $q = useQuasar()

const props = defineProps({
    userData: {
        type: Object,
        default() {
            return {}
        }
    },
    userId: {
        type: String,
        default: ''
    },
    cardType: {
        type: String,
        default: 'channel_owner_card'
    }
});

const emit = defineEmits(['followsChange'])

const defaultCover = inject('defaultCover');
const defaultAvatar = inject('defaultAvatar');
const userDataRef = toRef(props,'userData');
const cardTypeRef = toRef(props,'cardType');
const userIdRef = toRef(props,'userId');
const brand = ref(userDataRef.value.profile?.brand?.data[0]?.attributes.url) || defaultCover;
const avatar = ref(userDataRef.value.profile?.avatar?.data?.attributes.url) || defaultAvatar;
const self_tags = ref(userDataRef.value.self_tags) || [];
const channelId = ref(userDataRef.value.user_channel?.data?.id || null)

const userStore = useUserStore();
const isLogged = ref();
const follows = computed(() => teamStore.init?.followed);
const followsIds = computed(() => follows.value?.map(i => i.id));
const isFollowed = computed(() => followsIds.value?.includes(Number(userIdRef.value)));

const is_current_user = ref(false);
watchEffect(() => {
    is_current_user.value = userStore.userId === Number(userIdRef.value);
})

watch(userStore, () => {
    // console.log('store changed');
    isLogged.value = userStore.logged;
    follows.value = userStore.follows;
    followsIds.value = Array.isArray(follows.value) && follows.value.map(i => i.id) || [];
    isFollowed.value = followsIds.value.includes(userIdRef.value);
},{immediate:true,deep:true});


const updateFollowsParams = ref({
    updateUsersPermissionsUserId: userStore.userId,
    data: {
        new_follow: null,
        unfollow: null
    }
});
const updateFollowsFn = async (_targetUser_id) => {
  updateFollowsParams.value.data = {}
  if(isFollowed.value){
    updateFollowsParams.value.data.unfollow = props.userId
  } else {
    updateFollowsParams.value.data.new_follow = props.userId
  }
  updateFollowsParams.value.updateUsersPermissionsUserId = userStore.userId;

  const res = await updateFollowed(updateFollowsParams.value);
  if(res?.data){
    teamStore.init.followed = res.data
  }
}
const _updateFollowsFn = async () => {
    if(isFollowed.value) {
        followsIds.value = followsIds.value.filter(i => i !== userIdRef.value);
    } else {
        followsIds.value = [...followsIds.value, userIdRef.value]
    }
    updateFollowsParams.value.data.follows = followsIds.value;
    const {
        mutate: updateFollowsMutate,
        onDone,
        onError,
    } = updateFollows(updateFollowsParams);

    const { data } = await updateFollowsMutate();
    if( data ) {
        // userStore.follows = data.updateUsersPermissionsUser.data.attributes.follows.data;
        $q.notify(isFollowed.value ? '已取消关注' : '已关注');
    }
};
const unfollowTip = ref(false);
const followFn = () => {
    if(isFollowed.value) {
        unfollowTip.value = true;
    } else {
        updateFollowsFn();
    }
}
const showDirectMsg = ref(false)
const sendDirectMsg = async () => {
    if(userDataRef.value.mm_profile?.id) {
        showDirectMsg.value = true;
    } else {
        $q.notify({
            message: '该用户未启用对话功能',
            position: 'center',
            actions: [
                { label: '知道了', color: 'primary', handler: () => { /* ... */ } }
            ]
        })
    }
}
</script>

<style lang="scss" scoped></style>
