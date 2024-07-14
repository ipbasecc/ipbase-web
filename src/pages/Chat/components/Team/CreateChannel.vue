<template>
    <div style="min-width: 640px" @click="name_changing = false">
        <q-card bordered>
            <q-card-section class="row no-wrap items-center gap-sm q-py-sm q-pr-sm border-bottom">
                <span>新建频道</span>
                <q-space />
                <q-btn flat dense size="sm" round icon="close" v-close-popup />
            </q-card-section>
            <q-card-section class="q-pa-lg">
                <div class="border radius-xs q-pa-xs column no-wrap gap-sm">
                    <q-input v-model="parmars.display_name" type="text" square filled outlined autofocus placeholder="输入分组名称" />
                    <q-input
                        v-model="parmars.name" type="text" dense filled square outlined
                        class="text-small"
                        @click.stop="name_changing = true"
                        :rules="[value => /^[0-9a-zA-Z]{6,}$/.test(value) || '仅支持数字、英文字符，最少6位']"
                    >
                        <template v-slot:before>
                            {{`${process.env.APP_URI}/${teamRef.name}/${parmars.name}`}}
                        </template>
                    </q-input>
                    <div class="row no-wrap gap-lg full-width q-pa-md">
                        <div class="radius-sm border-sm border-solid q-space" :class="parmars.type === 'O' ? 'border-primary' : 'border-op-full'">
                            <q-item clickable @click="parmars.type = 'O'" class="radius-sm q-space">
                                <q-item-section avatar>
                                    <q-avatar icon="public" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>公开频道</q-item-label>
                                    <q-item-label caption lines="1">所有成员均可加入</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-icon
                                        :name="parmars.type === 'O' ? 'task_alt' : 'radio_button_unchecked'"
                                        :color="parmars.type === 'O' ? 'green' : 'grey-3'"
                                    />
                                </q-item-section>
                            </q-item>
                        </div>
                        <div class="radius-sm border-sm border-solid q-space" :class="parmars.type === 'P' ? 'border-primary' : 'border-op-full'">
                            <q-item clickable @click="parmars.type = 'P'" class="radius-sm q-space">
                                <q-item-section avatar>
                                    <q-avatar icon="lock_open" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>私密频道</q-item-label>
                                    <q-item-label caption lines="1">仅限邀请加入</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-icon
                                        :name="parmars.type === 'P' ? 'task_alt' : 'radio_button_unchecked'"
                                        :color="parmars.type === 'P' ? 'green' : 'grey-3'"
                                    />
                                </q-item-section>
                            </q-item>
                        </div>
                    </div>
                    <q-input v-model="parmars.purpose" filled type="textarea" />
                </div>
            </q-card-section>
            <q-card-section class="row no-wrap items-center gap-sm q-py-sm q-pr-sm border-top">
                <q-space />
                <q-btn color="primary" padding="xs md" label="创建" @click="createChannelFn()" v-close-popup />
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
import { ref, toRef } from "vue";
import { createChannel } from "src/api/mattermost.js";
import { useQuasar } from "quasar";

const $q = useQuasar();
const props = defineProps({
    team: {
        type: Object,
        default() {
            return {}
        }
    }
});

const teamRef = toRef(props, "team");

const name_changing = ref(false);

function validateInput(inputValue) {
  // 自定义验证规则：只允许数字和英文字符，且长度至少为6
  const regex = /^[0-9a-zA-Z]{6,}$/;
  return regex.test(inputValue);
}

// type - "channels" "custom" "direct_messages" "favorites"
const parmars = ref({
    "team_id": teamRef.value.id,
    "name": "",
    "display_name": "",
    "purpose": "",
    "type": ""
});

const res_info = ref();
const createChannelFn = async () => {
    if(!parmars.value.name) {
        $q.notify('缺少频道名');
        return
    }
    let __ = validateInput(parmars.value.name);
    if(!__) {
        $q.notify('频道名仅支持英文字符、数字，且至少6位');
        return
    }
    let res = await createChannel(parmars.value);
    if (res) {
        res_info.value = res;
    }
};
</script>

<style lang="scss" scoped></style>
