<template>
  <div class="row q-space gap-md">
    <div class="flex flex-center">
      <div class="column no-wrap gap-sm q-px-lg" style="max-width: 26rem">
          <section class="column">
            <span class="font-large text-h2" style="line-height: 1.3;">讨论频道</span>
            <span class="font-x-large">创建不同的频道，以便团队成员可以加入并参与讨论</span>
          </section>
          <section class="column op-7">
            <span>我们已经为您初始化了两个频道</span>
            <ol class="no-margin">
              <li>交流讨论：讨论业务事务</li>
              <li>闲聊：讨论非业务事务</li>
            </ol>
          </section>
          <section class="column gap-sm">
            <span>创建更多频道？</span>
            <CreateChannel />
          </section>
      </div>
    </div>
    <div class="column flex-center col relative-position">
        <q-img
            src="public/images/Channel.png"
            spinner-color="primary"
            spinner-size="82px"
            class="absolute-full"
        />
    </div>
  </div>
</template>

<script setup>
import CreateChannel from '../../components/CreateChannel.vue'
</script>