<template>
    <div style="min-width: 640px;">
    <q-card bordered>
        <q-toolbar class="transparent border-bottom">
            <span>选择群聊用户</span>
            <q-space />
            <q-btn flat dense size="sm" round icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="border-bottom">
            <q-input outlined>
                <template v-slot:prepend>
                    <div class="row">
                        <q-chip
                            v-for="(i,index) in selected_members"
                            :key="i.user_id"
                            dense
                            removable
                            @remove="selected_members.splice(index,1)"
                        >
                            <UserAvatar
                                :user_id="i.user_id"
                                :size="22"
                            />
                            {{ i.profile?.nickname || i.profile?.username }}
                        </q-chip>
                    </div>
                </template>
                <template v-slot:append>
                    <q-btn color="primary" dense padding="xs sm" class="text-no-wrap" label="发起群聊" @click="createGroupFn" />
                </template>
            </q-input>
        </q-card-section>
        <q-card-section class="q-pa-xs">
            <q-list>
                <template v-for="(i,index) in team_members" :key="i.user_id">
                    <q-item :class="index === 0 ? '' : 'border-top'">
                        <q-item-section avatar>
                            <UserAvatar
                                :user_id="i.user_id"
                                :size="36"
                            />
                        </q-item-section>
                        <q-item-section>{{ i.profile?.nickname || i.profile?.username }}</q-item-section>
                        <q-item-section side>
                            <q-btn
                                v-if="!selected_members_ids.includes(i.user_id)"
                                flat dense size="xs"
                                icon="check"
                                class="text-no-wrap"
                                @click="selected_members.push(i)"
                            />
                            <q-icon v-else name="check" color="green" />
                        </q-item-section>
                    </q-item>
                </template>
            </q-list>
        </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, toRef, watchEffect } from "vue";
import { getMembersByTeamID, getUsersByIDs, createGroup } from 'src/api/mattermost.js';
import UserAvatar from 'src/pages/Chat/components/wigets/UserAvatar.vue';

import mmMmUserStore from 'src/stores/mmuser.js';
const mmUserStore = mmMmUserStore();

const props = defineProps({
    team_id: {
        type: String,
        default: ''
    }
})

const team_idRef = toRef(props,'team_id');

const page = ref(0);
const per_page = ref(60);
const team_members = ref();
const getTeamMembers = async () => {
  let res = await getMembersByTeamID(team_idRef.value,page.value,per_page.value);
  if (res) {
    team_members.value = res.data;
    if(res.data.length === 0) return;
    let resps = await getUsersByIDs(res.data.map(i => i.user_id));
    if(resps) {
      for (let user of team_members.value) {
        user.profile = resps.data.find(i => i.id === user.user_id);
      }
      mmUserStore.members = team_members.value;
      return team_members.value
    }
  }
}
getTeamMembers();

const fetchMore_members = async () => {
    let old_members = team_members.value;
    page.value++
    let res = await getTeamMembers();
    if(res) {
        team_members.value = [...team_members.value, ...old_members]
    }
}

const selected_members = ref([]);
const selected_members_ids = ref([]);
watchEffect(() => {
    selected_members_ids.value = selected_members.value.map(i => i.user_id);
})

const emit = defineEmits(['group_created'])
const createGroupFn = async () => {
    let res = await createGroup(selected_members_ids.value);
    if(res) {
        emit('group_created')
    }
}

</script>

<style lang="scss" scoped>
.q-field__control {
    height: auto;
}
</style>
