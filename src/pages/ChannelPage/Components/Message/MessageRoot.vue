<template>
    <div class="fit column no-wrap gap-sm">
        <div
            v-if="!readonlyRef && postIdRef"
            class="q-px-md"
            :class="isDiscoverRef ? 'q-py-sm overflow-hidden border-bottom' : ''"
        >
            <CreateMessage
                :msgId="msgIdRef"
                :postId="postIdRef"
                @messageCreated="messageCreated"
            />
        </div>
        <template v-if="queryMessagesId && messages?.length > 0">
            <div
                id="scroll-target-id"
                class="q-space column no-wrap gap-xs scroll-y"
                :class="postIdRef ? 'q-pa-md' : ''"
            >
                <MessageBody
                    :isDiscover="isDiscoverRef"
                    :messagesItems="messages"
                    :postId="postIdRef"
                    :msgId="msgIdRef"
                    :replyTo="replyTo"
                    :userId="store.userId"
                    @messageCreated="messageCreated"
                    @addReplayTo="addReplayTo"
                    @replyUpdate="replyUpdate"
                />
                <div v-if="hasMoreMsgs" class="">
                    <q-btn
                        unelevated
                        rounded
                        dense
                        flat
                        class="q-px-md q-mb-xs"
                        :class="postIdRef ? 'full-width' : 'q-ml-lg'"
                        color="primary"
                        @click="showMorePost()"
                    >
                        <div class="row items-center gap-xs">
                            <q-icon size="xs" name="mdi-chevron-down" />
                            <span>加载更多</span>
                        </div>
                    </q-btn>
                </div>
                <span
                    v-if="msgIdRef && !hasMoreMsgs"
                    class="column no-wrap gap-sm q-pl-xl q-py-sm caption op-5">
                    没有更多回复了！
                </span>
                <div
                    v-if="postIdRef && !hasMoreMsgs"
                    class="full-width column no-wrap flex-center gap-sm q-py-md caption op-5">
                    已经到底了！
                </div>
            </div>
        </template>
        <div v-if="postIdRef && messages && messages.length == 0" class="fit column flex-center op-5">
            暂无留言
        </div>
    </div>
