<template>
    <div v-show="uiStore.show_meet" ref="draggableDom" :style="style" style="position: fixed;"
    class="border bg-grey-9 z-max column no-wrap shadow-24 meet-container"
    >
        <div class="z-fab full-width row no-wrap gap-sm transparent cursor-move q-px-sm q-py-xs" ref="draggableToolbar">
            <q-btn dense flat icon="mdi-close" size="sm" @click="uiStore.show_meet = false" />
            <q-btn dense flat :icon="`mdi-window-${ !isMaxed ?'maximize' : 'restore' }`" size="sm" @click="toggleMaxed()" />
        </div>
        <MeetContainer :roomName :displayName class="absolute-full" @meetEnded="meetEnded" />
        <div @mousedown="startResize"
            class="z-fab cursor-nwse-resize"
            :class="isResizing ? 'absolute-full' : 'absolute-bottom-right'"
            :style="isResizing ? '' : `width: 40px; height: 40px; transform: translate(25px, 25px);`"
        />
    </div>
</template>

<script setup>
import { useTemplateRef, computed, ref } from 'vue'
import { uiStore, teamStore } from "src/hooks/global/useStore.js";
import { useDraggable } from '@vueuse/core'
import { endMeet as endProjectMeet } from 'src/api/strapi/project.js'
import MeetContainer from 'src/components/meet/MeetContainer.vue'

const roomName = computed(() => uiStore.meet?.room_name || teamStore.project?.mm_channel?.id || `${teamStore.project?.id}_meetRoom_by_${teamStore.init?.id}`);
const displayName = computed(() => teamStore.init?.username);

const draggableDom = useTemplateRef('draggableDom')
const draggableToolbar = useTemplateRef('draggableToolbar')

const { x, y, style } = useDraggable(draggableToolbar, {
  initialValue: { x: 40, y: 40 },
  preventDefault: true,
})


let isResizing = ref(false);
let startX, startY, startWidth, startHeight;

const startResize = (event) => {
    isResizing.value = true;
    startX = event.clientX;
    startY = event.clientY;
    startWidth = draggableDom.value.offsetWidth;
    startHeight = draggableDom.value.offsetHeight;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
};

const resize = (event) => {
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const newWidth = startWidth + deltaX;
    const newHeight = startHeight + deltaY;
    draggableDom.value.style.width = `${newWidth}px`;
    draggableDom.value.style.height = `${newHeight}px`;
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
};

const beforeToggleMax = ref({})
const max = () => {
    beforeToggleMax.value.width = draggableDom.value.style.width
    beforeToggleMax.value.height = draggableDom.value.style.height
    beforeToggleMax.value.x = x.value
    beforeToggleMax.value.y = y.value

    draggableDom.value.style.width = '100vw'
    draggableDom.value.style.height = '100vh'
    x.value = 0
    y.value = 0
}
const restore = () => {
  draggableDom.value.style.width = beforeToggleMax.value.width
  draggableDom.value.style.height = beforeToggleMax.value.height
  x.value = beforeToggleMax.value.x
  y.value = beforeToggleMax.value.y
}
const isMaxed = ref(false);
const toggleMaxed = () => {
    if (!draggableDom.value) return
    isMaxed.value = !isMaxed.value;
    if(isMaxed.value){
        max();
    } else {
        restore();
    }
}
const meetEnded = async (state) => {
    console.log('meetEnded', state);
    
    uiStore.show_meet = false;
    if(state === 'left' || state === 'error'){
        uiStore.meet = void 0;
        uiStore.init_meet = false;
    }
    if(state === 'close'){
        teamStore.project.meeting = false
        uiStore.meet = void 0;
        uiStore.init_meet = false;
        await endProjectMeet(teamStore.project?.id);
    }
}

</script>
<style scoped>
.meet-container {
    width: calc(100vw - 80px);
    height: calc(100vh - 80px)
}
</style>
