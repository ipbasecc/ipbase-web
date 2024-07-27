<template>
  <!-- <span class="z-max">{{ typeof chartRef }}</span> -->
  <div v-if="axisDataRef" id="main" class="fit chart" ref="chartRef" />
  <q-dialog
    v-model="show_cardDetial"
    full-height
    full-width
    transition-show="slide-down"
    transition-hide="slide-up"
    transition-duration="300"
    @show="teamStore.showCards = true"
    @hide="leaveCard()"
    class="blur-sm transition"
  >
    <CardPage />
  </q-dialog>
</template>

<script setup>
import { ref, shallowRef, onMounted, toRef, watch, onBeforeUnmount } from "vue";
import CardPage from "src/pages/team/card/CardPage.vue";

import * as echarts from "echarts";
import { updateCard } from "src/api/strapi/project.js";
import { useQuasar } from "quasar";
import { teamStore } from "src/hooks/global/useStore.js";

const $q = useQuasar();
const props = defineProps({
  axisData: {
    type: Array,
    default() {
      return [];
    },
  },
  taskContainerSIze: {
    type: Object,
    default() {
      return {};
    },
  },
  id: {
    type: Number,
    default: -1,
  },
});
const idRef = toRef(props, "id");
const axisDataRef = toRef(props, "axisData");
const taskContainerSIzeRef = toRef(props, "taskContainerSIze");
const CardId = ref();
const chartRef = shallowRef();

