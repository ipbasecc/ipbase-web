<template>
    <q-list class="q-pa-md">
        <q-item-label class="q-mb-sm">{{ $t(tip) }}</q-item-label>
        <q-item
            v-for="(i,index) in downloadFiles"
            :key="index"
            class="border-bottom"
        >
            <q-item-section side>
                <q-icon name="mdi-attachment" />
            </q-item-section>
            <q-item-section>{{ i.name }}</q-item-section>
            <q-item-section side>
                <q-btn dense flat color="primary" icon="mdi-download" :label="$t('download')" class="q-px-md" @click="downloadFile(i.url)" />
            </q-item-section>
        </q-item>
    </q-list>
</template>
<script setup>
    import { toRef, ref, watch, onMounted } from "vue";
    import FileSaver from 'file-saver';
    const props = defineProps({
        files: {
            type: Array,
            default () {
                return []
            }
        },
        tip: {
            type: String,
            default: 'document_download'
        }
    })
    const filesRef = toRef(props,'files');
    const downloadFile = (val) => {
        FileSaver.saveAs(val, filename.value);
    };
    const downloadFiles = ref([])
    onMounted(() => {
    })
    watch(filesRef,() => {
        if(Array.isArray(filesRef.value) && filesRef.value.length > 0) {
            let count = 0;
            let maxCount = filesRef.value.length;
            const motifyFilesArr = async (val) => {
                let filename;

                const urlObj = new URL(val.attributes.url);
                const str = urlObj.pathname.substring(urlObj.pathname.lastIndexOf("/") + 1);
                // 获取文件名
                filename = decodeURIComponent(str);

                // console.log('开始格式化');
                downloadFiles.value.push({
                    name: filename,
                    url: val.attributes.url
                });
                try {
                    count++;
                    if(count < maxCount) {
                        await motifyFilesArr(filesRef.value[count]);
                    }
                } catch (error) {
                    console.log(error);
                }
            };
            motifyFilesArr(filesRef.value[count])
        }
    },{immediate:true,deep:true})
</script>
