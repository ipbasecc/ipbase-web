<template>
    <div class="row no-wrap items-center text-white q-electron-drag--exception">
        <q-select
            dense
            borderless
            options-dense
            v-model="userStore.affairsFilters"
            multiple
            :options="options"
            :options-selected-class="$q.dark.mode ? 'bg-primary text-white border' : 'bg-blue-2 text-black border'"
            popup-content-class="radius-sm q-px-xs q-pt-xs border-white-op-3 shadow-focus"
            :behavior="!$q.screen.gt.xs ? 'dialog' : ''"
            transition-show="slide-down"
            transition-hide="slide-up"
            :transition-duration="100"
            @update:model-value="syncFilterIds()"
        >
            <template v-slot:selected>
                <span class="text-white">{{ $t('affairs_filter') }} :</span>
            </template>
            <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" class="q-mb-xs radius-xs">
                    <q-item-section side>
                        <q-icon
                            :name="userStore.affairsFilters?.map(i => i.id).includes(scope.opt.id)
                                ? 'mdi-checkbox-marked-circle'
                                : 'mdi-checkbox-marked-circle-outline'"
                            :color="userStore.affairsFilters?.map(i => i.id).includes(scope.opt.id)
                                ? 'positive'
                                : ''"
                        />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                </q-item>
            </template>
        </q-select>
        <template v-if="userStore.affairsFilters?.length > 0">
            <template v-for="i in filters_txt" :key="i">
                <span v-if="i === '...'" class="q-px-md text-primary">...</span>
                <q-chip v-else dense square class="bg-primary-op-xs text-white">{{ truncateText(i, 6) }}</q-chip>
            </template>
        </template>
    </div>
</template>

<script setup>
import { watchEffect, computed, onBeforeMount } from 'vue'
import { userStore } from "src/hooks/global/useStore.js";
import { truncateText } from 'src/hooks/utilits.js';
import localforage from 'localforage';

const options = computed(() => {
  return userStore.todogroups?.map((group) => {
    return {
        id: group.id,
        label: group.name,
        value: group.id,
    };
  });
});

const filters_txt = computed(() => {
    const labels = userStore.affairsFilters?.map((i) => i.label);
    if(labels?.length > 3) {
        return [labels[0], labels[1],'...',labels[labels.length -1]]
    } else {
        return labels
    }
})
const syncFilterIds = async () => {
    userStore.affairsFilterIDs = userStore.affairsFilters.map((i) => i.id);
    const cacheValue = JSON.parse(JSON.stringify(userStore.affairsFilterIDs));
    await localforage.setItem('affairsFilterIDs', cacheValue);
};
onBeforeMount(async() => {
    const _ids = await localforage.getItem('affairsFilterIDs')
    if(_ids){
        userStore.affairsFilterIDs = _ids;
        userStore.affairsFilters = _ids.map((i) => {
            return options.value.find((j) => j.id === i)
        })
    }
}
)
watchEffect(() => {
    if(!userStore.affairsFilterIDs){
        userStore.affairsFilters = options.value;
        syncFilterIds();
    }
})

</script>

<style scoped>
</style>