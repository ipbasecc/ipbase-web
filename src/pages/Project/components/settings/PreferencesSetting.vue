<template>
    <div v-if="card_settings?.length > 0" class="row gap-md">
        <q-list>
            <template v-if="card_settings">
                <q-item-label header>卡片偏好设置</q-item-label>
                <q-separator spaced inset class="op-5" />
                <q-item v-for="i in card_settings" :key="i.val" tag="label" v-ripple class="radius-sm">
                    <q-item-section>
                        <q-item-label class="font-larger font-bold-600">{{ i.label }}</q-item-label>
                        <q-item-label v-if="i.description" caption lines="2" class="op-7">{{ i.description }}</q-item-label>
                    </q-item-section>
                    <q-item-section avatar>
                        <q-toggle v-model="i.enable" color="green" />
                    </q-item-section>
                </q-item>
            </template>
        </q-list>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { send_MattersMsg } from 'src/hooks/utilits/useSendmsg.js'
import { updateProject } from 'src/api/strapi/project.js'
import useProjectStore from "src/stores/project.js";
import useUserStore from 'src/stores/user.js';
import { useProjectCardPreference } from 'src/hooks/project/useSettingTemplate.js'

const projectStore = useProjectStore();
const userStore = useUserStore();

const preferences = ref(projectStore.project?.preferences);
const card_settings = ref(projectStore.project?.preferences?.card_settings);

const loading = ref(false);
const updatePreferences = async () => {
    preferences.value.card_settings = card_settings.value
    let params = {
        preferences: preferences.value
    }
    try {
        let res = await updateProject(projectStore.project?.id,params);
        if(res?.data) {
            preferences.value = res.data.preferences;
            let chat_Msg = {
                body: `${userStore.me?.username}修改了项目：${projectStore.project?.name}`,
                props: {
                    strapi: {
                        data: {
                            is: 'project',
                            by_user: userStore.userId,
                            project_id: projectStore.project?.id,
                            action: 'projece_preference_Updated',
                            preferences: preferences.value
                        }
                    }
                }
            }
            send_chat_Msg(chat_Msg);
            return res
        }
    } catch (error) {
        console.log(error);
    }
}

watch(card_settings,async() => {
    if(card_settings.value){
        if(loading.value) return
        loading.value = true;
        let res = await updatePreferences();
        if(res){
            loading.value = false;
        }
    }
},{immediate:false,deep:true})

const send_chat_Msg = (MsgContent) => {
  send_MattersMsg(MsgContent)
}

</script>

<style lang="scss" scoped>


</style>