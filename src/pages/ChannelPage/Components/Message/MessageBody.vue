<template>
    <div v-if="props">
        <div v-if="loading" class="full-width q-pa-xl text-caption op-4">数据加载中...</div>
        <div v-else-if="error" class="full-width q-pa-xl text-caption op-4">数据加载出错，请尝试刷新。</div>
        <template v-else>
            <!-- {{ Mesgs }} -->
            <template v-for="i in Mesgs" :key="i.id">
                <template v-if="!deleteMsgIds.includes(i.id)">
                    <q-card bordered flat v-if="isDiscoverRef" class="column no-wrap q-mb-sm">
                        <q-card-section class="q-pb-none">
                            <MessageItem
                                :message="i"
                                :postId="postIdRef"
                                :messageId="i.id"
                                :userId="userIdRef"
                                @addReplayTo="addReplayTo"
                                @MsgDeleted="MsgDeleted"
                            />
                            <!-- 附件 -->
                            <template v-if="i.attributes && i.attributes.attachments && i.attributes.attachments.data.length > 0">
                                <!-- 如果附件图片的数量超过了3个且最后一行没有达到3个，补充对应数量的div -->
                                <template v-for="(i,index) in 3 - i.attributes.attachments.data.length % 3" :key="index">
                                    <div class="post-item" />
                                </template>
                            </template>
                            <!-- 回复 -->
                            <div v-if="userStore.replyTo === i.id && userIdRef" class="q-py-md q-pl-md q-ml-lg q-pr-sm">
                                <CreateMessage
                                    :msgId="i.id"
                                    @messageCreated="messageCreated"
                                    @cannelReply="userStore.replyTo = null"
                                />
                            </div>
                        </q-card-section>
                        <!-- 查看回复按钮 -->
                        <div v-if="userStore.replyTo != i.id" class="q-ml-lg">
                            <q-btn
                                v-if="i.attributes && i.attributes.replies && i.attributes.replies.data.length > 0"
                                unelevated
                                rounded
                                dense
                                flat
                                padding="xs sm"
                                class="q-ml-lg q-mb-xs"
                                color="primary"
                                @click="showReplay(i.id)"
                            >
                                <div class="row items-center gap-xs">
                                    <q-icon size="xs" name="mdi-chevron-down" />
                                    <span>{{hasReply == i.id ? '隐藏' : '查看'}}回复 ({{ i.attributes.replies.data.length }})</span>
                                </div>
                            </q-btn>
                        </div>
                        <div v-if="hasReply == i.id" class="q-ml-lg">
                            <MessageRoot
                                :msgId="i.id"
                                :reply="newReply"
                            />
                        </div>
                        <q-card-actions class="row no-wrap justify-around border-top">
                            <q-btn
                                flat
                                dense
                                class="q-px-md"
                                @click="addReplayTo(i.id)"
                            >
                                <q-icon name="mdi-message-text-outline" size="sm" style="transform: translateY(3px);" />
                                <span class="q-pl-sm">{{ i.attributes.replies.data.length }}</span>
                            </q-btn>
                            <div class="row no-wrap">
                                <SetLike :msgId="i.id" :item="i"/>
                            </div>
                        </q-card-actions>
                    </q-card>
                    <div v-else class="column no-wrap q-ml-lg" :class="isDiscoverRef ? 'q-pl-md' : 'q-py-sm'">
                        <MessageItem
                            :message="i"
                            :messageId="i.id"
                            :postId="postIdRef"
                            :userId="userIdRef"
                            @addReplayTo="addReplayTo"
                            @MsgDeleted="MsgDeleted"
                        />
                        <template v-if="i.attributes && i.attributes.attachments && i.attributes.attachments.data.length > 0">
                            <!-- 如果附件图片的数量超过了3个且最后一行没有达到3个，补充对应数量的div -->
                            <template v-for="(i,index) in 3 - i.attributes.attachments.data.length % 3" :key="index">
                                <div class="post-item" />
                            </template>
                        </template>
                        <div v-if="userStore.replyTo === i.id && userIdRef" class="q-px-md q-py-xs q-ml-lg">
                            <CreateMessage
                                :msgId="i.id"
                                @messageCreated="messageCreated"
                                @cannelReply="userStore.replyTo = null"
                            />
                        </div>
                        <div v-if="userStore.replyTo != i.id">
                            <q-btn
                                v-if="i.attributes && i.attributes.replies && i.attributes.replies.data.length > 0"
                                unelevated
                                rounded
                                dense
                                flat
                                padding="xs sm"
                                color="primary"
                                style="margin-left: 20px;"
                                @click="showReplay(i.id)"
                            >
                                <div class="row items-center gap-xs">
                                    <q-icon size="xs" name="mdi-chevron-down" />
                                    <span>{{hasReply == i.id ? '隐藏' : '查看'}}回复 ({{ i.attributes.replies.data.length }})</span>
                                </div>
                            </q-btn>
                        </div>
                        <template v-if="hasReply == i.id">
                            <MessageRoot
                                :msgId="i.id"
                                :reply="newReply"
                            />
                        </template>
                    </div>
                </template>
            </template>
        </template>
    </div>
</template>

<script setup>
import { ref, toRef, watch } from 'vue'
import MessageRoot  from "src/pages/ChannelPage/Components/Message/MessageRoot.vue";
import MessageItem  from "src/pages/ChannelPage/Components/Message/MessageItem.vue";
import CreateMessage from "src/pages/ChannelPage/Components/Message/CreateMessage.vue";
import SetLike from 'src/pages/ChannelPage/Components/Message/SetLike.vue';
    import useUserStore from 'src/stores/user.js';


const props = defineProps({
    messagesItems: {
        type: Object,
        default() {
            return {}
        }
    },
    postId: {
        type: String,
        default: null
    },
    msgId: {
        type: String,
        default: null
    },
    userId: {
        type: String,
        default: null
    },
    haveReply: {
        type: Boolean,
        default: false
    },
    isDiscover: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['messageCreated']);

const isDiscoverRef = toRef(props,'isDiscover');
const messagesItemsRef = toRef(props, 'messagesItems');
const postIdRef = toRef(props, 'postId');
const userIdRef = toRef(props, 'userId');

const userStore = useUserStore();

const Mesgs = ref();
watch(messagesItemsRef, () => {
    Mesgs.value = messagesItemsRef.value
},{immediate:true,deep:true});

const newReply = ref();
const messageCreated = (val) => {
    emit('messageCreated', val);
    newReply.value = val.item;
    userStore.replyTo = null;
};
const addReplayTo = (val) => {
    userStore.replyTo = userStore.replyTo == val ? null : val;
    hasReply.value = userStore.replyTo;
}
const hasReply = ref();
const showReplay = (val) => {
    hasReply.value = hasReply.value == val ? null : val;
}
const deleteMsgIds = ref([]);
const MsgDeleted = (val) => {
    deleteMsgIds.value.push(val)
}
</script>