<template>
  <q-card bordered :style="$q.screen.gt.sm ? 'width: 62vw; height: 62vh;' : 'width: 100vw; height: 100vh;'" class="column no-wrap">
    <q-card-section class="row no-wrap border-bottom q-pa-sm">
        <div class="q-pl-sm">{{ $t('_with') }} {{ targetDataRef.username }} {{ $t('s_talk') }}</div>
        <q-space />
        <q-btn icon="close" dense size="sm" round v-close-popup />
    </q-card-section>
    <q-card-section v-if="directChannelId" class="q-space no-padding">
        <div class="absolute-full column no-wrap">
            <q-scroll-area
                class="q-space q-px-md"
                ref="scrollAreaRef"
                :thumb-style="thumbStyle"
                :bar-style="barStyle"
            >
                <div v-if="messages" :key="directChannelId" ref="chatBody" class="column no-wrap gap-xl">
                    <template v-for="i in messages" :key="i.id">
                        <div v-if="i.type === ''" class="row no-wrap gap-xs" :class="i.user_id === currentUerId ? 'reverse' : ''">
                            <q-avatar size="48px" font-size="48px">
                                <q-img
                                    :src="i.user_id === currentUerId ? myAvatar : targetAvatar"
                                    :ratio="1"
                                    spinner-color="primary"
                                    spinner-size="28px"
                                />
                            </q-avatar>
                            <div class="column no-wrap gap-xs">
                                <div class="op-5 font-small row" :class="i.user_id === currentUerId ? 'justify-end' : ''">{{ i.user_id === currentUerId ? myName : targetName }}</div>
                                <span class="row" :class="i.user_id === currentUerId ? 'row justify-end' : ''">{{ i.message }}</span>
                            </div>
                        </div>
                        <div v-else class="q-pa-md row no-wrap flex flex-center op-5">
                            <q-separator spaced inset class="q-space" />
                            <span>{{ i.message }}</span>
                            <q-separator spaced inset class="q-space" />
                        </div>
                    </template>
                </div>
            </q-scroll-area>
            <q-toolbar class="border-top">
                <q-input v-model="msg" type="text" :placeholder="$t('send_message')" borderless autogrow class="full-width"
                    @keyup.enter="sendMsg(msg)">
                    <template v-slot:append>
                        <q-btn round dense flat icon="send" @click="sendMsg()" />
                    </template>
                </q-input>
            </q-toolbar>
        </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, toRef, onUnmounted } from "vue";
import {
    getPostsOfChannel,
    getChannelMembers,
    getUser,
    getAvatar,
    getAutoAvatar,
    sendPost,
    createDirect
} from "src/api/mattermost.js";
import useUserStore from 'src/stores/user.js'

import { dom } from 'quasar'
const { height, width } = dom

const props = defineProps({
    targetData: {
        type: Object,
        default() {}
    },
    a: {
        type: String,
        default: ''
    },
    b: {
        type: String,
        default: ''
    }
})

const userStore = useUserStore();
const directChannelId = ref();
const targetDataRef = toRef(props, 'targetData');
const myAvatar = userStore.me.profile?.avatar?.data?.attributes.url || null;
const targetAvatar = targetDataRef.value.profile.avatar.data.attributes.url;
const myName = userStore.me.username;
const targetName = targetDataRef.value.username;
const aRef = toRef(props, 'a');
const bRef = toRef(props, 'b');

let ws;

