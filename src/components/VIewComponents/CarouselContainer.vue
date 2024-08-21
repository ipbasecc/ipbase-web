<template>
    <q-carousel
      v-if="slide"
      ref="carousel"
      v-model="slide"
      transition-prev="fade"
      transition-next="fade"
      swipeable
      animated
      infinite
      :autoplay="30000"
      padding
      :arrows="CarouselItemsRef?.length > 1"
      keep-alive
      :transition-duration="1000"
      height=300px
      class="bg-black text-white carousel channel"
    >
      <template v-for="(i,index) in CarouselItemsRef" :key="index">
          <q-carousel-slide :name="i.attributes.name" class="column no-wrap justify-end no-padding">
            <q-img
              v-if="imageType.includes(i.attributes.ext)"
              :src="i.attributes.url"
              class="absolute-full"
            />
            <template v-if="videoType.includes(i.attributes.ext)">
              <video v-if="$q.platform.is.mobile" :src="i.attributes.url" autoplay class="absolute-full"></video>
              <Artplayer
                v-else
                @get-instance="getInstance"
                :option="{
                  url: i.attributes.url,
                  muted: true,
                  autoplay: true,
                  loop: true,
                  mutex: true,
                  lock: true,
                  showControl: false,
                }"
                class="absolute-full"
              />
            </template>
            <div class="full-width height-200 z-fab " :class="$q.dark.mode ? 'bg-gradient-bottom-black' : 'bg-gradient-bottom-white'"></div>
          </q-carousel-slide>  
      </template>
    </q-carousel>
    
</template>
  
  <script setup>
  import { ref, watch, inject, onMounted,onBeforeUnmount, toRef } from 'vue'
  import Artplayer from "src/components/VIewComponents/ArtPlayer.vue";

  const props = defineProps({
    CarouselItems: {
      type: Object,
      default() {
        return {}
      }
    }
  });

  const CarouselItemsRef = toRef(props,'CarouselItems')
  const slide = ref();
  watch(CarouselItemsRef,() => {
    if(CarouselItemsRef.value.length > 0) {
      slide.value = CarouselItemsRef.value[0].attributes.name
    }
    },{
      immediate:true,
      deep:true
    }
  );

  const imageType = inject('imageType')
  const videoType = inject('videoType')

  const height = ref(100);
  const carouselH = ref(height.value + 'vh')
  const carousel = ref(null);
  const scrollY = ref();
  
  onMounted(() => {
    window.addEventListener("scroll", handleScroll);
  });
  onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleScroll);
  })

  const emit = defineEmits(['setCarouselH'])
  const handleScroll = () => {
        scrollY.value = Math.floor(window.scrollY);
        let number = height.value - (scrollY.value / 15);
        if(number > 20) {
          carouselH.value = number + 'vh';
        } else {
          carouselH.value = 20 + 'vh';
        }
        emit('setCarouselH',number)
      }

  const getInstance = (art) => {
      console.info(art);
  };
 
</script>
<style>
.channel > .q-carousel__prev-arrow--horizontal {
  left: 4px;
}
.channel > .q-carousel__next-arrow--horizontal {
    right: 4px;
}
.q-carousel__control {
  z-index: 9999;
}
</style>