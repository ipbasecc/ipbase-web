<template>
    <q-card bordered style="min-width: 22rem;">
      <template v-if="!addFriendResult">
        <q-card-actions>
          {{ title || $t('send_friend_dlog_title') }}
          <q-space />
          <q-btn flat round dense size="sm" icon="close" v-close-popup />
        </q-card-actions>
        <q-card-section class="column gap-sm q-pa-lg">
            <div class="row items-center full-width">
                <span>您正在添加</span>
                <q-chip class="q-mx-sm">
                    <q-avatar color="primary">
                        <q-img
                            v-if="targetUserAvatar"
                            :src="targetUserAvatar"
                            :ratio="1"
                            :size="36"
                            spinner-color="primary"
                            spinner-size="22px"
                        />
                        <span v-else>{{ strapi_member.by_user?.username?.charAt(0) }}</span>
                    </q-avatar>
                    {{ strapi_member.by_user?.username }}
                </q-chip>
                <span>为好友</span>
            </div>
          <q-input v-model="addFriendMsg" type="text" :label="$t('add_friend_msg_label')" />
          <q-input v-if="strapi_member.by_user?.contact?.friend_request_question?.question" v-model="addFriendReqAnswer" type="text" :label="$t('add_friend_reqAnswer_label')" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn dense :label="$t('send_friend_request')" color="primary" icon="mdi-send" v-close-popup
            @click="sendFriendReq(strapi_member.by_user?.contact?.id)"
          />
        </q-card-actions>
      </template>
      <div v-else class="absolute-full column flex-center">
        <q-spinner-orbit
          v-if="addFriendLoading"
          color="primary"
          size="2em"
        />
        <div v-if="addFriendResult" class="">
          {{ $t('send_friend_request_completed') }}
        </div>
      </div>
    </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import {addFriend} from 'src/api/strapi.js'

const { strapi_member, title } = defineProps(['strapi_member', 'title'])

const targetUserAvatar = computed(() => strapi_member.value?.by_user?.wechat_profile?.avatar || strapi_member.value?.by_user?.profile?.avatar?.url)

const addFriendMsg = ref();
const addFriendReqAnswer = ref();
const addFriendResult = ref();
const addFriendLoading = ref(false);

const sendFriendReq = async (contact_id) => {
  addFriendLoading.value = true;
  const params = {
    data: {
      message: addFriendMsg.value,
      contact_id: contact_id,
      request_answer: addFriendReqAnswer.value
    }
  }
  const { data } = await addFriend(params);
  if(data){
    if(data.code === 403){
      $q.notify({
        message: data.message,
        color: 'red',
        position: 'top'
      })
    }else{
      addFriendResult.value = data;
    }
    addFriendLoading.value = false;
    addFriendDlg.value = false;
  }
}

</script>