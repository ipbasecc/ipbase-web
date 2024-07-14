<template>
  <div class="column no-wrap gap-xs">
    <div v-for="i in filesRef" :key="i.id" class="row no-wrap">
        <div v-if="imageExtensions.includes(i.extension)" class="q-space">
            <img
                v-if="i.preview"
                :src="i.preview"
                class="cursor-pointer"
                style="max-width: 100%;"
                @click.stop="showFile(i.id).then(res => {$hevueImgPreview({url:res,clickMaskCLose: true})})"
            />
            <q-img
                v-else-if="i.mini_preview"
                :src='`data:image/png;base64,${i.mini_preview}`'
                spinner-color="primary"
                spinner-size="82px"
            />
        </div>
        <div v-else-if="videoExtensions.includes(i.extension) && i.link" class="q-space">
          <q-responsive :ratio="16/9" class="border radius-sm overflow-hidden">
            <Artplayer
              :option="{
                ...videoOption,
                url: i.link,
              }"
              class="fit"
            />
          </q-responsive>
        </div>
        <template v-else>
            <q-item class="radius-sm border q-pa-sm" style="max-width: 320px;">
                <q-item-section top avatar>
                    <q-btn flat icon="attachment" padding="sm" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{ i.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn flat dense icon="download" type="a" :href="i.link" target="_blank" />
                </q-item-section>
            </q-item>
        </template>
      <div v-if="$q.screen.gt.md" class="col-4"></div>
    </div>
  </div>
</template>

<script setup>
import {onBeforeMount, ref, toRef} from 'vue';
import { filePreview, file, fileLink } from "src/api/mattermost.js";
import localforage from "localforage";
import Artplayer from 'components/VIewComponents/ArtPlayer.vue';

const props = defineProps({
    files: {
        type: Array,
        default() {
            return []
        }
    }
})
const imageExtensions = ['jpg','jpeg','png','webp','gif'];
const videoExtensions = ['mp4','m4v','mov','3gp','webm'];

const videoOption = {
  muted: true,
  autoplay: false,
  loop: false,
  mutex: true,
  fullscreen: false,
  fullscreenWeb: false,
};

const filesRef = toRef(props,'files');
const attach_preview = async () => {
    for(let i of filesRef.value){
        let preview_key;
        if(imageExtensions.includes(i.extension)) {
            preview_key = `__${i.id}_preview`;

            let _findCache = await localforage.getItem(preview_key);
            if(_findCache) {
                const blob = new Blob([_findCache], { type: `image/${i.extension}` });
                i.preview = window.URL.createObjectURL(blob);
                // console.log('图片来自缓存');
            } else {
                let res = await filePreview(i.id);
                if(res) {
                    const blob = new Blob([res.data], { type: `image/${i.extension}` });
                    i.preview = window.URL.createObjectURL(blob);
                    localforage.setItem(preview_key,res.data);
                    // console.log('图片来自后端');
                }
            }
        } else {
            preview_key = `__${i.id}_filelink`;
            let _findCache = await localforage.getItem(preview_key);
            if(_findCache) {
                i.link = _findCache;
                // console.log('链接来自缓存');
            } else {
                let res = await fileLink(i.id);
                if(res) {
                    i.link = res.data.link;
                    localforage.setItem(preview_key,i.link);
                    // console.log('链接来自后端');
                }
            }
        }
    }
}
onBeforeMount(async () => {
  await attach_preview();
})

const source_file = ref();
const showFile = async (file_id) => {
    let image_key = `__${file_id}_image`;

    let _findCache = await localforage.getItem(image_key);
    if(_findCache) {
        // console.log('原图来自缓存');
        const blob = new Blob([_findCache]);
        source_file.value = window.URL.createObjectURL(blob);
        return window.URL.createObjectURL(blob);
    } else {
        let res = await file(file_id);
        if(res) {
            // console.log('原图来自后端');
            const blob = new Blob([res.data]);
            source_file.value = window.URL.createObjectURL(blob);
            return window.URL.createObjectURL(blob);
        }
    }
}

</script>

<style lang="scss" scoped></style>
