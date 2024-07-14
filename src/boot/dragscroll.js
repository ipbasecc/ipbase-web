import { dragscroll  } from "vue-dragscroll";

// We globally register our directive with Vue;
// Remember that all directives in Vue will start with 'v-'
// but that should not be part of your directive name
// https://v3.vuejs.org/guide/custom-directive.html#custom-directives
// 'my-directive' will be used as 'v-my-directive'
export default ({ app }) => {
  app.directive('dragscroll', dragscroll )
}
