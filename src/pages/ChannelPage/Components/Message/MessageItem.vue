<template>
    <div v-if="MsgDeletedId != msgItem.id" class="row no-wrap gap-sm q-px-sm hovered-item">
        <AutoAvatar :attributes="msgItem.sender?.attributes" :size="postIdRef ? 36 : 28" :imgRouter="true" />
        <div class="column no-wrap gap-xs q-space">
            <div class="column no-wrap">
                <div
                    :class="!postIdRef ? 'row' : 'column'"
                >
                    <div class="font-medium font-bold-500" :class="!postIdRef ? '' : ' q-mr-sm'">
                        {{ !postIdRef ? '' : `${msgItem.username} :` }}
                    </div>
                    <div class="row no-wrap q-space">
                        <div v-if="updateMsgId != msgItem.id" class="font-medium q-space cursor-pointer"
                            @click.stop="toggleReply(messageIdRef)"
                            @keyup.esc.stop="cannelReply()"
                        >
                            {{ msgItem.content }}
                        </div>
                        <UpdateMessage
                            v-if="updateMsgId == msgItem.id && userIdRef == msgItem.msgOwnId"
                            :matedate="msgItem"
                            :attachmentsCollection="attachmentsCollection"
                            :attached_elements="msgItem.attached_elements"
                            @MsgUpdated="MsgUpdated"
                            @removed="removeRelateion"
                            @cannelUpdate="toggleUpdateMsg(msgItem.id)"
                            @newAttachmentUpload="newAttachmentUpload"
                        />
                        <div v-if="userIdRef == msgItem.msgOwnId" class="flex flex-center">
                            <q-btn dense size="sm" round flat icon="mdi-dots-vertical" class="hover-show transition">
                                <q-menu class="radius-sm">
                                    <q-list dense style="min-width: 120px" class="q-pa-xs">
                                        <q-item clickable v-close-popup @click="toggleUpdateMsg(msgItem.id)" class="radius-xs">
                                            <q-item-section>{{ updateMsgId ? '放弃修改' : '修改' }}</q-item-section>
                                        </q-item>
                                        <q-item clickable v-close-popup @click="deleteMsgId = msgItem.id" class="radius-xs">
                                            <q-item-section>删除</q-item-section>
                                        </q-item>
                                    </q-list>
                                </q-menu>
                            </q-btn>
                        </div>
                    </div>
                </div>
                <div class="text-caption op-5">{{ date.formatDate(msgItem.publishedAt, 'YYYY/MM/DD - HH:mm') }}</div>
            </div>
            <div
                v-if="msgItem.attachments.length && !updateMsgId"
                class="radius-sm overflow-hidden row justify-between post-container"
                :style="!postIdRef || msgItem.attachments.length < 3 ? 'max-width: 66%;' : ''"
            >
                <template v-for="(file,index) in msgItem.attachments" :key="index">
                    <div
                        v-if="attachmentsCollection.includes(file.id)"
                        class="relative-position"
                        :class="
                            `${msgItem.attachments.length > 3 
                                && msgItem.attachments.length % 3 == 0 
                                    && (index + 1) > (msgItem.attachments.length - 3) ? 'post-item'
                                : msgItem.attachments.length > 3
                                    && msgItem.attachments.length % 3 != 0
                                    && (index + 1) > (msgItem.attachments.length - msgItem.attachments.length % 3) ? 'post-item'
                                    : msgItem.attachments.length < 4 ? 'q-space gap-xs' : 'post-item q-pb-xs'}
                            `
                        "
                        >
                        <FileViewer
                            :file="msgItem.attachments[index].attributes"
                            @click="getPVurls(msgItem.attachments),$hevueImgPreview({multiple: true,nowImgIndex: index,imgList: urls})"
                        />
                        <div
                            v-if="updateMsgId == msgItem.id"
                            class="absolute-full op-6 flex flex-center"
                            :class="$q.dark.mode ? 'bg-black text-white' : 'bg-white text-black'"
                        >
                            <q-btn icon="close" round dense color="black" @click="configAttchments(file.id)" />
                        </div>
                    </div>
                </template>
            </div>
            <div v-if="attached_elements.length && !updateMsgId" class="column">
                <ListPage :elements="msgItem.attached_elements" />
            </div>
            <DeleteMessage
                v-if="deleteMsgId == msgItem.id"
                :matedate="msgItem"
                @MsgDeleted="MsgDeleted"
            />
        </div>
    </div>
  </template>
  
  <script setup>
    import { ref, toRef, watch } from 'vue';
    import { date } from 'quasar';
    import FileViewer from "src/components/VIewComponents/FileViewer.vue"
    import UpdateMessage from "src/pages/ChannelPage/Components/Message/UpdateMessage.vue"
    import DeleteMessage from "src/pages/ChannelPage/Components/Message/DeleteMessage.vue"
    import AutoAvatar from 'src/components/VIewComponents/AutoAvatar.vue';
    import ListPage from "src/pages/ChannelPage/Elements/ListPage.vue";

    const props = defineProps({
        message: {
            type: Object,
            default() {
                return {}
            }
        },
        postId: {
            type: String,
            default: null
        },
        messageId: {
            type: String,
            default: null
        },
        userId: {
            type: String,
            default: null
        },
        isMsg: {
            type: Boolean,
            default: false
        },
    })
    const emit = defineEmits(['addReplayTo','MsgDeleted'])
    const toggleReply = (val) => {
        emit('addReplayTo',val)
    };
    const cannelReply = () => {
        emit('addReplayTo',null)
    }
    const postIdRef = toRef(props,'postId');
    const messageIdRef = toRef(props,'messageId');
    const messageRef = toRef(props,'message');
    const userIdRef = toRef(props,'userId');
    const attached_elements = ref([]);
    const msgItem = ref({
        id: messageRef.value.id,
        sender: messageRef.value.attributes.sender?.data || null,
        username: messageRef.value.attributes.sender.data?.attributes.username,
        avatar: messageRef.value.attributes.sender.data?.attributes.profile?.avatar.data?.attributes.url || null,
        bio: messageRef.value.attributes.sender.data?.attributes.profile?.bio,
        like: messageRef.value.attributes.like,
        unlike: messageRef.value.attributes.unlike,
        liked: messageRef.value.attributes.liked,
        unliked: messageRef.value.attributes.unliked,
        content: messageRef.value.attributes.content,
        attachments: messageRef.value.attributes.attachments?.data,
        publishedAt: messageRef.value.attributes.publishedAt,
        attached_elements:  messageRef.value.attributes.attached_elements?.data,
        msgOwnId:  messageRef.value.attributes.sender?.data?.id
    });

    const attachmentsCollection = ref(msgItem.value.attachments && msgItem.value.attachments.map(item => item.id));
    const configAttchments = (val) => {
        const newArr = attachmentsCollection.value.filter(num => num !== val);
        attachmentsCollection.value = newArr;
    }
    const replyCreated = () => {
        setTimeout(() => {
            refetchReplys()
        }, 100);
    }

    const urls = ref();
    const getPVurls = (val) => {
        urls.value = val.map((item) => item.attributes.url);
    };

    const updateMsgId = ref();
    const deleteMsgId = ref();
    const toggleUpdateMsg = (val) => {
        updateMsgId.value = updateMsgId.value == val ? null : val
    };
    const MsgUpdated = (val) => {
        console.log('接收到更新',val);
        msgItem.value.content = val;
        toggleUpdateMsg();
    }
    const MsgDeletedId = ref();
    const MsgDeleted = (val) => {
        console.log('接收到删除',val);
        MsgDeletedId.value = val;
        emit('MsgDeleted',val)
    }
    const getAttach = ref();
    const newAttachmentUpload = (val) => {
        getAttach.value = val; // tmp

        let newObj = {};
        let newArr = [];
        newObj = getAttach.value;
        console.log(newObj);
        newArr.push(newObj);
        console.log(newArr);

        let arr = msgItem.value.attachments;
        msgItem.value.attachments = [...arr, ...newArr];
        attachmentsCollection.value = msgItem.value.attachments.map(item => item.id);
    }
    const removeRelateion = (val) => {
        msgItem.value.attached_elements = msgItem.value.attached_elements.filter((item) => item.id !== val);
    }
  </script>
<style scoped>
    .post-container {
    display: flex;
    flex-wrap: wrap;
    }

    .post-item {
    flex-basis: calc(100% / 3 - 3px);
    }

</style>