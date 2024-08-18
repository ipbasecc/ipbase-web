<template>
  <div :key="channel_ownerId" class="absolute-full column no-wrap items-center q-px-md" :class="$q.dark.mode ? 'bg-black' : 'bg-grey-2'" style="padding-top: 68px;">
    <div class="fixed-top">
      <CarouselContainer v-if="channel_cover" :CarouselItems="channel_cover" @setCarouselH="setCarouselH"/>
    </div>
    <div v-if="channelMatedata"
      class="fit overflow-hidden justify-center q-space row gap-xs container limit z-fab"
      :class="!$q.screen.lt.md ? 'no-wrap' : ''">
      <div class="q-space column no-wrap gap-xs">
        <ChannelHeader :key="channel_ownerId" :channelId="idRef" :navigationData="navigation" :bizCardData="channel_owner_bizCard" :channelPostId="channelPostId" />
        <q-card :key="channel_ownerId" bordered flat class="q-space row full-width scroll">
          <router-view />
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 column no-wrap gap-md">
        <UserMaincard :key="channel_ownerId" :userData="channel_owner" :userId="channel_ownerId" />
        <ChannelWorkingDay :key="channel_ownerId" :workingdayItems="workingday" :channelId="idRef" :readonly="channel_ownerId != userStore.userId" />
        <CreatorCard v-if="workStore.creator" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, provide, ref, toRef, watch } from 'vue';
  import ChannelHeader from 'src/pages/ChannelPage/Components/ChannelHeader.vue';
  import CarouselContainer from 'src/components/VIewComponents/CarouselContainer.vue'
  import { findChannelMatedataByID } from "src/apollo/api/api.js";
  import ChannelWorkingDay from 'src/pages/ChannelPage/Components/ChannelWorkingDay.vue'
  import CreatorCard  from "src/components/VIewComponents/CardContainer/CreatorCard.vue"
  import UserMaincard  from "src/components/VIewComponents/CardContainer/UserMaincard.vue"
  import useWorkStore from 'src/stores/work.js';
  import useChannelStore from 'src/stores/channel.js';
  import useStore from 'src/stores/user.js';

  const workStore = useWorkStore();
  const channelStore = useChannelStore();
  const userStore = useStore();
  
  const props = defineProps({
  // 从路由注入的id
      id: {
          type: String,
          required: true
      }
  });
  const idRef = toRef(props,'id');
  channelStore.channel_id = idRef.value;
  provide('channelId',idRef);

  const channelMatedata = ref();
  const channel_owner = ref({});
  const channel_ownerId = ref({});
  const channel_owner_bizCard = ref({});
  const channel_cover = ref({});
  const channelPostId = ref({});
  const workingday = ref({});
  const navigation = ref();

  let refetchChannelMatedata;
  const getChannelMatedata = () => {

    const motifyChannelData = (val) => {
      channelMatedata.value = val.channel.data?.attributes;
      // console.log(channelMatedata.value);
      workingday.value = val.channel.data?.attributes?.workingday || null;

      channel_owner.value = channelMatedata.value?.channel_owner?.data?.attributes;
      channel_owner_bizCard.value = channelMatedata.value?.channel_owner.data?.attributes.config?.default_bizcard?.data || channelMatedata.value?.channel_owner.data?.attributes?.bizcards?.data[0] || null;
      channel_ownerId.value = channelMatedata.value?.channel_owner.data?.id;

      channelStore.channel_ownerId = channel_ownerId.value;
      channelStore.matedata = channelMatedata.value || null;

      channel_cover.value = channelMatedata.value?.cover?.data || null;
      channelPostId.value = channelMatedata.value?.post?.data?.id || null;

      if(!navigation.value) {
        navigation.value = channelMatedata.value?.navigation || [];
        channelStore.navigation = navigation.value;
      }
    };

    const { loading, error, result, refetch } = findChannelMatedataByID({
      id: idRef.value
    }, {
      fetchPolicy: 'cache-first'
    });
    watch(result,() => {
        if(result.value) {
          refetchChannelMatedata = refetch;

          result.value && motifyChannelData(result.value);
          channelStore.needRefetch = false; 
        }
    },{immediate: true, deep: true});
  };
  // getChannelMatedata();
  watch(idRef,() => {
    if(idRef.value) {
      // console.log('频道ID',idRef.value);
      getChannelMatedata();
    }
  },{immediate:true,deep:true});
  watch(channelStore,() => {
    if(channelStore.needRefetch) {
      refetchChannelMatedata();
    }
  },{immediate:true,deep:true});

  const paddingTop = ref(80);
  const setCarouselH = (val) => {
    // getDistance();
    if(val > 40) {
      paddingTop.value  = val - 20;
    } else {
      paddingTop.value  = 20;
    }
  };
  provide('channelMatedata',channelMatedata.value);
  provide('channelPostId',channelPostId.value);
  provide('channel_ownerId',channel_ownerId.value);

  onMounted(() => {
    window.addEventListener("scroll", handleScroll);
    workStore.creator = null; //频道首页时不显示创作者卡片列表
  })

  // const ChannelHeaderStyle = ref();
  // const distance = ref();
  // const getDistance = () => {
  //   let div = document.getElementById("ChannelHeaderRef");
  //   distance.value = div.getBoundingClientRect().top;
  // }
  // onMounted(() => {
  //   getDistance();
  // });
  // watch(distance,() => {
  //   if(distance.value < 320) {
  //     ChannelHeaderStyle.value = 'position: fixed; width: 100%; z-index: 999; top: 320px;'
  //   } else {
  //     ChannelHeaderStyle.value = ''
  //   }
  // },{immediate:true,deep:true});
  const pt = ref(0);
  const opacity = ref(0);
  const handleScroll = () => {
      const scrollTop = window.scrollY;

      let o = scrollTop / 500;
      opacity.value = o <= 1 ? o : 1;
      pt.value = pt.value < 92 && scrollTop;
    };
  onMounted(() => {
    window.addEventListener("scroll", handleScroll);
  })

  userStore.location = 'channel';

</script>