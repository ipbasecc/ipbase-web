<template>
    <div v-if="directMember" class="column">
        <q-toolbar class="transparent border-bottom">
            <q-btn
                flat
                dense
                size="sm"
                icon="mdi-chevron-left"
                :color="$q.dark.mode ? 'white' : 'black'"
                @click="closeInfo()"
            />
            <span class="font-large unselected q-ml-sm">查看资料：</span>
            <q-space />
            <q-btn class="gt-xs" size="12px" flat dense round icon="more_vert">
                <q-menu class="radius-sm">
                    <q-list dense bordered style="min-width: 12rem" class="radius-sm q-pa-xs">
                        <q-item v-if="isBlocked" clickable v-close-popup class="radius-xs"
                        @click="processFriendFn(directMember.id, 'unblock')">
                            <q-item-section>解除屏蔽</q-item-section>
                        </q-item>
                        <q-item v-else clickable v-close-popup class="radius-xs"
                        @click="processFriendFn(directMember.id, 'block')">
                            <q-item-section>屏蔽</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup class="radius-xs bg-negative text-white"
                        @click="processFriendFn(directMember.id, 'remove')">
                            <q-item-section>删除</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
        </q-toolbar>
        <div class="q-space row items-center gap-lg q-pa-xl">
            <UserAvatar
                :image="directMember?.wechat_profile?.avatar || directMember?.profile?.avatar?.url"
                :user_id="directMember?.mm_profile?.id"
                :size="128"
                :strapi_member="directMember?.mm_profile"
            />
            <q-list>
                <q-item v-if="directMember.username">
                    <q-item-section>{{ directMember.username }}</q-item-section>
                </q-item>
                <q-item v-if="directMember.email">
                    <q-item-section>{{ directMember.email }}</q-item-section>
                </q-item>
                <q-item v-if="directMember.profile.description">
                    <q-item-section>{{ directMember.profile.description }}</q-item-section>
                </q-item>
            </q-list>
        </div>
    </div>
</template>

<script setup>
import {computed, toRefs} from 'vue'
import UserAvatar from '../../components/user/UserAvatar.vue'
import {processFriend} from 'src/api/strapi.js'
import {teamStore} from 'src/hooks/global/useStore';
import {useRouter} from 'vue-router';
import {useCheckBlocked} from 'src/pages/team/chat/hooks/useMm.js'

const router = useRouter();
const props = defineProps({
    directMember: {
        type: Object,
        default: () => ({})
    }
})
const emit = defineEmits(['closeInfo'])
const closeInfo = () => {
  emit('closeInfo')
}
const { directMember } = toRefs(props);
const isBlocked = computed(() => {
    return teamStore.init?.contact?.blockeds?.map(i => i.id)?.includes(directMember.value.id);
})
const processFriendFn = async (member_id, action) => {
    const params = {
        friend_id: member_id,
        action: action
    }
    const { data } = await processFriend(params)
    teamStore.init.contact = data
    if(action === 'remove') {
        teamStore.mm_channel = void 0;
        teamStore.direct_user = void 0;
        setTimeout(() => {
            router.push('/chats')
        }, 0);
    } else {
        const { wasBlock, isBlock } = await useCheckBlocked(directMember.value);
        teamStore.mm_channel.wasblocked = wasBlock;
        teamStore.mm_channel.isblocked = isBlock;
    }
}
</script>

<style scoped>
</style>