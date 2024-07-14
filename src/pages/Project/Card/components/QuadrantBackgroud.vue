<template>
  <div class="dimension absolute column fit" style="z-index: -1"></div>
  <div class="dimension absolute column fit" ref="dimensionBox">
    <div class="row col no-padding no-margin op-7">
      <div class="col no-padding no-margin bg-blue relative-position">
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
      <div class="col no-padding no-margin bg-negative relative-position">
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
    <div class="row col no-padding no-margin op-7">
      <div class="col no-padding no-margin bg-grey relative-position">
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
      <div class="col no-padding no-margin bg-green relative-position">
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
  z-index: -2;
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
