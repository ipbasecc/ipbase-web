<template>
  <q-resize-observer @resize="onResize" />
    <q-scroll-area v-bind="$attrs" class="absolute-full">
        <q-pull-to-refresh :disable="!$q.screen.gt.sm" @refresh="refresh" :style="`min-height: ${contianerSize?.height}px;`">
            <q-list class="q-pa-xs">
            <q-expansion-item
                v-if="friend_requests_unProcessed?.length > 0"
                group="friends"
                label="好友申请"
            >
                <q-item v-for="i in friend_requests_unProcessed" :key="i.id" v-ripple="false" :style="i.status ? 'order: 99999' : ''">
                    <q-item-section avatar>
                        <UserAvatar
                            :user_id="i.sender?.mm_profile?.id"
                            :size="avatar_size"
                            :strapi_member="i.sender?.mm_profile"
                        />
                    </q-item-section>
                    <q-item-section :class="$q.dark.mode ? 'text-white' : 'text-grey-10'">
                        {{ i.sender.username }}
                    </q-item-section>
                    <q-item-section side>
                        <div class="q-gutter-xs">
                            <q-btn v-if="!i.status" class="gt-xs" size="12px" color="primary" dense unelevated padding="xs sm" label="同意"
                                @click="processFriendReqFn(i, 'accept')"
                            />
                            <q-btn class="gt-xs" size="12px" flat dense round icon="more_vert">
                                <q-menu class="radius-sm">
                                    <q-list bordered style="min-width: 12rem" class="radius-sm q-pa-xs">
                                        <q-item v-if="i.status !== 'refuse'" clickable v-close-popup class="radius-xs"
                                            @click="processFriendReqFn(i, 'refuse')"
                                        >
                                            <q-item-section>拒绝</q-item-section>
                                        </q-item>
                                        <q-item v-if="i.status !== 'blocked' && !blockWared" clickable v-close-popup class="radius-xs"
                                            @click="blockWared = true"
                                        >
                                            <q-item-section>拉黑</q-item-section>
                                        </q-item>
                                        <q-item v-if="i.status !== 'blocked' && blockWared" clickable v-close-popup
                                            class="radius-xs bg-red"
                                            @click="processFriendReqFn(i, 'blocked')"
                                        >
                                            <q-item-section>对方将永远不能添加你为好友 确认？</q-item-section>
                                        </q-item>
                                    </q-list>
                                </q-menu>
                            </q-btn>
                        </div>
                    </q-item-section>
                </q-item>
            </q-expansion-item>
              <q-expansion-item
                  v-if="contact.contacters?.length > 0"
                  default-opened
                  group="friends"
                  label="好友"
              >
                  <q-item v-for="i in contact.contacters" :key="i.id" v-ripple clickable
                      class="radius-xs"
                      :class="teamStore?.direct_user?.mm_profile?.id === i?.mm_profile?.id ? 'border active-sublistitem' : ''"
                      @click="createDirectChannel(self_mm_id, i)"
                  >
                      <q-item-section avatar>
                          <UserAvatar
                              :user_id="i?.mm_profile?.id"
                              :size="avatar_size"
                              :strapi_member="i?.mm_profile"
                              :square="!$q.screen.gt.sm"
                              :disable_card="true"
                          />
                      </q-item-section>
                      <q-item-section :class="$q.dark.mode ? 'text-white' : 'text-grey-10'">
                          {{ i.username }}
                      </q-item-section>
                  </q-item>
              </q-expansion-item>
            <q-expansion-item
                v-if="contact.blockeds?.length > 0"
                group="friends"
                label="被屏蔽"
            >
                <q-item v-for="i in contact.blockeds" :key="i.id" v-ripple clickable
                    class="radius-xs"
                    :class="teamStore?.direct_user?.mm_profile?.id === i?.mm_profile?.id ? 'border active-sublistitem' : ''"
                    @click="createDirectChannel(self_mm_id, i)"
                >
                    <q-item-section avatar>
                        <UserAvatar
                            :user_id="i?.mm_profile?.id"
                            :size="avatar_size"
                            :strapi_member="i?.mm_profile"
                        />
                    </q-item-section>
                    <q-item-section :class="$q.dark.mode ? 'text-white' : 'text-grey-10'">
                        {{ i.username }}
                    </q-item-section>
                    <q-item-section v-if="false" side>
                        <q-btn class="gt-xs" size="12px" color="primary" dense unelevated padding="xs sm" label="解除屏蔽"
                            @click="processFriendFn(i.id, 'unblock')"
                        />
                    </q-item-section>
                </q-item>
            </q-expansion-item>
            </q-list>
        </q-pull-to-refresh>
    </q-scroll-area>
