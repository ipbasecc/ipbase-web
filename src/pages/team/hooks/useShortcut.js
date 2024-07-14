// shorcut
import { onKeyStroke } from "@vueuse/core";
import { teamStore, uiStore } from "src/hooks/global/useStore";

export default function shortcut() {
  onKeyStroke(["shiftKey", "<"], (e) => {
    if (uiStore.disable_shortcut) return;
    e.preventDefault();
    if (uiStore.navigatorDrawer && teamStore.team) {
      uiStore.navigatorDrawer = false;
    } else if (uiStore.projectLeftDrawer && teamStore.project) {
      uiStore.projectLeftDrawer = false;
    } else {
      uiStore.appDrawer = false;
    }
  });
  onKeyStroke(["shiftKey", ">"], (e) => {
    if (uiStore.disable_shortcut) return;
    e.preventDefault();
    if (!uiStore.isFocusMode && !uiStore.projectLeftDrawer && teamStore.project) {
      uiStore.projectLeftDrawer = true;
    } else if (!uiStore.navigatorDrawer && teamStore.team) {
      uiStore.navigatorDrawer = true;
    } else {
      uiStore.appDrawer = true;
    }
  });
  onKeyStroke(["shiftKey", "/"], (e) => {
    if (uiStore.disable_shortcut) return;
    e.preventDefault();
    if (uiStore.activeReel && teamStore.card) {
      uiStore.segmentDrawer = !uiStore.segmentDrawer;
    }
  });
  onKeyStroke(["Escape"], (e) => {
    if (uiStore.disable_shortcut) return;
    e.preventDefault();
    if (teamStore.kanban_rightDrawer) {
      teamStore.kanban_rightDrawer = null;
      teamStore.thread = null;
    }
  });
}
