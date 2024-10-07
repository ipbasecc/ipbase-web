import {ref} from 'vue';
export function useProjectCardPreference() {
  return [
    {
      val: "status",
      label: "状态",
      enable: true,
      description: "显示和设置卡片状态：待处理、处理中、遇阻、待审核、已完成",
    },
    {
      val: "score",
      label: "分值",
      enable: false,
      description:
        "管理成员可以为每项任务指定分值，以便后期统计每个成员对项目的共享，关闭后该功能不可用",
    },
    {
      val: "percent",
      label: "进度",
      enable: true,
      description:
        "如果卡片是待办类型，那么会在左上角显示已完成待办的进度，你可以在此控制该内容是否显示在卡片上",
    },
    {
      val: "executor",
      label: "负责人",
      enable: true,
      description: "显示和设置卡片的“负责人”，禁用则不会在卡片上显示",
    },
    {
      val: "follow",
      label: "关注",
      enable: false,
      description: "显示和设置卡片的“关注”功能，禁用后“关注卡片”功能不可见",
    },
    {
      val: "color_marker",
      label: "颜色标签",
      enable: true,
      description: "卡片右下角会显示颜色指示灯，仅用该功能将不可用",
    },
  ];
}
export function useProjectCanEnableItems() {
  return [
    {
      icon: "tune",
      name: "multiple_boards",
      label: "工作空间",
      enable: true,
      description:
        "允许创建多个工作空间，以便在同一个项目中，启用多个任务管理应用",
      locked: false,
      locked_tip:
        "该项目已经存在多个工作空间，不能禁用该功能，否则除了第一个工作空间外，其它均不能正常访问",
    },
  ];
}

export const colorMarks = [
  "primary",
  "secondary",
  "accent",
  "positive",
  "red",
  "info",
  "warning",
  "clear",
];

export const cardTypes = ref([
  { val: "task", label: "task", icon: "task_alt" },
  { val: "note", label: "note", icon: "event_note" },
  { val: "todo", label: "todo", icon: "checklist" },
]);

export const preferences = {
  status: "status",
  score: "score",
  percent: "percent",
  executor: "executor",
  follow: "follow",
  color_marker: "color_marker",
};

export const shareProps = ref([
  { val: "card_todo", label: "todo", enable: false },
  { val: "card_kanban", label: "task", enable: false },
  { val: "card_documents", label: "document", enable: false },
  { val: "card_storage", label: "storage", enable: false },
  { val: "card_schedule", label: "schedule", enable: false },
  { val: "card_feedback", label: "feedback", enable: false },
]);