const createDirectMsg = async () => {
    if(bRef.value) {
        try {
            const res = await createDirect(aRef.value, bRef.value);
            if(res) {
                // console.log('与TA的对话',res);
                directChannelId.value = res.data.id;
                init(directChannelId.value);
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        $q.notify('对方没有启用对话功能')
    }
};

const mmtoken = localStorage.getItem("mmtoken");
const currentUerId = localStorage.getItem("mmUserId");
const messages = ref([]);
const msg = ref();
const wsMsgs = ref([]);

const init = (channel_id) => {
    getMessages();
    // 创建一个websocket客户端
    ws = new WebSocket(
        `wss://${process.env.MM_SITE}/api/v4/websocket?channel_id=${channel_id}`
    );
    // 监听websocket连接事件
    ws.addEventListener("open", () => {
        // 连接成功后，发送一个认证请求，使用您的mattermost用户ID和令牌
        ws.send(
            JSON.stringify({
                seq: 1,
                action: "authentication_challenge",
                data: {
                    token: mmtoken,
                },
            })
        );
    });
    // 监听websocket消息事件
    ws.addEventListener("message", (event) => {
        // 解析收到的消息数据
        const data = JSON.parse(event.data);

        // 判断消息类型
        if (data.event === "posted") {
            // 如果是新消息事件，获取消息内容和频道ID
            const message = JSON.parse(data.data.post);
            const channelId = message.channel_id;

            // 判断是否是您关注的频道
            if (channelId === directChannelId.value) {
                // 如果是，显示消息内容到页面上
                messages.value.push(message);
            }
        }
    });
}

// 定义一个函数来关闭ws连接
const closeWs = () => {
    if (ws) {
        ws.close();
        ws = null;
        console.log("断开ws");
    }
};

createDirectMsg();

// 在组件卸载后执行该函数
onUnmounted(() => {
    closeWs();
    messages.value = [];
    msg.value = ''
});

const scMsgs = ref();
const options = ref('');
const page = ref(0);
const getMessages = async () => {
    options.value = `page=${page.value}`;
    const res = await getPostsOfChannel(directChannelId.value,options.value);
    if (res) {
        scMsgs.value = res.data;
        let obj = res.data;
        // 定义一个空数组来存储新的数组
        let new_array = [];

        // 遍历obj.order数组，对于每个元素，获取其对应的key值
        for (let element of obj.order) {
            let key = element;
            // 如果obj.posts中存在该key值，获取其对应的value内容
            if (obj.posts.hasOwnProperty(key)) {
                let value = obj.posts[key];
                // 将value内容添加到new_array数组中
                new_array.push(value);
            }
            if (obj.order.length === new_array.length) {
                messages.value = new_array.slice().reverse();
            }
        }
    }
};
const members = ref([]);
const getMembers = async () => {
    // 定义一个异步函数来发送请求并获取uid
    const fetchAvatar = async (id) => {
        let avatar;
        try {
            // 使用axios发送get请求，并获取响应
            await getAvatar(id)
                .then((response) => {
                    if (response.data) {
                        (async () => {
                            avatar = asBlob(response.data);
                        })();
                    } else {
                        getAutoAvatar(id)
                            .then((response) => {
                                if (response.data) {
                                    (async () => {
                                        avatar = asBlob(response.data);
                                    })();
                                }
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } catch (error) {
            console.error(error);
        }
        return avatar;
    };
    const fetchUser = async (id) => {
        let user;
        try {
            // 使用axios发送get请求，并获取响应
            await getUser(id)
                .then((response) => {
                    if (response.data) {
                        user = response.data;
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } catch (error) {
            console.error(error);
        }
        return user;
    };

    const res = await getChannelMembers(directChannelId.value);
    if (res) {
        let obj = res.data;
        let member_with_avatar = [];

        for (let member of obj) {
            let member_id = member.user_id;
            member.profile = await fetchUser(member_id);
            // member.avatar = await fetchAvatar(member_id);
            await getAvatar(member_id)
                .then((response) => {
                    if (response) {
                        const blob = new Blob([response], { type: 'image/png' });
                        const url = URL.createObjectURL(blob);
                        member.avatar = `data:image/png;base64, ${Base64.encode(response)}`;
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
            member_with_avatar.push(member);
            if (member_with_avatar.length === obj.length) {
                members.value = member_with_avatar;
            }
        }
    }
};

const parmars = ref({});
const sendMsg = async () => {
    parmars.value = {
        channel_id: directChannelId.value,
        message: msg.value
    }
    const res = await sendPost(parmars.value);
    if (res) {
        animateScroll();
        msg.value = "";
    }
};
const scrollAreaRef = ref(null);
const chatBody = ref();

const animateScroll = () => {
    scrollAreaRef.value.setScrollPosition('vertical', height(chatBody.value), 300)
    // position.value = height(chatBody.value);
}

const thumbStyle = {
    right: '4px',
    borderRadius: '5px',
    backgroundColor: 'rgb(100 100 100)',
    width: '5px',
    opacity: 0.75
};

const barStyle = {
    right: '2px',
    borderRadius: '9px',
    width: '9px',
    opacity: 0
}
</script>

<style lang="scss" scoped></style>

