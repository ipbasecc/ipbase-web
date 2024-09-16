<template>
  <NavigatorContainer>
    <q-resize-observer @resize="onResize" />
    <ScrollBody>
      <AffairsBody :mainArea />
    </ScrollBody>
  </NavigatorContainer>
</template>

<script setup>
import { ref } from "vue";
import NavigatorContainer from './NavigatorContainer.vue'
import ScrollBody from './todo/affairs/ScrollBody.vue'
import AffairsBody from './todo/affairs/AffairsBody.vue'

const mainArea = ref(null);
const onResize = (size) => {
  mainArea.value = size;
}
</script>

<style scoped></style>
