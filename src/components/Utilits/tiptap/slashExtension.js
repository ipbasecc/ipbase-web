import { Extension } from "@tiptap/core";
import { VueRenderer } from "@tiptap/vue-3";
import tippy from "tippy.js";
import Suggestion from "@tiptap/suggestion";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  MessageSquarePlus,
  Text,
  TextQuote,
  Code,
  CheckSquare,
  Sparkles,
  Image,
} from "lucide-vue-next";
import SlashCommandList from "./CommandsList.vue";
import { startImageUpload } from "./plugins/upload-images";
import {i18n} from 'src/boot/i18n.js';
import { uiStore } from "src/hooks/global/useStore";
import { ref, watch } from "vue";

const $t = i18n.global.t;
export const showAgentCard = ref(false);

const Command = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

// Removed TypeScript interfaces
const getSuggestionItems = ({ query }) => {
  return [
    {
      title: 'tiptap_slash_menu_text',
      icon: 'mdi-cursor-text',
      children: [
        {
          value: 'ai',
          title: 'AI 生成',
          description: '使用您当前的 AI 设置生成内容',
          searchTerms: ["p", "paragraph"],
          icon: Sparkles,
          command: ({ editor, range }) => {
          },
        },
        {
          title: $t('tiptap_menu_Text'),
          description: $t('tiptap_menu_Text_description'),
          searchTerms: ["p", "paragraph"],
          icon: Text,
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .toggleNode("paragraph", "paragraph")
              .run();
          },
        },
        {
          title: $t('tiptap_menu_H1'),
          description: $t('tiptap_menu_H1_description'),
          searchTerms: ["title", "big", "large"],
          icon: Heading1,
          command: ({ editor, range }) => {
            console.log('run H1');
            
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setNode("heading", { level: 1 })
              .run();
          },
        },
        {
          title: $t('tiptap_menu_H2'),
          description: $t('tiptap_menu_H2_description'),
          searchTerms: ["subtitle", "medium"],
          icon: Heading2,
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setNode("heading", { level: 2 })
              .run();
          },
        },
        {
          title: $t('tiptap_menu_H3'),
          description: $t('tiptap_menu_H3_description'),
          searchTerms: ["subtitle", "small"],
          icon: Heading3,
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setNode("heading", { level: 3 })
              .run();
          },
        },
      ]
    },
    {
      title: 'tiptap_slash_menu_list',
      icon: 'mdi-format-list-bulleted-type',
      children: [
        {
          title: $t('tiptap_menu_BulletList'),
          description: $t('tiptap_menu_BulletList_description'),
          searchTerms: ["unordered", "point"],
          icon: List,
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
          },
        },
        {
          title: $t('tiptap_menu_NumberedList'),
          description: $t('tiptap_menu_NumberedList_description'),
          searchTerms: ["ordered"],
          icon: ListOrdered,
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
          },
        },
        {
          title: $t('tiptap_menu_TodoList'),
          description: $t('tiptap_menu_TodoList_description'),
          searchTerms: ["todo", "task", "list", "check", "checkbox"],
          icon: CheckSquare,
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
          },
        },
      ]
    },
    {
      title: 'tiptap_slash_menu_block',
      icon: 'mdi-selection',
      children: [
        {
          title: $t('tiptap_menu_Quote'),
          description: $t('tiptap_menu_Quote_description'),
          searchTerms: ["blockquote"],
          icon: TextQuote,
          command: ({ editor, range }) =>
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .toggleNode("paragraph", "paragraph")
              .toggleBlockquote()
              .run(),
        },
        {
          title: $t('tiptap_menu_Code'),
          description: $t('tiptap_menu_Code_description'),
          searchTerms: ["codeblock"],
          icon: Code,
          command: ({ editor, range }) =>
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
        },
      ]
    },
    {
      title: 'tiptap_slash_menu_insert',
      icon: 'mdi-upload',
      children: [
        {
          title: $t('tiptap_menu_Image'),
          description: $t('tiptap_menu_Image_description'),
          searchTerms: ["photo", "picture", "media"],
          icon: Image,
          command: ({ editor, range }) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
              if (input.files?.length) {
                const file = input.files[0];
                const pos = editor.view.state.selection.from;
                startImageUpload(file, editor.view, pos, editor);
              }
            };
            input.click();
          },
        },
      ]
    }
  ];
};

const renderItems = () => {
  let component = null;
  let popup = null;
  let currentEditor = null;

  const cleanUp = () => {
    popup?.[0].destroy();
    component?.destroy();
    component = null;
    popup = null;
    if (currentEditor) {
      uiStore.slashMenuOpen = false;
    }
  };

  const handleClose = () => {
    cleanUp();
    if (currentEditor) {
      setTimeout(() => {
        currentEditor.commands.focus();
      }, 0);
    }
  };

  // 监听 showAgentCard 的变化
  watch(showAgentCard, (newValue) => {
    if (popup) {
      popup[0].setProps({
        hideOnClick: !newValue, // 更新 hideOnClick 属性
      });
    }
  });

  return {
    onStart: (props) => {
      currentEditor = props.editor;
      uiStore.slashMenuOpen = true;

      const handleGlobalEscape = (e) => {
        if (e.key === 'Escape' && (component || popup)) {
          handleClose();
          e.preventDefault();
        }
      };
      document.addEventListener('keydown', handleGlobalEscape);

      component = new VueRenderer(SlashCommandList, {
        props: {
          ...props,
          onClose: handleClose,
          command: (item) => {
            props.command(item);
            handleClose();
          }
        },
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy("body", {
        // 设置参考元素的客户端矩形
        getReferenceClientRect: props.clientRect,
        // 将tippy追加到文档的body元素
        appendTo: () => document.body,
        // 设置tippy的内容为组件的元素
        content: component.element,
        // 初始时不隐藏tippy
        hideOnClick: !showAgentCard.value, 
        // 创建时显示tippy
        showOnCreate: true,
        // 使tippy交互式
        interactive: true,
        // 手动触发tippy
        trigger: "manual",
        // 设置tippy的位置为元素的下方开始
        placement: "bottom-start",
        // 当tippy显示时执行的回调
        onShow() {
          showAgentCard.value = false;
          // 设置延迟以确保tippy已显示，然后聚焦搜索输入框
          setTimeout(() => {
            component?.ref?.searchInput?.focus();
          }, 0);
        },
        // 当tippy隐藏时执行的回调
        onHidden() {
          showAgentCard.value = false;
          // 移除全局的键盘事件监听器
          document.removeEventListener('keydown', handleGlobalEscape);
          // 关闭tippy
          handleClose();
        }
      });
    },
    onUpdate: (props) => {
      currentEditor = props.editor;
      component?.updateProps(props);

      popup &&
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
    },
    onKeyDown: (props) => {
      if (props.event.key === "Escape") {
        handleClose();
        props.event.preventDefault();
        return true;
      }

      if (component?.ref) {
        return component.ref.onKeyDown(props.event);
      }
      return false;
    },
    onExit: () => {
      handleClose();
    },
  };
};

const SlashCommand = Command.configure({
  suggestion: {
    items: getSuggestionItems,
    render: renderItems,
    allow: ({ editor, range }) => {
      const { $from } = editor.state.selection;
      
      const textBefore = $from.nodeBefore?.text;
      
      if (!textBefore) {
        return true;
      }
      
      const textBeforeSlash = textBefore.slice(0, -1);
      return !textBeforeSlash.trim();
    },
  },
});

export default SlashCommand;