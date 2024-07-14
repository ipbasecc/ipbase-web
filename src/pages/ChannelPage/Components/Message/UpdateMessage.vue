<template>
    <div v-if="matedateRef" class="column q-space gap-xs" :tabindex="matedateRef.id" @keyup.esc="cannelUpdate()">
        <q-input v-model="MsgContent" dense type="text" @keyup.esc="cannelUpdate()">
            <template v-slot:prepend>
                <div class="row no-wrap flex-center">
                    <q-btn dense flat round icon="mdi-file" @click="toggleAttach()">
                        <q-tooltip>
                            附加文件
                        </q-tooltip>
                    </q-btn>
                </div>
            </template>
            <template v-slot:append>
                <q-btn
                    v-if="MsgContent != matedateRef.content || attachmentsCollectionRef != attachments"
                    dense
                    size="sm"
                    flat
                    round
                    icon="check"
                    @click="motifyUpdate()"
                />
                <q-btn v-else dense size="sm" flat round icon="close" @click="cannelUpdate()" />
            </template>
        </q-input>
        <template v-if="attach">
            <div class="q-pa-sm column no-wrap flex-center q-py-lg border radius-xs" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-3'">
                <q-toolbar class="transparent q-mb-sm border-bottom">
                    <q-tabs v-model="attachType" inline-label>
                        <q-tab icon="mdi-plus" label="图片" name="attachments" />
                        <q-tab icon="mdi-plus" label="作品" name="elements" />
                    </q-tabs>
                </q-toolbar>
                <q-tab-panels v-model="attachType" animated class="full-width radius-xs" style="min-height: 200px;">
                    <q-tab-panel name="attachments">
                        <OssUploader
                            ref="OssUploaderComp"
                            :needUpload="needUpload"
                            @filesOfUploaded="filesOfUploaded"
                            @fileWatting="setWattingState"
                            :fullWidth=true
                            :class="'fit'"
                        />
                        <div
                            v-if="fileUploaded"
                            class="absolute-full blur-sm flex flex-center font-bold-600 font-large op-7 q-pa-lg z-fab"
                            :class="$q.dark.mode ? 'bg-black text-white' : 'bg-white text-black'"
                        >上传已完成</div>
                    </q-tab-panel>
                    <q-tab-panel name="elements">
                        <div v-if="attached_elementsOfMotify" class="full-width column">
                            <ListPage :elements="attached_elementsOfMotify" />
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
            </div>
        </template>
    </div>
</template>
<script setup>
    import { ref, toRef, onMounted } from 'vue';
    import { updateMessage, createUploadFile } from 'src/apollo/api/api.js';
    import OssUploader from 'src/components/Utilits/OssUploader.vue';
    import AddElement from 'src/pages/ChannelPage/Elements/Components/AddElement.vue';
    import ListPage from "src/pages/ChannelPage/Elements/ListPage.vue";
    import { useQuasar } from 'quasar';
    
    const $q = useQuasar();
    const props = defineProps({
        matedate: {
            type: Object,
            default() {
                return {}
            }
        },
        attachmentsCollection: {
            type: Array,
            default () {
                return []
            }
        },
        attached_elements: {
            type: Array,
            default () {
                return []
            }
        }
    });
    const emit = defineEmits(['MsgUpdated', 'cannelUpdate', 'newAttachmentUpload']);
    const matedateRef = toRef(props,'matedate');
    const attachmentsCollectionRef = toRef(props,'attachmentsCollection');
    const attached_elementsRef = toRef(props,'attached_elements');
    const attached_elementsOfMotify = ref(attached_elementsRef.value);

    const attachments = ref([]);
    const newAttachments = ref([]);
    const configAttchments = () => {
        attachments.value = [...attachmentsCollectionRef.value, ...newAttachments.value];
    }
    const MsgContent = ref();

    const attach = ref(attachmentsCollectionRef.value.length > 0 || attached_elementsRef.value.length > 0);
    const toggleAttach = () => {
        attach.value = !attach.value
    };
    const attachType = ref(attachmentsCollectionRef.value.length > 0 ? 'attachments' : attached_elementsRef.value.length > 0 ? 'elements' : 'attachments');

    const newElement = ref(false);
    const newElementToParams = ref([]);
    const tmp = ref();
    const closeCreate = (val) => {
        newElement.value = false;
        attached_elementsOfMotify.value.push(val.createElement.data);
        newElementToParams.value = attached_elementsOfMotify.value.map((item) => item.id);
        updateParams.value.attached_elements = newElementToParams.value;
    }

    const cannelUpdate = () => {
        emit('cannelUpdate')
    };
    const wattingState = ref();
    const setWattingState = (val) => {
        wattingState.value = val;
    }
    const needUpload = ref(false);
    const preAction = () => {
        needUpload.value = wattingState.value == 'watting';
    };
    onMounted(() => {
        newElementToParams.value = attached_elementsOfMotify.value.map((item) => item.id);
    })
    const removedItem = ref();
    const removeRelateion = (val) => {
        removedItem.value = val
        attached_elementsOfMotify.value = attached_elementsOfMotify.value.filter((item) => item.id !== val);
        newElementToParams.value = attached_elementsOfMotify.value.map((item) => item.id);
    }
    const updateParams = ref({});
    const {
      mutate: updateMsgMutate,
      onDone: updateMsgOnDone,
      onError
    } = updateMessage(updateParams);

    const updateDate = ref();
    const motifyUpdate = async () => {
        preAction();
        if (wattingState.value == 'watting') {
            setTimeout(() => {
                motifyUpdate();
            }, 200);
        } else {
            try {
                configAttchments();
                updateParams.value.id = matedateRef.value.id;
                updateParams.value.content = MsgContent.value;
                updateParams.value.attachments = attachments.value;
                updateParams.value.attached_elements = attached_elementsOfMotify.value.map((item) => item.id);
                const { data } = await updateMsgMutate();
                updateDate.value = data;
                emit('MsgUpdated',MsgContent.value);
                emit('removed',removedItem.value);
                console.log('发送了更新',MsgContent.value);
                attach.value = false;
            } catch (error) {
                console.log(error);
                if(error == 'ApolloError: 只有超级管理员、作者可以修改当前内容') {
                    $q.notify({
                        message:'您没有修改当前内容的权限！',
                        position:'center',
                        color: 'negative',
                        actions: [
                            { label: '知道了', color: 'yellow', handler: () => { /* ... */ } }
                        ]
                    })
                }
            }
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

    const fileUploaded = ref(false);
    const Response = ref();
    const filesOfUploaded = (val) => {
        configAttchments();
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
            newAttachments.value.push(RespsId);
            emit('newAttachmentUpload', data.createUploadFile.data);
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

    onMounted(() => {
        MsgContent.value = matedateRef.value.content;
    })

</script>