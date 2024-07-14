<template>
      <q-dialog v-model="show_invite" persistent>
        <q-card>
            <q-card-section class="row no-wrap border-bottom">
                <span>邀请成员</span>
                <q-space />
                <q-btn round dense size="sm" icon="close" @click="close" />
            </q-card-section>
            <!-- <q-card-section class="q-pa-sm">
                <q-input v-model="mail_string" type="textarea" placeholder="请在此输入邀请邮件地址，一行一个" />
            </q-card-section> -->
            <q-card-section class="q-px-lg q-py-xl">
                <div class="scorll-x q-pa-md radius-sm border cursor-pointer" @click="copyLink">
                    {{ invite_uri }}
                    <q-tooltip>
                        点击复制邀请链接
                    </q-tooltip>
                </div>
            </q-card-section>
            <!-- <q-card-section class="row no-wrap q-pa-sm">
                <q-btn color="primary" icon="copy" label="复制邀请链接" :disable="loading" @click="copyToClipboard(invite_uri)" />
                <q-space />
                <q-btn color="primary" icon="send" label="发送邀请邮件" />
            </q-card-section> -->
        </q-card>
      </q-dialog>
</template>

<script setup>
import { ref, toRef } from "vue";
import { createInvite, createInviteByEmail } from 'src/api/mattermost.js';
import { copyToClipboard, useQuasar } from 'quasar';

const props = defineProps({
    team_id: {
        type: String,
        default: "",
    },
    team: {
        type: Object,
        default() {
            return {}
        }
    },
})

const emit = defineEmits(['closeInvite']);
const close = () => {
    show_invite.value = false
    emit('closeInvite');
}

const team_idRef = toRef(props,'team_id');
const teamRef = toRef(props,'team');

const mail_string = ref();

const show_invite = ref(true);
const loading = ref(true);
const invite_uri = ref();
const get_invite = async () => {
    let app_uri = 'http://localhost:9000/';
    invite_uri.value = `${app_uri}join?id=${teamRef.value.invite_id}`

    // 重新生成邀请ID，旧ID将作废 - 此处直接使用原有邀请ID即可
    // let res = await createInvite(team_idRef.value);
    // if(res) {
    //     let uri = res.data.invite_id;
    // }

    if(invite_uri.value) {
        loading.value = false
    }
}
get_invite();

const $q = useQuasar();
const copyLink = () => {
    copyToClipboard(invite_uri.value)
    .then(() => {
        $q.notify('链接经复制')
    })
    .catch(() => {
        // fail
    })
}
</script>

<style lang="scss" scoped></style>
