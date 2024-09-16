<template>
  <NavigatorContainer>
    <q-resize-observer @resize="onResize" />
    <RowLayout>
      <AffairsBody :mainArea />
    </RowLayout>
  </NavigatorContainer>
</template>

<script setup>
import { ref } from "vue";
import NavigatorContainer from './NavigatorContainer.vue'
import RowLayout from './todo/affairs/RowLayout.vue'
import AffairsBody from './todo/affairs/AffairsBody.vue'

const mainArea = ref(null);
const onResize = (size) => {
  mainArea.value = size;
}
</script>

<style scoped></style>
