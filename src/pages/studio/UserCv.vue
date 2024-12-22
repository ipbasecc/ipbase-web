<template>
    <q-scroll-area class="absolute-full column items-center">
        <template v-if="showCreate || showUpdate">
            <CreateCv :modify="showUpdate" :cv="cv" @processed="processed" />
        </template>
        <div v-else-if="notCreate" class="fit flex flex-center">
            <q-card bordered style="min-width: 22rem;" class="shadow-focus">
                <q-card-section>
                    <div class="text-h6">您尚未创建履历</div>
                    <div class="text-subtitle2">点击按钮开始创建</div>
                </q-card-section>
                <q-card-section>
                    <q-btn color="primary" label="创建履历" class="full-width" @click="createCv" />
                </q-card-section>
            </q-card>
        </div>
        <CvContainer v-else :user="teamStore.init" @update="updateCv" />
    </q-scroll-area>
</template>
<script setup>
import {ref} from 'vue'
import { teamStore } from "src/hooks/global/useStore.js";
import CreateCv from './components/CreateCv.vue'
import CvContainer from './components/CvContainer.vue'

const notCreate = ref(false);
const showCreate = ref(false);
const showUpdate = ref(false);
const cv = ref({});
const createCv = () => {
    showCreate.value = true
}
const updateCv = (value) => {
    console.log('updateCv', value);
    showUpdate.value = true
    cv.value = value;
}
const processed = (data) => {
    console.log('processed', data);
    cv.value = data;
    showUpdate.value = false;
    showCreate.value = false;
}
</script>