<template>
    <q-list dense class="full-width q-px-xl">
      <BgBrand styleClass="op-none" />

        <q-item class="q-mt-xl">
          <q-item-section side>
            <q-icon color="primary" name="mdi-server-network" />
          </q-item-section>
          <q-item-section>
            <div class="row no-wrap items-center">
              当前服务器： <q-chip square :label="isOfficalServer ? '官方服务器' : ''" /> 
            </div>
          </q-item-section>
        </q-item>
        <q-separator spaced class="op-5" />

        <q-expansion-item
          group="login_helper"
          label="什么是服务器？"
          dense
          dense-toggle
          :content-inset-level="0.3"
        >
          <div class="q-pa-sm">
            服务器是指为软件正常运行提供数据存取、用户管理、实时通讯等功能的支持服务端应用。
          </div>
        </q-expansion-item>
        <q-expansion-item
          group="login_helper"
          label="自建服务器?"
          dense
          dense-toggle
          :content-inset-level="0.3"
        >
          <div class="q-pa-sm">
            您可以在本地、内网、公网假设自己的服务器，请参考
            <a class="text-primary" href="https://www.bilibili.com/video/BV1BWeYeKEbZ/?spm_id_from=333.999.0.0&vd_source=14fda6b1b918f99f59187d308ae0763b">此演示</a>
            中服务端部署部分
          </div>
        </q-expansion-item>
        <q-expansion-item
          group="login_helper"
          label="自建服务器的好处?"
          dense
          dense-toggle
        >
          <div class="q-pa-sm">
            <ol class="q-my-none q-pl-lg">
              <li>数据安全：第三方无法访问自有数据；</li>
              <li>高性能：本地设备性能远胜于云服务器，内网使用自建服务器性能强悍。</li>
              <li></li>
            </ol>
          </div>
        </q-expansion-item>
    </q-list>
</template>

<script setup>
import { isOfficalServer } from 'src/boot/server.js'
import BgBrand from 'src/components/VIewComponents/BgBrand.vue'
</script>

<style scoped>
</style>