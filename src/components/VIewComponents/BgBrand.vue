<template>
  <q-item style="user-select: none" :class="styleClass">
    <q-item-section side :class="size === 'sm' ? 'q-pr-sm' : ''">
      <q-avatar :size="classInfo.avatarSize">
        <img src="../../../public/logo.png" />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label :class="classInfo.labelClass">{{ $t('ipbase_brand') }}</q-item-label>
      <q-item-label caption lines="2" :class="classInfo.captionClass">{{ $t('ipbase_brand_purpose') }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import {ref, toRefs, watchEffect} from "vue";

const props = defineProps({
  styleClass: {
    type: String,
    default: 'op-3'
  },
  size: {
    type: String,
    default: 'md'
  }
})
const { styleClass, size } = toRefs(props);
const classInfo = ref({})
watchEffect(() => {
  if(size.value === 'sm') {
    classInfo.value.avatarSize = '36px';
    classInfo.value.labelClass = 'font-bold-600 font-small';
    classInfo.value.captionClass = 'op-5 font-smaller';
  } else if(size.value === 'md') {
    classInfo.value.avatarSize = '64px';
    classInfo.value.labelClass = 'font-large font-bold-600';
    classInfo.value.captionClass = 'op-5';
  } else if(size.value === 'lg') {
    classInfo.value.avatarSize = '128px';
    classInfo.value.labelClass = 'font-xx-large font-bold-600';
    classInfo.value.captionClass = 'op-5';
  } else {
    classInfo.value.avatarSize = '76px';
    classInfo.value.labelClass = 'font-xx-large font-bold-600';
    classInfo.value.captionClass = 'op-5';
  }
})
</script>

<style lang="scss" scoped></style>
