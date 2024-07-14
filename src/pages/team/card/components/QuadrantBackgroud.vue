<template>
  <div class="absolute column fit"></div>
  <div class="absolute column fit" ref="dimensionBox">
    <div class="row col no-padding no-margin">
      <div
        class="col no-padding no-margin relative-position"
        :class="$q.dark.mode ? 'bg-blue op-1' : 'bg-blue-1'"
      >
        <q-chip
          square
          dense
          color="black"
          label="重要 · 不紧急"
          class="absolute-bottom-right text-md line-height-md"
          :class="
            $q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'
          "
        />
      </div>
      <div
        class="col no-padding no-margin relative-position"
        :class="$q.dark.mode ? 'bg-negative op-1' : 'bg-red-1'"
      >
        <q-chip
          square
          dense
          color="black"
          label="重要 · 紧急"
          class="absolute-bottom-left text-md line-height-md"
          :class="
            $q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'
          "
        />
      </div>
    </div>
    <div class="row col no-padding no-margin">
      <div
        class="col no-padding no-margin relative-position"
        :class="$q.dark.mode ? 'bg-grey op-1' : 'bg-grey-3'"
      >
        <q-chip
          square
          dense
          color="black"
          label="不重要 · 不紧急"
          class="absolute-top-right text-md line-height-md"
          :class="
            $q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'
          "
        />
      </div>
      <div
        class="col no-padding no-margin relative-position"
        :class="$q.dark.mode ? 'bg-green-10 op-1' : 'bg-green-1'"
      >
        <q-chip
          square
          dense
          color="black"
          label="不重要 · 紧急"
          class="absolute-top-left text-md line-height-md"
          :class="
            $q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'
          "
        />
      </div>
    </div>
  </div>
</template>

<style>
.dimension {
  opacity: 0.1;
}
.dimensionTaskItem {
  line-height: 1rem;
}
.dimensionTaskItem .q-focus-helper {
  opacity: 0 !important;
}
.dimensionTaskItem .taskName {
  opacity: 0.2;
}
.dimensionTaskItem:hover .taskName {
  opacity: 1;
  transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -webkit-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
}
</style>
