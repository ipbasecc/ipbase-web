<template>
  <div
    id="app-loading"
    style="z-index: -1; line-height: 1.5"
    class="absolute-full column flex-center"
  >
    <img src="../../../public/icons/icon-128x128.png" alt="LoadingImage" class="rotate" />
    <div class="row items-center no-wrap gap-md font-xx-large">
      <span>应用加载中</span>
      <div class="loading-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    </div>
    <span style="font-size: medium; font-weight: 400; opacity: 0.5">
      首次加载需要较长时间，请稍等
    </span>
  </div>
</template>

<script setup>
// import { ref } from "vue";
</script>

<style scoped>
@-webkit-keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
.rotate {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  color: red;
  -webkit-animation: rotation 6s linear infinite;
  animation: rotation 6s linear infinite;
}
.loading-dots {
  display: flex;
  justify-content: center;
}
.loading-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 50%;
  background-color: #000000;
  animation: loading 1.8s infinite ease-in-out;
}
.loading-dot:nth-child(1) {
  animation-delay: 0.3s;
}
.loading-dot:nth-child(2) {
  animation-delay: 0.6s;
}
.loading-dot:nth-child(3) {
  animation-delay: 0.9s;
}
@keyframes loading {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@media (prefers-color-scheme: light) {
  body {
    background: #fff;
    color: #191919;
  }
  .loading-dot {
    background-color: #191919;
  }
  #app-loading {
    color: #191919;
  }
}
@media (prefers-color-scheme: dark) {
  body {
    background: #191919;
    color: #fff;
  }
  .loading-dot {
    background-color: #d9d9d9;
  }
  #app-loading {
    color: #d9d9d9;
  }
}
</style>
