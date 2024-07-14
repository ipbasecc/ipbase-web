<template>
    <div style="min-width: 640px">
        <q-card bordered>
            <q-card-section class="row no-wrap items-center gap-sm q-py-sm q-pr-sm border-bottom">
                <span>新建分组</span>
                <q-space />
                <q-btn flat dense size="sm" round icon="close" v-close-popup />
            </q-card-section>
            <q-card-section class="q-pa-lg">
                <div class="border radius-xs q-pa-xs">
                    <q-input v-model="parmars.display_name" type="text" square filled outlined autofocus placeholder="输入分组名称" />
                </div>
            </q-card-section>
            <q-card-section class="row no-wrap items-center gap-sm q-py-sm q-pr-sm border-top">
                <q-space />
                <q-btn color="primary" padding="xs md" label="创建" @click="createCategory()" v-close-popup />
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
import { ref, toRef } from "vue";
import { createSidebarCategory } from "src/api/mattermost.js";

const props = defineProps({
    team_id: {
        type: String,
        default: "",
    },
    user_id: {
        type: String,
        default: "",
    },
});

const team_idRef = toRef(props, "team_id");
const user_idRef = toRef(props, "user_id");

// type - "channels" "custom" "direct_messages" "favorites"
const parmars = ref({
    user_id: user_idRef.value,
    team_id: team_idRef.value,
    display_name: '',
    type: "channels",
});

const res_info = ref();
const createCategory = async () => {
    let res = await createSidebarCategory(
        user_idRef.value,
        team_idRef.value,
        parmars.value
    );
    if (res) {
        res_info.value = res;
    }
};
</script>

<style lang="scss" scoped></style>
