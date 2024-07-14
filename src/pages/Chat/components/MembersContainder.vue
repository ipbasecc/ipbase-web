<template>
  <div class="absolute-full column no-warp">
    <q-toolbar class="border-bottom" :class="$q.dark.mode ? 'bg-grey-10' : 'bg-white'">
      <span class="font-large">频道成员：</span>
      <q-space />
      <q-btn color="primary" flat round dense icon="add" @click="add_user_dialog = !add_user_dialog">
      </q-btn>
    </q-toolbar>
    <q-scroll-area class="q-space">
      <q-list v-if="channel_members" class="p-none">
        <template v-if="channel_members.admins?.length > 0">
          <q-item-label header>频道管理员</q-item-label>
          <template v-for="i in channel_members.admins" :key="i.user_id">
            <q-item class="hovered-item">
              <q-item-section avatar>
                <UserAvatar
                    :user_id="i.user_id"
                    :size="32"
                    :status="i.profile.status"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ i.profile.nickname || i.profile.username }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn color="primary" flat dense size="sm" padding="xs sm" icon-right="expand_more" label="管理员">
                  <q-menu>
                    <q-list style="min-width: 100px">
                      <q-item clickable v-close-popup @click="toggle_admin(i,'user')">
                        <q-item-section>设为成员</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-item-section>
            </q-item>
          </template>
        </template>
        <template v-if="channel_members.users?.length > 0">
          <q-item-label header>频道成员</q-item-label>
          <template v-for="i in channel_members.users" :key="i.user_id">
            <q-item class="hovered-item">
              <q-item-section avatar>
                <UserAvatar
                    :user_id="i.user_id"
                    :size="32"
                    :status="i.profile.status"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ i.profile.nickname || i.profile.username }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn color="primary" flat dense size="sm" padding="xs sm" icon-right="expand_more" label="成员">
                  <q-menu>
                    <q-list style="min-width: 100px">
                      <q-item clickable v-close-popup @click="toggle_admin(i,'admin')">
                        <q-item-section>设为管理员</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="RemoveUserFromChannelFn(i.user_id)">
                        <q-item-section>移出用户</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-item-section>
            </q-item>
          </template>
        </template>
        <template v-if="channel_members.guests?.length > 0">
          <q-item-label header>频道访客</q-item-label>
          <template v-for="i in channel_members.guests" :key="i.user_id">
            <q-item class="hovered-item">
              <q-item-section avatar>
                <UserAvatar
                    :user_id="i.user_id"
                    :size="32"
                    :status="i.profile.status"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ i.profile.nickname || i.profile.username }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn color="primary" flat dense size="sm" padding="xs sm" icon-right="expand_more" label="访客">
                  <q-menu>
                    <q-list style="min-width: 100px">
                      <q-item clickable v-close-popup @click="toggle_admin(i,'user')">
                        <q-item-section>设为成员</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-item-section>
            </q-item>
          </template>
        </template>
      </q-list>
      <!-- {{ mm_wsStore?.log }} -->
    </q-scroll-area>
    <q-dialog v-model="add_user_dialog">
      <q-card>
        <!-- {{ searched_members }} -->
        <q-card-section class="row items-center">
            <q-input v-model="search_text" type="text" outlined>
                <template v-slot:prepend>
                    <div class="row">
                        <q-chip
                            v-for="(i,index) in selected_for_batchAdd"
                            :key="i.user_id"
                            dense
                            removable
                            @remove="selected_for_batchAdd.splice(index,1)"
                        >
                            <UserAvatar
                                :user_id="i.id"
                                :size="22"
                                :status="i.profile.status"
                            />
                            {{ i.nickname || i.username }}
                        </q-chip>
                    </div>
                </template>
                <template v-slot:append>
                    <q-btn color="primary" dense padding="xs sm" class="text-no-wrap" label="加入" @click="batch_add()" />
                </template>
            </q-input>
        </q-card-section>
        <q-card-section>
          <!-- {{ searched_members }} -->
          <q-list v-if="searched_members" bordered>
            <q-item v-for="i in searched_members" :key="i.user_id">
              <q-item-section avatar>
                <UserAvatar
                    :user_id="i.id"
                    :size="32"
                    :status="i.status"
                />
              </q-item-section>
              <q-item-section>
                {{ i.nickname || i.username }}
              </q-item-section>
              <q-item-section side>
                <q-btn flat round desne size="sm" icon="check" @click="selected_for_batchAdd.push(i)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, toRef, watch } from "vue";
import useMmStore from 'src/stores/mmstore.js';
import { RemoveUserFromChannel, getChannelMembers, changeChannelRoles_for_member, getUsersByIDs, addMemberToChannel,searchMember,getUserStatusBy_ids } from "src/api/mattermost.js";

import useMmws from 'src/stores/mmws.js';
const mm_wsStore = useMmws();

