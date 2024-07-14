<template>
    <div v-if="!mm_projectChatService_team" class="column no-wrap gap-sm">
        <div class="row">
            <q-btn flat dense icon="all_inclusive" label="初始化通讯模块" @click="init_mmFn(userStore.userId)" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";

import { init_mm } from 'src/hooks/chat/useInitChatservice.js'

import localforage from 'localforage';
import useUserStore from 'src/stores/user.js';
const userStore = useUserStore();

const mm_projectChatService_team = computed(() => userStore.me?.mm_projectChatService_team);

// 初始化用户在Mattermost中的的项目管理项目
// 每个用户在注册时都会自动创建一个在Mattermost中的团队
// 该用户每创建一个项目，就在该团队下创建一个频道，用来作为所创建项目的交流频道
// 项目的“讨论”模块，各种操作通过ws来通知其它用户等事件都在该频道中完成
// 如果因为意外原因导致注册时没有创建该Mattermost团队，在此处重新初始化创建
const init_mmFn = async (user_id) => {
    let res = await init_mm(user_id);
    if(res) {
        await localforage.setItem(`__mm_projectChatService_team_${user_id}`,res).then(() => {
        })
    }
}
</script>