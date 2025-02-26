<template>
    <div class="column no-wrap overflow-hidden q-space">
        <q-item>
            <q-item-section avatar>
                服务价格：
            </q-item-section>
            <q-item-section>
                <div class="row">
                    <q-input v-model="price" dense type="number" filled square class="radius-xs overflow-hidden">
                        <template v-slot:append>
                            <q-btn flat dense icon="check"
                                :disable="!price || price * 100 === teamStore.project?.price"
                                @click="save(teamStore.project?.jsonContent)"
                            />
                        </template>
                    </q-input>
                </div>
            </q-item-section>
        </q-item>
        <TipTap
            :jsonContent="teamStore.project?.jsonContent"
            :editable="useAuths('jsonContent', ['project'])"
            :need="'json'"
            :square="true"
            :withSaveBtn="true"
            styleClass="q-space scroll-y q-pa-md"
            class="overflow-hidden q-space q-mt-md border radius-xs"
            @tiptapSave="save"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TipTap from 'src/components/Utilits/tiptap/TipTap.vue'
import { teamStore } from 'src/hooks/global/useStore';
import { updateProject } from 'src/api/strapi/project';

const price = ref();
const params = ref({
    data: {
        jsonContent: teamStore.project?.jsonContent,
        price: teamStore.project?.price,
    }
});
onMounted(() => {
    price.value = teamStore.project?.price / 100 || 0;
})
const save = async (val) => {
    if(!val){
        val = teamStore.project?.jsonContent;
    }
    if(teamStore.project?.id){
        params.value.data.jsonContent = val;
        params.value.data.price = price.value * 100;
        const {data} = await updateProject(teamStore.project.id, params.value);
        if(data){
            teamStore.project.jsonContent = data.jsonContent;
            teamStore.project.price = data.price;
        }
    }
}

</script>