</template>
<script setup>
    import { findMessages } from "src/apollo/api/api.js";
    import { ref, toRef, watch, nextTick } from "vue";
    import MessageBody from "src/pages/ChannelPage/Components/Message/MessageBody.vue"
    import CreateMessage from "src/pages/ChannelPage/Components/Message/CreateMessage.vue"
    import useUserStore from 'src/stores/user.js';

    const props = defineProps({
        postId: {
            type: String,
            default: ''
        },
        msgId: {
            type: String,
            default: null
        },
        readonly: {
            type: Boolean,
            default: false
        },
        reply: {
            type: Object,
            default: void 0
        },
        isDiscover: {
            type: Boolean,
            default: false
        },
    });
    const emit = defineEmits(['messageCreated', 'replyUpdate']);

    const isDiscoverRef = toRef(props,'isDiscover');
    const postIdRef = toRef(props,'postId');
    const msgIdRef = toRef(props,'msgId');
    const readonlyRef = toRef(props,'readonly');
    const store = useUserStore();

    const infiniteScroll = ref();
    const infiniteScrollReset = () => {
        infiniteScroll.value.reset();
    }

    const postsPage = ref(1);
    const postsPageSize = ref(12);

    const repliesPage = ref(1);
    const repliesPageSize = ref(12);

    const queryMessagesId = ref();
    const messages = ref([]);
    const messages_total = ref();

    const hasMoreMsgs = ref();
    const findMessagesParams = ref({
        "filters": {
            "post": {
                "id": {
                    "eq": null
                }
            },
            "reply_target": {
                "id": {
                    "eq": null
                }
            }
        },
        "pagination": {
            "page": postsPage.value,
            "pageSize": postsPageSize.value,
        },
        "likedByFilters2": {
            "id": {
            "eq": store.userId
            }
        },
        "unlikedByFilters2": {
            "id": {
            "eq": store.userId
            }
        },
        "repliesPagination2": {
            "page": repliesPage.value,
            "pageSize": repliesPageSize.value,
        }
    });
    const queryOptions = ref({
        fetchPolicy: `${postIdRef.value ? 'cache-and-network' : 'network-only'}`,
    })
    const queryPosts = async () => {
        if(!queryMessagesId.value) {
            return
        }
        const {loading: queryLoading, error: queryRrror, result }
            = findMessages(findMessagesParams.value,queryOptions);
        watch(result,() => {
            if(result.value) {
                // 由于GraphQL的获取策略是 cache-and-network，请求条件改变时会自动触发重新请求
                // 因此获取下一页数据只需要增加页面，就会触发请求，所以这里先定义数组，之后直接拼接
                messages_total.value = result.value?.messages.meta.pagination.total;
                messages.value = [...messages.value, ...result.value.messages.data];

                // 内容详情页跳转列表再跳转相同内容详情
                // 未知原因引发用户元数据与频道元数据再次请求，导致findMessagesParams改变
                // 会在此时两次触发findMessages，导致数据重复
                // todo 这里简单去重，需要找到引发再次请求的原因来从根本上解决问题
                messages.value = messages.value.filter((item, index, self) => {
                    return index === self.findIndex((t) => (
                        t.id === item.id
                    ))
                })
                hasMoreMsgs.value = messages_total.value > messages.value?.length;
            }
        },{immediate: true, deep: true});
    };


    function refresh (done) {
        setTimeout(() => {
            refetchPosts();
          done()
        }, 1000)
      }

    watch([postIdRef, msgIdRef], async () => {
        if(postIdRef.value) {
            queryMessagesId.value = postIdRef.value;
            findMessagesParams.value.filters.reply_target = null;
            findMessagesParams.value.filters.post.id.eq = queryMessagesId.value;
        } else {
            queryMessagesId.value = msgIdRef.value;
            findMessagesParams.value.filters.post = null;
            findMessagesParams.value.filters.reply_target.id.eq = queryMessagesId.value;
        }
    },{immediate:true,deep:true});
    
    watch(queryMessagesId, () => {
        if(queryMessagesId.value) {
            queryPosts();
        }
    },{immediate:true,deep:true});

    const showMorePost = async () => {
        // 由于GraphQL的获取策略是 cache-and-network，请求条件改变时会自动触发重新请求
        // 因此获取下一页数据只需要增加页面，就会触发请求，所以这里只需要页码增加即可，无须fetchMore

        // 为何不用fetchMore：fetchMore需要改变请求参数，页码++，会触发请求，
        // 因此在执行fetchMore时，会在执行前自动触发一次页码已经++的内容，再fetchMore一次
        // 造成fetchMore的旧数据其实是新数据，最终数据是两次新数据的拼接

        findMessagesParams.value.pagination.page++;
    };
    watch(messages, () => {
        if(messages.value){
            const emitData = {
                reply_target: msgIdRef.value,
                data: messages.value
            }
            // console.log('replyUpdate', emitData);
            emit('replyUpdate', emitData);
        }
    },{immediate:false,deep:false});

    const replyRef = toRef(props, 'reply');
    watch(replyRef, () => {
        if(replyRef.value && Object.keys(replyRef.value).length > 0) {
            messages.value = [replyRef.value, ...messages.value];
            emit('messageCreated',{
                isreplay: true,
                item: replyRef.value
            })
        }
    },{immediate:false,deep:true});
    const messageCreated = (val) => {
        // console.log('回复消息',val);
        if(val && !val.isreplay){
            messages.value = [val.item, ...messages.value ];
        } else if(val && val.isreplay) {
            const reply_target = val.item.attributes.reply_target.data
            messages.value = messages.value.map((msg) => ({
                ...msg,
                attributes: {
                    ...msg.attributes,
                    replies: {
                        ...msg.attributes.replies,
                        data: msg.id == reply_target.id
                            ? msg.attributes.replies.data?.length > 0 ? [ val.item, ...msg.attributes.replies.data] : [val.item]
                            : msg.attributes.replies.data
                    }
                }
            }))
            console.log('messages',messages.value);
        }
    }

    const replyUpdate = (val) => {
        messages.value = messages.value.map((msg) => ({
            ...msg,
            attributes: {
                ...msg.attributes,
                replies: {
                    ...msg.attributes.replies,
                    data: msg.id == val.reply_target
                        ? val.data
                        : msg.attributes.replies.data
                }
            }
        }))
    }

    const replyTo = ref(null)
    const addReplayTo = (val) => {
        replyTo.value = val
    }

</script>