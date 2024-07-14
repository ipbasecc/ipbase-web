<template>
    <q-item
        v-for="i in gategories"
        :key="i.id"
        class="radius-sm"
        :class="activedIdRef === i.id || belongedIdRef === i.id ? 'active-listitem text-white' : ''"
        clickable v-ripple
    >
        <q-item-section side v-if="i.attributes.icon">
            <q-icon :color="activedIdRef === i.id || belongedIdRef === i.id ? 'white' : 'primary'" :name="i.attributes.icon" />
        </q-item-section>
        <q-item-section
            @click.stop="setGetagory(
                i.id,
                i.attributes.name,
                belong_categoryRef,
                i.attributes.sub_category.data
            )"
        >
            {{ i.attributes.name }}
        </q-item-section>
        <q-item-section side v-if="i.attributes.sub_category.data?.length > 0" class="q-ml-sm">
            <q-btn v-if="belongedIdRef === i.id" unelevated color="positive" :label="belongedNameRef" dense padding="0px 6px">
                <q-menu class="radius-sm shadow-focus">
                    <q-list class="q-pa-xs" style="min-width: 8rem;">
                        <Gategory :activedId="activedIdRef" :belong_category="i.id" @setGetagory="setGetagory"
                            :filterIds="filterIdsRef"
                        />
                    </q-list>
                </q-menu>
            </q-btn>
            <q-btn v-else :color="activedIdRef === i.id ? 'white' : 'primary'" icon="expand_more" dense size="sm" round flat>
                <q-menu class="radius-sm shadow-focus">
                    <q-list class="q-pa-xs" style="min-width: 8rem;">
                        <Gategory :activedId="activedIdRef" :belong_category="i.id" @setGetagory="setGetagory"
                            :filterIds="filterIdsRef"
                        />
                    </q-list>
                </q-menu>
            </q-btn>
        </q-item-section>
    </q-item>
</template>

<script setup>
import { findGategories } from "src/apollo/api/api.js";
import { onMounted, ref, toRef, watch } from "vue";
import Gategory from "src/components/VIewComponents/GategoryBlock.vue";

const props = defineProps({
    belong_category: {
        type: String,
        default: null
    },
    filterIds: {
        type: Array,
        default() {
            return []
        }
    },
    activedId: {
        type: String,
        default: null
    },
    belongedId: {
        type: String,
        default: null
    },
    belongedName: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['setGetagory']);

const belong_categoryRef = toRef(props, 'belong_category');
const filterIdsRef = toRef(props, 'filterIds');
const activedIdRef = toRef(props, 'activedId');
const belongedIdRef = toRef(props, 'belongedId');
const belongedNameRef = toRef(props, 'belongedName');

const gategories = ref();
const hasMoreGategory = ref(false);
const findGategoriesParams = ref({
  subLimit: {
    limit: 9999,
  },
  filters: {
    belong_category: {
        id: {
            eqi: belong_categoryRef.value
        }
    },
  },
});
const queryGategories = (val) => {
  const { loading, error, result, refetch, fetchMore } = findGategories(
    findGategoriesParams.value
  );
  watch(
    result,
    () => {
      if (result.value) {
        gategories.value = result.value?.categories?.data || [];
        hasMoreGategory.value = result.value?.categories?.meta.pagination.total > result.value?.categories?.meta.pagination.pageSize;
      }
    },
    { immediate: true, deep: true }
  );
};

const setGetagory = (id,name,belongId,sub) => {
    let ids = [id, ...sub.map(i => i.id)];
    ids = ids.filter(i => i != null);
    emit('setGetagory', id, name, belongId, ids);
};

onMounted(() => {
  queryGategories();
});
</script>

<style lang="scss" scoped></style>
