<template>
    <q-scroll-area class="fit">
      <q-expansion-item
        v-for="course in courses"
        :key="course.id"
        :default-opened="getOpenStatus(course)"
        dense
        dense-toggle
        :label="course.name"
        :header-class="expansionHeaderClass(course)"
        @show="current_chapter = course"
      >
        <q-list dense class="q-px-xs column gap-xs q-my-xs">
            <q-item v-for="i in course.cards" :key="i.id"
              clickable v-ripple
              class="radius-xs"
              :class="i.id === teamStore.card?.id ? 'bg-primary text-white' : 'text-grey-7'"
              @click="toggleCousrse(i)"
            >
              <q-item-section class="q-pl-sm">{{ i.name }}</q-item-section>
              <q-item-section side>
                  <q-icon v-if="i.id === teamStore.card?.id" name="mdi-play-circle" class="transition"
                  :class="i.id === teamStore.card?.id ? '' : 'op-0'" color="white" />
                  <PayState v-else :card="i" :dense="true" />
              </q-item-section>
            </q-item>
        </q-list>
      </q-expansion-item>
    </q-scroll-area>
</template>

<script setup>
import { ref, toRefs, computed } from 'vue'
import { teamStore } from 'src/hooks/global/useStore';
import { useQuasar } from 'quasar'
import PayState from './PayState.vue'

const $q = useQuasar()

const props = defineProps({
  courses: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['toggleCousrse'])
const { courses } = toRefs(props)
const toggleCousrse = (course) => {
    if(teamStore.card?.id === course.id) return
    emit('toggleCousrse', course)
}

const getOpenStatus = (course) => {
  return course.cards.map((card) => card.id).includes(teamStore.card?.id)
}

const current_chapter = ref();

const expansionHeaderClass = (course) => {
  if(current_chapter?.value?.id === course.id){
    return $q.dark.mode ? 'text-grey-1 bg-grey-9' : 'text-grey-8 bg-grey-3'
  } else {
    return $q.dark.mode ? 'text-white bg-dark' : 'text-grey-8'
  }
}
</script>

<style scoped>
</style>