<template>
    <q-dialog v-model="confirmId" persistent>
        <q-card bordered class="confromDlg">
            <q-card-section class="row items-center border-bottom font-bold-600">
                此操作无法恢复！确认删除？
            </q-card-section>
            <q-card-actions class="column no-wrap gap-xs">
                <q-btn class="full-width" label="确认删除" color="negative" v-close-popup @click="motifyDelete()" />
                <q-btn class="full-width" label="取消" color="primary" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
    import { ref, toRef, watch } from 'vue';
    import { deleteMessage } from 'src/apollo/api/api.js';
    import { useQuasar } from 'quasar'
    const $q = useQuasar();

    const props = defineProps({
        matedate: {
            type: Object,
            default() {
                return {}
            }
        }
    });
    const emit = defineEmits(['MsgDeleted'])
    const matedateRef = toRef(props,'matedate');
    const confirmId = ref(true);
    const deleteParams = ref({});
    const {
      mutate: deleteMsgMutate,
      onDone: deleteMsgOnDone,
      onError
    } = deleteMessage(deleteParams);

    const deleteDate = ref();
    const motifyDelete = async () => {
        try {
            deleteParams.value.id = matedateRef.value.id;
            const { data } = await deleteMsgMutate();
            deleteDate.value = data;
            emit('MsgDeleted',matedateRef.value.id);
            $q.notify({
                position: 'top',
                message:'内容已删除',
                timeout:2000
            });
        } catch (error) {
            console.log(error);
            if(error == 'ApolloError: 只有超级管理员、作者可以删除当前内容') {
                $q.notify({
                    message:'您没有删除当前内容的权限！',
                    position:'center',
                    color: 'negative',
                    actions: [
                        { label: '知道了', color: 'yellow', handler: () => { /* ... */ } }
                    ]
                })
            }
        }
    };

    watch(matedateRef,() => {
        if(matedateRef.value) {
            confirmId.value = matedateRef.value.id;
        }
    })

</script>