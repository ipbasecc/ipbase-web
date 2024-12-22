<template>
    <q-list style="flex: 0 0 32%">
        <q-item>
            <q-item-section>
                <q-input v-model="params.data.fullname" outlined type="text" label="全名">
                    <template #prepend>
                        <q-icon name="mdi-account" />
                    </template>
                </q-input>
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-input v-model="params.data.title" outlined type="text" label="头衔" />
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-select v-model="params.data.sex" :options="options" outlined label="性别" />
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-input v-model="params.data.birthday" outlined :rules="['date']">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="params.data.birthday" mask="YYYY-MM-DD" minimal>
                            <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                            </q-date>
                        </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-input v-model="params.data.introduce" outlined type="textarea" label="自我介绍" />
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-input v-model="params.data.occupation" outlined type="text" label="职业" />
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-input v-model="params.data.power" outlined type="text" label="能力" />
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section class="gap-xs">
                <div class="row items-center gap-xs">
                    <template v-if="params.data.tags">
                        <q-chip v-for="i in params.data.tags" square removable :label="i" @remove="removeTag(i)" />
                    </template>
                </div>
                <div class="row items-center gap-xs">
                    <q-input v-model="tag" type="text" outlined dense label="标签" @keydown.enter="addTag">
                        <template #append>
                            <q-btn dense round size="sm" @click="addTag" icon="check" />
                        </template>
                    </q-input>
                </div>
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-input v-model="params.data.location" outlined type="text" label="地点" />
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-input v-model="params.data.phone" outlined type="number" label="电话" />
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-input v-model="params.data.homepage" outlined type="text" label="主页" />
            </q-item-section>
        </q-item>
    </q-list>
</template>
<script setup>
import { ref } from 'vue';
const params = defineModel('params');
const options = ref(['male', 'female']);
const tag = ref();
const addTag = () => {
    if(!tag.value) return;
    params.value.data.tags.push(tag.value);
    tag.value = null;
}
const removeTag = (i) => {
    params.value.data.tags = params.value.data.tags.filter(tag => tag !== i)
}
</script>