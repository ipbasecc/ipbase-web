<template>
    <q-card bordered style="min-width: 60vw">
        <q-toolbar class="transparent">
            <q-space />
            <q-btn flat round dense icon="close" v-close-popup/>
        </q-toolbar>
        <q-card-section>
            <div class="row q-pa-lg justify-around">
                <div v-for="i in packages" :key="i.Platform" class="column no-wrap items-center gap-md q-pa-xl">
                    <q-icon :name="i.poster" size="164px" />
                    <span class="text-h4 q-mb-xl">{{ i.Platform }}</span>
                    <div v-if="i.formats?.length > 0">
                        <div v-for="j in i.formats" :key="j.Format" class="row no-wrap q-mb-sm">
                            <q-chip square :label="`${j.Format} :`" class="q-px-sm q-py-none" />
                            <div class="row" style="max-width: 24rem;">
                                <q-btn
                                    v-for="k in j.versions"
                                    :key="k.Version"
                                    dense
                                    color="primary"
                                    icon-right="mdi-download"
                                    :label="k.Version"
                                    @click="downloadFile(k.url)" 
                                />
                            </div>
                        </div>
                    </div>
                    <span v-else>comming soon ... </span>
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup>
import { ref } from 'vue';
import { $server } from 'src/boot/server.js'
import FileSaver from "file-saver";

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