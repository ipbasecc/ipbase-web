<template>
    <q-scroll-area class="fit">
      <q-expansion-item
        v-for="course in courses"
        :key="course.id"
        :default-opened="getOpenStatus(course)"
        dense
        dense-toggle
        :label="course.name"
        group="courses"
        :header-class="current_chapter?.id === course.id ? 'text-primary' : ''"
        @show="current_chapter = course"
      >
        <q-list dense>
            <q-item v-for="i in course.cards" :key="i.id"
              clickable v-ripple
              @click="toggleCousrse(i)"
            >
              <q-item-section side>
                  <q-icon name="mdi-play-circle" class="transition" color="red"
                  :class="i.id === teamStore.card?.id ? '' : 'op-0'" />
              </q-item-section>
              <q-item-section>{{ i.name }}</q-item-section>
            </q-item>
        </q-list>
      </q-expansion-item>
    </q-scroll-area>
</template>

<script setup>
import { ref, toRefs, computed } from 'vue'
import { teamStore } from 'src/hooks/global/useStore';

const props = defineProps({
  courses: {
    type: Array,
    default: () => []
  }
})
const { courses } = toRefs(props)
const toggleCousrse = (course) => {
    if(teamStore.card?.id === course.id) return
    teamStore.card = course
}

const getOpenStatus = (course) => {
  return course.cards.map((card) => card.id).includes(teamStore.card?.id)
}

const current_chapter = ref();
</script>

<style scoped>
</style>