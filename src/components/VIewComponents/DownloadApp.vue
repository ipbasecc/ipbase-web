<template>
    <q-card :bordered="!flat" :flat="flat" :style="`${$q.screen.gt.sm ? 'min-width: 80vw;min-height: 60vh' : 'min-width: 100vw; min-height: 100vh'}`">
        <q-toolbar v-if="!nobar" class="transparent">
            <q-space />
            <q-btn flat round dense icon="close" v-close-popup/>
        </q-toolbar>
        <q-card-section :class="$q.screen.gt.sm ? 'row' : 'fit scroll-y'">
            <div v-for="i in packages" :key="i.Platform"
            class="column no-wrap items-center gap-md"
            :class="$q.screen.gt.md ? 'q-pa-xl' : 'q-pa-md'"
            :style="`flex: 0 0 ${90 / packages.length}%;`">
                <q-icon :name="i.poster" size="164px" />
                <span class="text-h4 q-mb-xl">{{ i.Platform }}</span>
                <div v-if="i.formats?.length > 0">
                    <div v-for="j in i.formats" :key="j.Format" class="row no-wrap q-mb-sm">
                        <q-chip square :label="`${j.Format} :`" class="q-px-sm q-py-none" />
                        <div class="row items-center" style="max-width: 24rem;">
                            <q-btn
                                v-for="k in j.versions"
                                :key="k.Version"
                                dense no-caps
                                padding="none sm"
                                color="primary"
                                class="q-ma-xs"
                                @click="downloadFile(k.url)" 
                            >
                                <div class="row no-wrap gap-sm items-center">
                                    <span>{{ k.Version }}</span>
                                    <q-icon name="mdi-download" size="sm"/>
                                </div>
                            </q-btn>
                        </div>
                    </div>
                </div>
                <span v-else>comming soon ... </span>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup>
import { ref } from 'vue';
import { $server } from 'src/boot/server.js'
import FileSaver from "file-saver";

const props = defineProps({
    flat: {
        type: Boolean,
        default: false
    },
    nobar: {
        type: Boolean,
        default: false
    },
})

const packages = ref()
$server().then((res) => {
    packages.value = res?.version?.packages
})
const downloadFile = (val) => {
    const urlObj = new URL(val);
    const fileName = urlObj.pathname.split('/').pop();    
    FileSaver.saveAs(val, fileName);
};
</script>

<style scoped>
</style>