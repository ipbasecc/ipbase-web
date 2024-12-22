<template>
    <div class="fit column no-wrap items-center">
        <div class="column gap-md q-space article" style="min-width: 640px;max-width: 1024px;width: 82vw;">
            <div class="row items-center">
                <div class="text-h1">{{`${user?.username}的简历`}}</div>
                <q-space />
                <q-btn color="primary" unelevated label="编辑" @click="update" />
            </div>
            <div class="row no-wrap gap-md">
                <q-timeline color="primary" layout="dense">
                    <q-timeline-entry heading>
                        工作经历
                    </q-timeline-entry>
                    <q-timeline-entry
                        v-for="experience in cv.experiences"
                        :title="experience.title"
                        :subtitle="`${experience.start} - ${experience.end}`"
                    >
                        <q-item>
                            <q-item-section side>
                                头衔：
                            </q-item-section>
                            <q-item-section>
                                {{ experience.title }}
                            </q-item-section>
                        </q-item>
                        <q-item>
                            <q-item-section side>
                                职责：
                            </q-item-section>
                            <q-item-section>
                                {{ experience.responsibility }}
                            </q-item-section>
                        </q-item>
                    </q-timeline-entry>
                </q-timeline>
                <q-list style="flex: 0 0 32%">
                    <q-item v-if="cv.fullname">
                        <q-item-section side>
                            姓名：
                        </q-item-section>
                        <q-item-section>
                            {{ cv.fullname }}
                        </q-item-section>
                    </q-item>
                    <q-item v-if="cv.title">
                        <q-item-section side>
                            头衔：
                        </q-item-section>
                        <q-item-section>
                            {{ cv.title }}
                        </q-item-section>
                    </q-item>
                    <q-item v-if="cv.sex">
                        <q-item-section side>
                            性别：
                        </q-item-section>
                        <q-item-section>
                            {{ cv.sex }}
                        </q-item-section>
                    </q-item>
                    <q-item v-if="cv.birthday">
                        <q-item-section side>
                            生日：
                        </q-item-section>
                        <q-item-section>
                            {{ cv.birthday }}
                        </q-item-section>
                    </q-item>
                    <q-item v-if="cv.introduce">
                        <q-item-section side>
                            自我介绍：
                        </q-item-section>
                        <q-item-section>
                            {{ cv.introduce }}
                        </q-item-section>
                    </q-item>
                    <q-item v-if="cv.occupation">
                        <q-item-section side>
                            职业：
                        </q-item-section>
                        <q-item-section>
                            {{ cv.occupation }}
                        </q-item-section>
                    </q-item>
                    <q-item v-if="cv.power">
                        <q-item-section side>
                            能力：
                        </q-item-section>
                        <q-item-section>
                            {{cv.power}}
                        </q-item-section>
                    </q-item>
                    <q-item v-if="cv.tags">
                        <q-item-section side>
                            标签：
                        </q-item-section>
                        <q-item-section>
                            <div class="row items-center gap-xs">
                                <template v-if="cv.tags">
                                    <q-chip v-for="i in cv.tags" square :label="i" />
                                </template>
                            </div>
                        </q-item-section>
                    </q-item>
                    <q-item v-if="cv.location">
                        <q-item-section side>
                            联系地址：
                        </q-item-section>
                        <q-item-section>
                            {{ cv.location }}
                        </q-item-section>
                    </q-item>
                    <q-item v-if="cv.phone">
                        <q-item-section side>
                            电话：
                        </q-item-section>
                        <q-item-section>
                            {{ cv.phone }}
                        </q-item-section>
                    </q-item>
                    <q-item v-if="cv.homepage">
                        <q-item-section side>
                            主页：
                        </q-item-section>
                        <q-item-section>
                            {{ cv.homepage }}
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';

import { findUserCv } from "src/api/strapi.js";
const { user } = defineProps(['user']);
const emit = defineEmits(['update', 'back']);
const cv = ref({});
const findCv = async (id) => {
    if(!id) return;
    const {data} = await findUserCv(id);
    if(data.error_tag === 'err:cv:findUserCv:none'){
        notCreate.value = true;
    } else {
        cv.value = data;
    }
}
onMounted(async () => {
    await findCv(user.id);
});
const update = () => {
    emit('update', cv.value);
}
const back = () => {
    emit('back');
}
</script>