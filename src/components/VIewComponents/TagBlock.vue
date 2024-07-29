<template>
    <div class="column gap-sm" :class="inline ? '' : 'q-pa-md'">
      <div :class="inline ? 'row' : 'column'" class="gap-sm">
        <span v-for="i in tags" :key="i.id" class="row items-center gap-xs q-px-sm radius-xs cursor-pointer"
          :class="`
            ${selectedRef.includes(i.id) ? `${$q.dark.mode ? 'bg-blue-grey-10' : 'bg-light-blue-1'}` : ''}
            ${inline ? 'border' : ''}`"
          @click="putTag(i)">
            <q-icon size="sm" name="tag" />
            <span>{{ i.attributes.name }}</span>
        </span>
      </div>
      <template  v-if="!readonlyRef">
        <q-separator spaced />
        <q-input v-model="CreateTagParmas.data.name" dense filled square type="text" :label="$t('new_tag')">
            <template v-slot:append>
                <q-btn v-if="CreateTagParmas.data.name" color="primary" round dense size="sm" icon="add" @click="createTagFn" />
            </template>
        </q-input>
      </template>
    </div>
</template>

<script setup>
import { findTags, CreateTag } from "src/apollo/api/api.js";
import { ref, toRef, watch } from "vue";

const props = defineProps({
    readonly: {
        type: Boolean,
        default: false
    },
    dense: {
        type: Boolean,
        default: false
    },
    selected: {
        type: Array,
        default() {
          return []
        }
    },
    inline: {
      type: Boolean,
      default: true
    }
})
const emit = defineEmits(["putTag"]);

const readonlyRef = toRef(props,'readonly');
const selectedRef = toRef(props,'selected');

const putTag = (i) => {
  emit('putTag',i);
}

const tags = ref();
const hasMoreTages = ref();
const findTagsParams = ref({
  data: {
    category: null,
  },
  pagination: {
    page: 1,
    pageSize: 6,
  }
});
let refetchTages;
const queryTags = (val) => {
  const { loading, error, result, refetch, fetchMore } = findTags(
    findTagsParams.value
  );
  watch(
    result,
    () => {
      if (result.value) {
        refetchTages = refetch;
        tags.value = result.value?.tags?.data || [];
        hasMoreTages.value = result.value?.tags?.meta.pagination.total > findTagsParams.value.pagination.pageSize;
      }
    },
    { immediate: true, deep: true }
  );
};
queryTags();

const CreateTagParmas = ref({
    data: {
        name: ''
    }
})
const createTagFn = async () => {

    const {
        mutate: CreateTagMutate,
        onDone: CreateTagOnDone,
        onError,
    } = CreateTag(CreateTagParmas);
    const { data } = await CreateTagMutate();
    if(data) {
        await refetchTages;
    }
}
</script>
