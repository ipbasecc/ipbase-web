<template>
  <div class="q-pa-lg row flex-center">
    <div class="radius-sm border-sm border-solid q-space" :class="$q.dark.mode ? 'border-primary' : 'border-op-full'">
        <q-item clickable @click="updateTheme('dark'),$q.dark.set(true)" class="radius-sm q-space">
            <q-item-section avatar>
                <q-avatar icon="dark_mode" />
            </q-item-section>
            <q-item-section>
                <q-item-label>深色</q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-icon
                    :name="$q.dark.mode ? 'task_alt' : 'radio_button_unchecked'"
                    :color="$q.dark.mode ? 'green' : 'grey-3'"
                />
            </q-item-section>
        </q-item>
    </div>
    <div class="radius-sm border-sm border-solid q-space" :class="!$q.dark.mode ? 'border-primary' : 'border-op-full'">
        <q-item clickable @click="updateTheme('lighter'),$q.dark.set(false)" class="radius-sm q-space">
            <q-item-section avatar>
                <q-avatar icon="dark_mode" />
            </q-item-section>
            <q-item-section>
                <q-item-label>亮色</q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-icon
                    :name="!$q.dark.mode ? 'task_alt' : 'radio_button_unchecked'"
                    :color="!$q.dark.mode ? 'green' : 'grey-3'"
                />
            </q-item-section>
        </q-item>
    </div></div>
</template>

<script setup>
import {} from "vue"
import { updateUserPreferences, deleteUserPreferences } from 'src/api/mattermost.js';
import localforage from "localforage";
// 修改风格
const updateTheme = async (name) => {
    let user_id = localStorage.getItem('mmUserId');
    const parmars = [
        {
            "user_id": user_id,
            "category": "theme",
            "name": "dark",
            "value": "null"
        }
    ]
    if(name === 'dark') {
        await updateUserPreferences(user_id, parmars);
        localforage.setItem('__theme_style_dark',true);
    } else {
        await deleteUserPreferences(user_id, parmars);
        localforage.setItem('__theme_style_dark',false);
    }
};
</script>

<style lang="scss" scoped></style>
