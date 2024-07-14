<template>
    <q-card flat class="full-width">
        <q-card-section class="q-py-xs q-px-none">
            <q-input
                v-if="user && user.username"
                v-model="messageContent"
                square
                dense
                autogrow
                :autofocus="showCreateForm ? true : false"
                :disable="!user.username"
                placeholder="在此输入发布内容"
                type="text"
                class="full-width"
                :class="showCreateForm ? '' : 'op-5'"
                @keyup.esc="cannelCreate"
                @keyup.ctrl.enter="newMessage()"
                @blur="showCreateForm = false"
                @click="showCreateForm = true"
                >
                <template v-slot:before>
                    <div class="row no-wrap flex-center">
                        <AutoAvatar :imgRouter="true" :size="postIdRef ? 36 : 28" :attributes="store.me" />
                    </div>
                </template>
                <template v-slot:prepend>
                    <div class="row no-wrap flex-center">
                        <q-btn dense flat round :icon="fileUploaded ? 'mdi-file' : 'mdi-file-outline'" @click="toggleAttach()">
                            <q-tooltip>
                                附加文件
                            </q-tooltip>
                        </q-btn>
                    </div>
                </template>
                <template v-slot:append>
                    <q-btn v-if="messageContent || attachments.length > 0 || newElementToParams.length > 0" dense flat round icon="mdi-plus" @click="newMessage()">
                        <q-tooltip>
                            Ctrl + 回车
                        </q-tooltip>
                    </q-btn>
                    <q-btn v-if="showCreateForm && !messageContent" dense flat round icon="mdi-close" @click="cannelCreate()" >
                        <q-tooltip>
                            ESC
                        </q-tooltip>
                    </q-btn>
                </template>
            </q-input>
        </q-card-section>
        <q-card-section v-if="attach" class="q-pa-sm column flex-center q-py-lg" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-3'">
            <q-toolbar class="transparent q-mb-sm border-bottom">
                <q-tabs v-model="attachType" inline-label>
                    <q-tab icon="mdi-plus" label="图片" name="attachments" />
                    <q-tab icon="mdi-plus" label="作品" name="elements" />
                </q-tabs>
            </q-toolbar>
            <q-tab-panels v-model="attachType" animated class="full-width">
                <q-tab-panel name="attachments">
                    <OssUploader
                        ref="OssUploaderComp"
                        :needUpload="needUpload"
                        :class="'fit'"
                        @filesOfUploaded="filesOfUploaded"
                        @fileWatting="setWattingState"
                    />
                    <div
                        v-if="fileUploaded"
                        class="absolute-full blur-sm flex flex-center font-bold-600 font-large op-7 q-pa-lg z-fab"
                        :class="$q.dark.mode ? 'bg-black text-white' : 'bg-white text-black'"
                    >上传已完成</div>
                </q-tab-panel>
                <q-tab-panel name="elements">
                    <div v-if="newElements" class="full-width row">
                        <ListPage :elements="newElements" />
                        <div class="q-pa-xs col-4 flex flex-center q-my-xl">
                            <q-btn color="primary" flat padding="lg" icon="mdi-plus" class="border" @click="newElement = !newElement" />
                        </div>
                    </div>
                    <q-dialog v-model="newElement" class="z-fab" persistent full-width transition-show="slide-down" transition-hide="slide-down">
                        <!-- <CreateMaster @createdItem="createdItem" @created="created" /> -->
                        <q-card bordered>
                            <AddElement @closeCreate="closeCreate" />
                        </q-card>
                    </q-dialog>
                </q-tab-panel>
            </q-tab-panels>
        </q-card-section>
        <q-dialog v-model="warring" persistent>
            <q-card>
                <q-card-section class="q-pa-xs row items-center gap-sm text-large text-bold-600">
                    注意：
                </q-card-section>
                <q-card-section class="q-pa-xs row items-center gap-sm">
                    {{ warringtitle }}
                </q-card-section>
                <q-card-section class="q-pa-xs row items-center gap-sm border-top">
                    <q-btn color="primary" dense flat class="q-px-md" label="确认放弃新建" @click="skipWarring = true,cannelCreate" />
                    <q-space />
                    <q-btn color="primary" dense class="q-px-md" label="返回查看" @click="warring = false" />
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-card>
</template>
<script setup>
    import { onMounted, ref, toRef, watch } from 'vue';
    import { createMessage, createUploadFile } from 'src/apollo/api/api.js';
    import useUserStore from 'src/stores/user.js';
    import OssUploader from 'src/components/Utilits/OssUploader.vue'
    import AddElement from 'src/pages/ChannelPage/Elements/Components/AddElement.vue';
    import ListPage from "src/pages/ChannelPage/Elements/ListPage.vue";
    import AutoAvatar from 'src/components/VIewComponents/AutoAvatar.vue';

    const props = defineProps({
        postId: {
            type: String,
            default: ''
        },
        msgId: {
            type: String,
            default: null
        }
    });
    const store = useUserStore();
    const OssUploaderComp = ref();
    const user = ref({});
    onMounted(() => {
        watch(store,()=> {
            if(store.me && store.me){
                user.value.username = store.me.username || null,
                user.value.avatar = store.me.profile?.avatar.data?.attributes.url || null
            }
        },{immediate:true,deep:true});
        
    })
    const emit = defineEmits(['messageCreated','cannelReply'])
    const postIdRef = toRef(props,'postId');
    const msgIdRef = toRef(props,'msgId');

    const messageContent = ref();
    const createParams = ref({});
    const {
      mutate: createMessageMutate,
      onDone: createMessageOnDone,
      onError
    } = createMessage(createParams);

    const newMsg = ref()
    const attachments = ref([]);
    const fileUploaded = ref(false);
    const wattingState = ref();
    const setWattingState = (val) => {
        wattingState.value = val;
    }
    const needUpload = ref(false);
    const preAction = () => {
        needUpload.value = wattingState.value == 'watting';
    };

    const newElement = ref(false);
    const newElementToParams = ref([]);
    const newElements = ref([]);
    const tmp = ref();
    const closeCreate = (val) => {
        newElement.value = false;
        tmp.value = val;
        newElementToParams.value.push(val.createElement.data.id);
        newElements.value.push(val.createElement.data);
    }

    const newMessage = async () => {
        preAction();
        if (wattingState.value == 'watting') {
            setTimeout(() => {
                newMessage();
            }, 200);
        } else {
            createParams.value = {
                content: messageContent.value,
                publishedAt: new Date().toISOString(),
                sender: store.userId,
                attachments: attachments.value,
                attached_elements: newElementToParams.value,
            };
            if(postIdRef.value) {
                createParams.value.post = postIdRef.value;
            } else {
                createParams.value.reply_target = msgIdRef.value;
            }

            const { data } = await createMessageMutate();

            newMsg.value = data.createMessage.data;
            let obj = { isreplay: postIdRef.value ? true : false, item: newMsg.value}
            emit('messageCreated', obj);
            messageContent.value = '';
            showCreateForm.value = false;
            attach.value = false;
            wattingState.value = null;
            fileUploaded.value = false;
        }
    }

    const showCreateForm = ref(false);
    const warring = ref(false);
    const skipWarring = ref(false);
    const warringtitle = ref();
    const cannelCreate = () => {
        showCreateForm.value = false;
        messageContent.value = '';
        attach.value = false;
        emit('cannelReply')
    };

    const attach = ref();
    const attachType = ref('attachments');
    const toggleAttach = () => {
        attach.value = !attach.value;
        if(attach.value) {
            showCreateForm.value = msgIdRef.value;
        }
    };

    const uploadFileParams = ref({
        url: '',
        name: '',
        size: '',
        ext: '',
        caption: '',
        hash: '',
        mime: '',
        provider: '',
        folderPath: '/',
    });
    const {
      mutate: uploadFileMutate,
      onDone: uploadFileOnDone,
      onError: uploadFileonError
    } = createUploadFile(uploadFileParams);


    const filesOfUploaded = (val) => {
        let arr = val;

        Response.value = arr.map(item => {
            const newUrl = item.url.res.requestUrls[0].split('?')[0];
            return {
                ...item,
                url: newUrl
            };
        });

        let newArr = Response.value;
        let count = 0;
        let maxCount = val.length;

        const upload = async (file) => {
            uploadFileParams.value = file;
            const { data } = await uploadFileMutate();
            let RespsId = data.createUploadFile.data.id;
            attachments.value.push(RespsId);
            count++;
            if(count < maxCount) {
                upload(newArr[count]);
            } else {
                setTimeout(() => {
                    fileUploaded.value = true;
                }, 600);
            }
        };
        upload(newArr[count]);
    }


</script>