</template>

<script setup>
import {computed, nextTick, onMounted, ref, watchEffect} from 'vue'
import {teamStore, uiStore} from 'src/hooks/global/useStore';
import UserAvatar from '../../components/user/UserAvatar.vue'
import {processFriend, processFriendReq} from 'src/api/strapi.js'
import {useCheckBlocked} from 'src/pages/team/chat/hooks/useMm.js'
import {refetchUser} from 'src/hooks/init.js'
import {createDirect, updateUserPreferences} from "src/api/mattermost.js";
import {extractDMUserID} from 'src/hooks/utilits.js'
import {useRouter} from 'vue-router';
import {useQuasar} from "quasar";

const $q = useQuasar();

const blockWared = ref(false);
const router = useRouter();
const contact = computed(() => teamStore.init?.contact);
const friend_requests_unProcessed = computed(() => contact.value?.friend_requests?.filter(i => !i.status));
const avatar_size = ref($q.screen.gt.xs ? 32 : 48);

const contianerSize = ref();
const onResize = (size) => {
    contianerSize.value = size
}
const processFriendReqFn = async (request, status) => {
    const { data } = await processFriendReq({request_id: request.id, status});
    if (data) {
        teamStore.init.contact = data
        if(status === 'block'){
            blockWared.value = false
        }
    }
}
const processFriendFn = async (member_id, action) => {
    const params = {
        friend_id: member_id,
        action: action
    }
    const { data } = await processFriend(params)
    teamStore.init.contact = data
}

const goChannel = (channel_id) => {
    router.push(`/chats/${channel_id}`);
}
const self_mm_id = computed(() => teamStore.init?.mm_profile?.id);
// 处理点击 "发送消息" 后跳转到私聊频道的逻辑
const directChannelId = ref();
const createDirectChannel_fn = async (a, b, _wasBlocked, isblocked) => {
  const res = await createDirect(a, b);
  // 显示私聊频道
  const showDirectChat = async (self_mm_id, name, direct_channel_id) => {
    const parmars = [
      {
        user_id: self_mm_id,
        category: "direct_channel_show",
        name: name,
        value: "true",
      },
      {
        user_id: self_mm_id,
        category: "channel_open_time",
        name: direct_channel_id,
        value: `${new Date().getTime()}`,
      },
    ];
    let res = await updateUserPreferences(self_mm_id, parmars);
    if (res) {
      return res;
    }
  };
  if (res?.data) {
    directChannelId.value = res.data.id;
    await showDirectChat(
        self_mm_id.value,
        res.data.name.replace(self_mm_id.value, "").replace("__", ""),
        res.data.id
    );
    teamStore.mm_channel = res.data;
    teamStore.mm_channel.wasblocked = _wasBlocked;
    teamStore.mm_channel.isblocked = isblocked;
    goChannel(res.data?.id);
  }
};
// a: 聊天对象ID
const createDirectChannel = async (a, target_strapiUser) => {
    const { wasBlock, isBlock } = await useCheckBlocked(target_strapiUser);
    teamStore.direct_user = target_strapiUser;    
    await createDirectChannel_fn(a, target_strapiUser.mm_profile?.id, wasBlock, isBlock);
};

watchEffect(async() => {
    if(!teamStore.direct_user && teamStore?.mm_channel){
        const direct_user_mm_id = extractDMUserID(teamStore.mm_channel?.name, self_mm_id.value);        
        teamStore.direct_user = contact.value?.contacters?.find(i => i.mm_profile?.id === direct_user_mm_id);
    }
    if(teamStore.direct_user?.mm_profile?.id && !teamStore.mm_channel){
        await createDirectChannel(self_mm_id.value, teamStore.direct_user);
    }
})

const refresh = async (done) => {
    await refetchUser()
    done();
}

onMounted(async () => {
  await nextTick();
  uiStore.app = 'chats'
})

</script>

<style scoped>
</style>