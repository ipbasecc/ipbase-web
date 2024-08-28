<template>
    <q-list dense bordered class="radius-sm q-pa-xs column gap-xs">
        <q-item
            v-for="(i,index) in filterOverviews"
            :key="i.id"
            class="radius-xs"
            clickable
            @click="set_current_version(i.id)"
            :class="activeVersion?.id === i.id ? 'bg-primary' : ''"
            v-close-popup
        >
            <q-item-section side>
                <q-avatar size="sm">{{ index }}</q-avatar>
            </q-item-section>
            <q-item-section>{{ i.name === 'Initial_Version' ? $t(i.name) : i.name }}</q-item-section>
            <q-item-section side>
                <q-btn dense size="sm" flat round icon="star"
                :color="overView_attachedTo.default_version === i.id ? 'yellow' : ''"
                @click.stop="useAuths('default_version', [authBase.collection]) && set_defaultVersion(i.id)"
                />
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script setup>
import { toRefs, computed } from 'vue';
import { teamStore } from "src/hooks/global/useStore.js";
const props = defineProps({
    overviews: {
        type: Object,
        default: void 0,
    },
    authBase: {
        type: Object,
        default: void 0,
    },
    overView_attachedTo: {
        type: Object,
        default: void 0,
    },
})
const { overviews, authBase } = toRefs(props);
const activeVersion = computed(() => teamStore.card.activeVersion || teamStore.project.activeVersion);
const filterOverviews = computed(() => {
    return overviews.value.filter(i => i.media)
})

const emit = defineEmits(['set_current_version', 'set_defaultVersion'])

const set_current_version = (id) => {
    emit('set_current_version', id)
}

const set_defaultVersion = (id) => {
    emit('set_defaultVersion', id)
}

</script>

<style scoped>
</style>