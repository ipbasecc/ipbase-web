<template>
  <div class="q-space gap-md" :class="$q.screen.lt.sm ? 'column gap-md' : 'row'">
    <div class="flex flex-center" :class="$q.screen.lt.sm ? '' : 'col-4'">
      <div class="column no-wrap gap-sm" :class="$q.screen.lt.sm ? '' : 'q-px-lg'">
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
            <q-btn color="primary" dense flat
              :label="showContinueCreate ? '继续创建？' : showCreate ? '放弃创建' :'创建更多频道？'"
              align="left" @click="toggleShowCreate()"
            />
            <template v-if="createdChannels.length > 0">
              <span>已创建的频道</span>
              <ul>
                <li v-for="i in createdChannels" :key="i">
                  {{i.name}}
                </li>
              </ul>
            </template>
            <CreateChannel v-if="showCreate" :hiddeHeader="true" @created="created" />
          </section>
      </div>
    </div>
    <div :class="$q.screen.lt.sm ? '' : 'column flex-center col relative-position'">
        <img
          src="https://airspace.oss-cn-shanghai.aliyuncs.com/ipbase/public/images/Channel.png"
          class="full-width"
          alt="Channel"
        />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import CreateChannel from '../../components/CreateChannel.vue';

const showCreate = ref(false);
const toggleShowCreate = () => {
  showCreate.value = !showCreate.value;
};
const showContinueCreate = ref(false);
const createdChannels = ref([]);
const created = async (val) => {
  createdChannels.value.push(val)
  await nextTick();
  showCreate.value = false;
  showContinueCreate.value = true;
};
</script>