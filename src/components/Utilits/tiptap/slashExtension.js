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

const $t = i18n.global.t;

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
      title: $t('tiptap_menu_TodoList'),
      description: $t('tiptap_menu_TodoList_description'),
      searchTerms: ["todo", "task", "list", "check", "checkbox"],
      icon: CheckSquare,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: $t('tiptap_menu_H1'),
      description: $t('tiptap_menu_H1_description'),
      searchTerms: ["title", "big", "large"],
      icon: Heading1,
      command: ({ editor, range }) => {
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
    {
      title: $t('tiptap_menu_Image'),
      description: $t('tiptap_menu_Image_description'),
      searchTerms: ["photo", "picture", "media"],
      icon: Image,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
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
  ].filter((item) => {
    if (typeof query === "string" && query.length > 0) {
      const search = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        (item.searchTerms &&
          item.searchTerms.some((term) => term.includes(search)))
      );
    }
    return true;
  });
};

const renderItems = () => {
  let component = null;
  let popup = null;

  return {
    onStart: (props) => {
      component = new VueRenderer(SlashCommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },
    onUpdate: (props) => {
      component?.updateProps(props);

      popup &&
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
    },
    onKeyDown: (props) => {
      if (props.event.key === "Escape") {
        popup?.[0].hide();
        return true;
      }
      return component?.ref?.onKeyDown(props.event);
    },
    onExit: () => {
      popup?.[0].destroy();
      component?.destroy();
    },
  };
};

const SlashCommand = Command.configure({
  suggestion: {
    items: getSuggestionItems,
    render: renderItems,
  },
});

export default SlashCommand;