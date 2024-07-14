<template>
<div style="min-width: 40vw;">
    <q-card bordered class="z-max">
        <div class="fit row no-wrap">
            <q-list class="border-right q-pa-xs" style="min-width: 160px;min-height: 36rem;">
                <q-item
                    clickable v-ripple @click="section = 'theme'"
                    class="radius-xs" :class="section === 'theme' ? 'bg-primary' : ''"
                >
                    <q-item-section side>
                        <q-icon name="palette" />
                    </q-item-section>
                    <q-item-section>主题</q-item-section>
                </q-item>
                <q-item
                    clickable v-ripple @click="section = 'avatar'"
                    class="radius-xs" :class="section === 'avatar' ? 'bg-primary' : ''"
                >
                    <q-item-section side>
                        <q-icon name="photo_camera_front" />
                    </q-item-section>
                    <q-item-section>头像</q-item-section>
                </q-item>
                <q-item
                    clickable v-ripple @click="section = 'profile'"
                    class="radius-xs" :class="section === 'profile' ? 'bg-primary' : ''"
                >
                    <q-item-section side>
                        <q-icon name="photo_camera_front" />
                    </q-item-section>
                    <q-item-section>个人资料</q-item-section>
                </q-item>
                <q-item
                    clickable v-ripple @click="section = 'others'"
                    class="radius-xs" :class="section === 'others' ? 'bg-primary' : ''"
                >
                    <q-item-section side>
                        <q-icon name="photo_camera_front" />
                    </q-item-section>
                    <q-item-section>其它</q-item-section>
                </q-item>
            </q-list>
            <div class="fit q-space q-pa-sm">
                <UserTheme v-if="section === 'theme'" />
                <div v-if="section === 'avatar'" class="q-pa-lg column flex-center">
                    <UpdateAvatar />
                </div>
                <UpdateProfile v-if="section === 'profile'" />
                <OtherSetting v-if="section === 'others'" />
            </div>
        </div>
    </q-card>
</div>
</template>

<script setup>
import { ref } from "vue";
import UpdateAvatar from 'src/pages/Chat/components/user/Settings/UpdateAvatar.vue';
import UserTheme from 'src/pages/Chat/components/user/Settings/UserTheme.vue';
import UpdateProfile from 'src/pages/Chat/components/user/Settings/UpdateProfile.vue';
import OtherSetting from 'src/pages/Chat/components/user/Settings/OtherSetting.vue'

const section = ref('theme');

</script>

<style lang="scss" scoped></style>