import UserAvatar from 'src/pages/Chat/components/wigets/UserAvatar.vue'

const props = defineProps({
  channel_id: {
    type: String,
    default: ''
  }
})

const mmStore = useMmStore();
const channel_idRef = toRef(props,'channel_id');


const admins = ref([]);
const users = ref([]);
const guests = ref([]);
const channel_members = ref();
const attach_profile_useIds = async (res) => {
  let members = res.data
  let arr = []
  let resps = await getUsersByIDs(res.data.map(i => i.user_id));
  if(resps) {
    for (let user of members) {
      user.profile = resps.data.find(i => i.id === user.user_id);
      arr.push(user)
    }
    if(arr.length === resps.data.length){
      console.log(members);
      return members
    }
  }
}
const getChannelMembersFn = async () => {
  let res = await getChannelMembers(channel_idRef.value);
  if(res) {
    // const members_with_profile = await attach_profile_useIds(res);
    // if(members_with_profile) {
    //   channel_members.value = category_members(members_with_profile);
    // }
    channel_members.value = res.data
    let resps = await getUsersByIDs([...new Set(res.data.map(i => i.user_id))]);
    let _status = await getUserStatusBy_ids([...new Set(res.data.map(i => i.user_id))]);
    if(resps && _status) {
      for (let user of channel_members.value) {
        user.profile = resps.data.find(i => i.id === user.user_id);
        user.profile.status = _status.find(i => i.user_id === user.user_id)
      }
      category_members(channel_members.value);
    }
  }
}
getChannelMembersFn();
const category_members = (members) => {
  let arr = members;
  admins.value = arr.filter(i => i.scheme_admin && i.scheme_user);
  users.value = arr.filter(i => !i.scheme_admin && i.scheme_user);
  guests.value = arr.filter(i => i.scheme_guest);
  channel_members.value = {
    admins: admins.value,
    users: users.value,
    guests: guests.value,
  };
}

const toggle_admin = async (user,role) => {
  let parmars = {
    "scheme_user": false,
    "scheme_admin": false
  }
  if(role === 'admin') {
    parmars.scheme_user = true;
    parmars.scheme_admin = true;
  }
  if(role === 'user') {
    parmars.scheme_user = true;
    parmars.scheme_admin = false;
  }
  let res = await changeChannelRoles_for_member(channel_idRef.value, user.user_id, parmars);
  if(res) {
    getChannelMembersFn();
  }
}

const RemoveUserFromChannelFn = async (user_id) => {
  let res = await RemoveUserFromChannel(channel_idRef.value,user_id);
  if(res) {
    // getChannelMembersFn();
  }
}

//监听wss获取新消息
watch(mm_wsStore, () => {
    // 判断消息类型
    if (mm_wsStore?.event?.event === "channel_member_updated") {
      getChannelMembersFn();
    }
    if (
      mm_wsStore?.event?.event === "user_removed"
      || mm_wsStore?.event?.event === "user_added"
    ) {
      getChannelMembersFn();
    }
},{immediate:true,deep:true})

const add_user_dialog = ref(false);
const search_text = ref('');
const search_res = ref();
const searched_members = ref();
const search_member = async () => {
  if(!search_text.value) return
  let params = {
    "term": search_text.value,
    "team_id": localStorage.getItem('mmActiveTeamID')
  }
  let res = await searchMember(params);
  if(res) {
    search_res.value = res.data;
    return res
  }
}

// 延迟搜索用户
let timer = null;
watch(search_text, () => {
  if(search_text.value && search_text.value != ''){
    // 清除之前的计时器
    if (timer) {
      clearTimeout(timer);
    }
    // 设置新的计时器
    timer = setTimeout(async() => {
      let res = await search_member();
      if(res?.data) {
        let arr = res.data;
        let _ids = arr.map(i => i.id);
        let _status = await getUserStatusBy_ids([...new Set(_ids)]);
        // console.log(_status);

        if(_status) {
          for (let user of arr) {
            user.status = _status.find(i => i.user_id === user.id);
          }
        }
        searched_members.value = arr;
        // console.log(searched_members.value);
      }
    }, 600);
  } else {
    searched_members.value = null;
  }
},{immediate:false,deep:false})

const selected_for_batchAdd = ref([]);
const batch_add = async () => {
  let arr = [];
  let members_waitting = selected_for_batchAdd.value;
  for ( let user of members_waitting) {
    let parmars = {
      "user_id": user.id
    }

    let res = await addMemberToChannel(channel_idRef.value,parmars);
    if(res) {
      console.log(res.data);
      arr.push(res.data);
    }
    if(arr.length === members_waitting.length){
      return 'OK'
    }
  }
}

</script>

<style lang="scss">
.p-none .q-btn--dense .on-right {
    margin-left: 0;
}
</style>
