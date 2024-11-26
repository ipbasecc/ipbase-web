<template>
    <div class="column no-wrap overflow-hidden q-space">
        <TipTap
            :jsonContent="teamStore.project?.jsonContent"
            :editable="useAuths('jsonContent', ['project'])"
            :need="'json'"
            :square="true"
            :withSaveBtn="true"
            styleClass="q-space scroll-y"
            class="overflow-hidden q-space"
            @tiptapSave="tiptapSave"
        />
        <q-input v-model="price" type="number" label="服务价格" filled square>
            <template v-slot:append>
                <q-btn flat dense icon="check" @click="tiptapSave(teamStore.project?.jsonContent)" />
            </template>
        </q-input>
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
const tiptapSave = async (val) => {
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