const chart = ref();
const initECharts = () => {
  if (!chartRef.value || !taskContainerSIzeRef.value) return;
  chart.value = echarts.init(chartRef.value, $q.dark.mode ? "dark" : "light");
  const base = () => {
    // 把配置和数据放这里
    chart.value.setOption(
      {
        backgroundColor: "#00000000",
        tooltip: {
          triggerOn: "none",
          formatter: function (params) {
            return params.data[2];
          },
        },
        grid: {
          left: "32px",
          top: "32px",
          width: `${taskContainerSIzeRef.value?.width - 64}px`,
          height: `${taskContainerSIzeRef.value?.height - 64}px`,
        },
        xAxis: {
          show: true,
          type: "value",
          min: 0,
          max: 100,
          interval: 25,
          axisLine: {
            onZero: false,
            lineStyle: {
              width: 0,
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
              color: "#aaaaaa50",
            },
          },
        },
        yAxis: {
          show: true,
          type: "value",
          min: 0,
          max: 100,
          interval: 25,
          axisLine: {
            onZero: false,
            lineStyle: {
              width: 0,
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
              color: "#aaaaaa50",
            },
          },
        },
        series: [
          {
            id: idRef.value,
            data: axisDataRef.value,
            symbolSize: function (arg) {
              return arg[5] * 1.5 + 30; // 使用卡片分值 + 30 作为元素的大小
            },
            itemStyle: {
              color: function (arg) {
                var x = arg[0];
                var y = arg[1];
                if (x > 5 && y > 5) {
                  return new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                    {
                      offset: 0,
                      color: "rgb(129, 227, 238)",
                    },
                    {
                      offset: 1,
                      color: "rgb(25, 183, 207)",
                    },
                  ]);
                } else {
                  return new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                    {
                      offset: 0,
                      color: "rgb(129, 227, 238)",
                    },
                    {
                      offset: 1,
                      color: "rgb(25, 183, 207)",
                    },
                  ]);
                }
              },
            },
            label: {
              show: true,
              formatter: function (param) {
                return param.data[2];
              },
              position: "top",
              color: "grey",
            },
            // 此处使用折线图，将线条宽度设置为 0 从而看上去显示散点图，因为散点图开启拖拽后性能非常差
            type: "line",
            lineStyle: {
              width: 0,
            },
            showEffectOn: "emphasis",
            rippleEffect: {
              scale: 3,
            },
          },
        ],
      },
      true
    );
  };
  const setDrag = () => {
    if(teamStore.shareInfo) return
    chart.value.setOption({
      // 声明一个 graphic component，里面有若干个 type 为 'circle' 的 graphic elements。
      // 这里使用了 echarts.util.map 这个帮助方法，其行为和 Array.prototype.map 一样，但是兼容 es5 以下的环境。
      // 用 map 方法遍历 data 的每项，为每项生成一个圆点。
      graphic: echarts.util.map(
        axisDataRef.value,
        function (dataItem, dataIndex) {
          return {
            // 'circle' 表示这个 graphic element 的类型是圆点。
            type: "circle",

            shape: {
              // 圆点的半径。
              r: 10,
              color: "red",
            },

            // 用 transform 的方式对圆点进行定位。position: [x, y] 表示将圆点平移到 [x, y] 位置。
            // 这里使用了 convertToPixel 这个 API 来得到每个圆点的位置，下面介绍。
            position: chart.value.convertToPixel("grid", dataItem),

            // 这个属性让圆点不可见（但是不影响他响应鼠标事件）。
            invisible: true,
            // 这个属性让圆点可以被拖拽。
            draggable: true,
            ondragend: function (event) {
              // 此时dataItem数值还是旧数据，因此从根数据中取
              let last_data = axisDataRef.value[dataIndex];
              let params = {
                data: {
                  urgency: last_data[0]?.toFixed(2),
                  importance: last_data[1]?.toFixed(2),
                },
              };
              updateCardFn(dataItem[3], params);
            },
            // 把 z 值设得比较大，表示这个圆点在最上方，能覆盖住已有的折线图的圆点。
            z: 1000,
            // 此圆点的拖拽的响应事件，在拖拽过程中会不断被触发。下面介绍详情。
            // 这里使用了 echarts.util.curry 这个帮助方法，意思是生成一个与 onPointDragging
            // 功能一样的新的函数，只不过第一个参数永远为此时传入的 dataIndex 的值。
            ondrag: echarts.util.curry(onPointDragging, dataIndex, dataItem),
          };
        }
      ),
    });
  };
  const setTooltip = () => {
    chart.value.setOption({
      // ...,
      tooltip: {
        // 表示不使用默认的“显示”“隐藏”触发规则。
        triggerOn: "none",
        formatter: function (param) {
          return param.data[2];
        },
        renderMode: "html",
        className: "tooltip-class",
        backgroundColor: "rgba(50,50,50,0.7)", // 提示框浮层的背景颜色。
        borderColor: "#ccc", // 提示框浮层的边框颜色。
        borderWidth: 1, // 提示框浮层的边框宽。
        padding: 8, // 提示框浮层内边距，
        textStyle: {
          // 提示框浮层的文本样式。
          overflow: "break",
          color: "#fff",
          fontStyle: "normal",
          fontWeight: "normal",
          fontFamily: "sans-serif",
        },
        //额外附加到浮层的 css 样式 ;
        //white-space:pre-wrap的作用是保留空格，并且除了碰到源码中的换行和<br/>会换行外
        //还会自适应容器的边界进行换行。
        extraCssText: "white-space:pre-wrap",
      },
      graphic: axisDataRef.value.map(function (dataItem, dataIndex) {
        return {
          type: "circle",
          // ...,
          // 在 mouseover 的时候显示，在 mouseout 的时候隐藏。
          // onmousemove: echarts.util.curry(setid, dataIndex),
          onmousemove: echarts.util.curry(showTooltip, dataIndex),
          onmouseout: echarts.util.curry(hideTooltip, dataIndex),
          ondblclick: echarts.util.curry(enterCard, dataIndex),
          // ondblclick: function (dataItem) {
          //   CardId.value = dataItem;
          //   showTaskDetial.value = true;
          // },
        };
      }),
    });
  };

  chart.value.on("click", function (params) {
    CardId.value = params.data;
  });

  function showTooltip(dataIndex) {
    chart.value.dispatchAction({
      type: "showTip",
      seriesIndex: 0,
      dataIndex: dataIndex,
    });
  }

  const enterCard = (dataIndex) => {
    if (axisDataRef.value[dataIndex][4] === "task") {
      teamStore.activedCard_id = axisDataRef.value[dataIndex][3];
      show_cardDetial.value = true;
    }
  };

  function hideTooltip(dataIndex) {
    chart.value.dispatchAction({
      type: "hideTip",
    });
  }

  // 拖拽某个圆点的过程中会不断调用此函数。
  // 此函数中会根据拖拽后的新位置，改变 data 中的值，并用新的 data 值，重绘折线图，从而使折线图同步于被拖拽的隐藏圆点。
  function onPointDragging(dataIndex, dataItem) {
    const _attach = [dataItem[2], dataItem[3], dataItem[4], dataItem[5]];
    // 这里的 data 就是本文最初的代码块中声明的 data，在这里会被更新。
    // 这里的 this 就是被拖拽的圆点。this.position 就是圆点当前的位置。
    axisDataRef.value[dataIndex] = chart.value.convertFromPixel("grid", [
      this.x,
      this.y,
    ]);
    // 需要补充完整的数据内容，否则元素名称在拖拽时显示位置数字
    axisDataRef.value[dataIndex].push(..._attach);
  }

  watch(
    axisDataRef,
    () => {
      if (axisDataRef.value) {
        base();
        // 下方的初始化必须在chart初始化之后才能进行，
        // 因此将整个初始化事件放在watch下依次完成，
        // 不可以使用setTimeout完成，setDrag内convertToPixel会触发警告
        setDrag();
        setTooltip();
      }
    },
    { immediate: true, deep: true }
  );

  watch(
    taskContainerSIzeRef,
    () => {
      chart.value.resize();
      base();
      setDrag();
      setTooltip();
    },
    { deep: true }
  );
};

const show_cardDetial = ref(false);

const leaveCard = () => {
  teamStore.showCards = false;
  teamStore.activedCard_id = null;
  teamStore.card = null;
  teamStore.cards = [];
};

onMounted(() => {
  initECharts();
});
onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.off("click");
    chart.value.dispose();
    chart.value = void 0;
  }
});
const emit = defineEmits(["QuadrantChange"]);
const updateCardFn = async (id, params) => {
  let res = await updateCard(id, params);
  if (res) {
    emit("QuadrantChange", id, params);
  }
};
</script>

<style scoped>
/* 需要为图表设置一个基础的宽高，否则初始化时控制台报警告 */
.chart {
  min-width: 500px;
  min-height: 500px;
}
</style>
