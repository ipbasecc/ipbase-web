
import { i18n } from 'src/boot/i18n.js';
const $t = i18n.global.t;

export function useProjectCardPreference() {
  return [
    {
      val: "status",
      label: 'project_enable_tmpl_status_label',
      enable: true,
      description: 'project_enable_tmpl_status_label',
    },
    {
      val: "score",
      label: 'project_enable_tmpl_score_label',
      enable: false,
      description: 'project_enable_tmpl_score_desc',
    },
    {
      val: "percent",
      label: 'project_enable_tmpl_percent_label',
      enable: true,
      description: 'project_enable_tmpl_percent_desc',
    },
    {
      val: "executor",
      label: 'project_enable_tmpl_executor_label',
      enable: true,
      description: 'project_enable_tmpl_executor_desc',
    },
    {
      val: "follow",
      label: 'project_enable_tmpl_follow_label',
      enable: false,
      description: 'project_enable_tmpl_follow_desc',
    },
    {
      val: "color_marker",
      label: 'project_enable_tmpl_color_marker_label',
      enable: true,
      description: 'project_enable_tmpl_color_marker_desc',
    },
  ];
}
export function useProjectCanEnableItems() {
  return [
    {
      icon: "tune",
      name: "multiple_boards",
      label: 'project_enable_tmpl_multiple_boards_label',
      enable: true,
      description: 'project_enable_tmpl_multiple_boards_desc',
      locked: false,
      locked_tip: 'project_enable_tmpl_multiple_boards_locked_tip',
    },
  ];
}
