import {clearLocalDB} from "pages/team/hooks/useUser";

const routes = [
  {
    path: "/",
    component: () => import("layouts/TeamLayout.vue"),
    name: "teampage",
    redirect: "/teams",
    meta: {
      requireAuth: true,
      title: "易乎APP",
    },
    children: [
      {
        path: "/teams",
        component: () => import("pages/team/TeamPage.vue"),
        props: true,
        name: "teams",
        children: [
          {
            path: "/teams/:channel_id",
            component: () => import("pages/team/chat/TeamChat.vue"),
            name: "team_channel_homepage",
            props: true,
          },
          {
            path: "/teams/projects",
            component: () => import("pages/team/ProjectBody.vue"),
            name: "team_project_homepage",
            props: true
          },
          {
            path: "/teams/projects/:project_id",
            component: () => import("pages/team/ProjectBody.vue"),
            name: "team_projects_page",
            props: true,
            children: [
              {
                path: "/teams/projects/:project_id/chat",
                component: () => import("pages/team/chat/TeamChat.vue"),
                name: "team_project_chat_homepage",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/chat/:channel_id",
                component: () => import("pages/team/chat/TeamChat.vue"),
                name: "team_project_chat_page",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/kanban",
                component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                name: "team_kanban_homepage",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/kanban/:kanban_id",
                component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                name: "team_kanban_page",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/classroom",
                component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                name: "team_classroom_homepage",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/classroom/:kanban_id",
                component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                name: "team_classroom_page",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/resource",
                component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                name: "team_resource_homepage",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/resource/:kanban_id",
                component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                name: "team_resource_page",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/document",
                component: () => import("src/pages/team/document/DocumentBody.vue"),
                name: "team_project_document_homepage",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/document/:document_id",
                component: () => import("src/pages/team/document/DocumentBody.vue"),
                name: "team_project_document_page",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/storage",
                component: () =>
                    import("src/pages/team/storage/StoragePage.vue"),
                name: "team_project_storage_homepage",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/storage/:storage_id",
                component: () =>
                    import("src/pages/team/storage/StoragePage.vue"),
                name: "team_project_storage_page",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/schedule",
                component: () =>
                    import("src/pages/team/schedule/SchedulePage.vue"),
                name: "team_project_schedule_homepage",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/schedule/:schedule_id",
                component: () =>
                    import("src/pages/team/schedule/SchedulePage.vue"),
                name: "team_project_schedule_page",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/segment",
                component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                name: "team_segment_homepage",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/segment/:kanban_id",
                component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                name: "team_segment_page",
                props: true,
              },
              {
                path: "/teams/projects/:project_id/budget",
                component: () => import("src/pages/team/budget/BudgetPage.vue"),
                name: "team_budget_homepage",
                props: true,
              },
            ],
          },
          {
            path: "/teams/:team_id/news",
            component: () => import("src/pages/team/news/NewsPage.vue"),
            name: "team_news_page",
            props: true,
            children: [
              {
                path: "/teams/:team_id/news/:news_id",
                component: () => import("src/pages/team/news/NewsDetailPage.vue"),
                name: "team_news_detail_page",
                props: true,
              }
            ]
          },
          {
            path: "/teams/:team_id/orders",
            component: () => import("src/pages/team/order/OrderPage.vue"),
            name: "team_order_page",
            props: true,
            children: [
              {
                path: "/teams/:team_id/orders/:order_id",
                component: () => import("src/pages/team/order/OrderCard.vue"),
                name: "team_order_card_page",
                props: true,
              }
            ]
          },
        ],
        meta: {
          requireAuth: true,
          title: "团队——易乎APP",
        },
      },
      {
        path: "/business",
        component: () => import("pages/business/BusinessIndex.vue"),
        name: "BusinessIndex",
        redirect: "/business/main",
        children: [
          {
            path: "/business/main",
            component: () => import("pages/business/BusinessPage.vue"),
            name: "BusinessPage",
            props: true,
          },
          {
            path: "/business/info",
            component: () => import("pages/business/AccountInfo.vue"),
            name: "BusinessAccount",
            props: true,
          }
        ]
      },
      {
        path: "/teams/test",
        component: () => import("src/pages/team/TestPage.vue"),
        name: "team_test",
        props: true,
      },
      {
        path: "/teams/:team_id/external",
        component: () => import("src/pages/team/ExternalPage.vue"),
        name: "team_projects_external_homepage",
        props: true,
      },
      {
        path: "/teams/:team_id/external/:project_id",
        component: () => import("src/pages/team/ExternalPage.vue"),
        name: "team_projects_external_page",
        props: true,
      },
      {
        path: "/teams/:team_id/focus",
        component: () => import("src/pages/team/ExternalPage.vue"),
        name: "team_projects_focus_homepage",
        props: true,
      },
      {
        path: "/teams/:team_id/focus/:project_id",
        component: () => import("src/pages/team/ExternalPage.vue"),
        name: "team_projects_focus_page",
        props: true,
      },
      {
        path: "/discover",
        component: () => import("src/pages/team/discover/DiscoverPage.vue"),
        props: true,
        name: "discover",
        meta: {
          requireAuth: true,
          title: "discover",
        },
        children: [
          {
            path: "/discover/:card_id",
            component: () => import("src/pages/team/discover/DiscoverDetail.vue"),
            name: "discover_card_detail",
            props: true,
          },
          {
            path: "/discover/my/tutorial",
            component: () => import("src/pages/team/discover/my/TutorialList.vue"),
            name: "discover_my_tutorial",
            props: true,
          },
          {
            path: "/discover/my/tutorial/:card_id",
            component: () => import("src/pages/team/discover/DiscoverDetail.vue"),
            name: "tutorial_card_detail",
            props: true,
          },
          {
            path: "/discover/my/favorite",
            component: () => import("src/pages/team/discover/my/FavoriteList.vue"),
            name: "discover_my_favorite",
            props: true,
          },
          {
            path: "/discover/my/favorite/:card_id",
            component: () => import("src/pages/team/discover/DiscoverDetail.vue"),
            name: "favorite_card_detail",
            props: true,
          },
          {
            path: "/discover/my/liked",
            component: () => import("src/pages/team/discover/my/LikedList.vue"),
            name: "discover_my_like",
            props: true,
          },
          {
            path: "/discover/my/liked/:card_id",
            component: () => import("src/pages/team/discover/DiscoverDetail.vue"),
            name: "like_card_detail",
            props: true,
          },
        ]
      },
      {
        path: "/affairs",
        component: () => import("pages/team/AffairsPage.vue"),
        name: "AffairsPage",
      },
      {
        path: "/notebooks",
        component: () => import("pages/team/notebook/NotebookPage.vue"),
        name: "NotebookPage",
        children: [
          {
            path: "/notebooks/:notebook_id",
            component: () => import("pages/team/notebook/NotebookDetial.vue"),
            name: "NotebookDetial",
            props: true,
            children: [
              {
              path: "/notebooks/:notebook_id/:note_id",
              component: () => import("src/pages/team/notebook/note/NoteDetial.vue"),
              name: "NoteDetial",
              props: true,
              }
            ]
          }
        ]
      },
      {
        path: "/chats",
        component: () => import("src/pages/team/ChatsPage.vue"),
        name: "ChatsPage",
        children: [
          {
            path: "/chats/:channel_id",
            component: () => import("src/pages/team/chat/ChatContainter.vue"),
            name: "DirectChatPage",
            props: true,
          }
        ]
      },
      {
        path: "/threads",
        component: () => import("pages/team/ThreadsPage.vue"),
        name: "team_threads_homepage",
        props: true,
      },
      {
        path: "/userinfo",
        component: () => import("src/pages/UserCenter/UserInfo.vue"),
        props: true,
        children: [
          {
            path: "/userinfo/basicinfo",
            component: () =>
              import("src/pages/UserCenter/Manager/BasicInfo.vue"),
            props: true,
            name: "basicinfo",
          },
          {
            path: "/userinfo/article",
            component: () =>
              import(
                "src/pages/UserCenter/Manager/Element/ElementManagement.vue"
              ),
            props: true,
            meta: { type: "article", where: "userCenter" },
          },
          {
            path: "/userinfo/video",
            component: () =>
              import(
                "src/pages/UserCenter/Manager/Element/ElementManagement.vue"
              ),
            props: true,
            meta: { type: "video", where: "userCenter" },
          },
          {
            path: "/userinfo/audio",
            component: () =>
              import(
                "src/pages/UserCenter/Manager/Element/ElementManagement.vue"
              ),
            props: true,
            meta: { type: "audio", where: "userCenter" },
          },
          {
            path: "/userinfo/settings",
            component: () =>
              import("src/pages/UserCenter/Manager/UserSettings.vue"),
            props: true,
            name: "settings",
          },
          {
            path: "/userinfo/bizcard",
            component: () => import("src/pages/UserCenter/Manager/BizCard.vue"),
            props: true,
            name: "bizcard",
          },
        ],
        meta: {
          requireAuth: true,
          title: "用户中心——易乎APP",
        },
      },
      {
        path: "/brand",
        component: () => import("pages/IndexPage.vue"),
        props: true,
        name: "brand",
        meta: {
          requireAuth: false,
          title: "易乎APP",
        }
      },
      {
        path: "/brand/:id",
        component: () => import("pages/ChannelPage/IndexPage.vue"),
        props: true,
        name: "channel_homepage",
        children: [
          {
            path: "/brand/:id/posts",
            component: () =>
              import("src/pages/ChannelPage/Discover/DiscoverIndex.vue"),
            props: true,
            name: "posts",
          },
          {
            path: "/brand/:id/articles",
            component: () =>
              import("src/pages/ChannelPage/Elements/IndexPage.vue"),
            props: true,
            name: "article",
          },
          {
            path: "/brand/:id/videos",
            component: () =>
              import("src/pages/ChannelPage/Elements/IndexPage.vue"),
            props: true,
            name: "video",
          },
          {
            path: "/brand/:id/audios",
            component: () =>
              import("src/pages/ChannelPage/Elements/IndexPage.vue"),
            props: true,
            name: "audio",
          },
          {
            path: "/brand/:id/element/:elementid",
            component: () =>
              import("src/pages/ChannelPage/Elements/DetialPage.vue"),
            props: true,
            name: "element",
            meta: {
              showMaker: true,
            },
          },
          {
            path: "/brand/:id/sales",
            component: () => import("pages/ChannelPage/Sales/IndexPage.vue"),
            props: true,
            name: "sales",
          },
          {
            path: "/brand/:id/bizcard",
            component: () => import("src/pages/BizCard/IndexPage.vue"),
            props: true,
            name: "bizcard",
          },
          {
            path: "/brand/:id/favorite",
            component: () =>
              import(
                "src/pages/ChannelPage/Elements/Components/Favorite/FavoriteManager.vue"
              ),
            props: true,
            name: "favorite",
          },
        ],
        meta: {
          title: "易乎品牌",
        },
      },
    ],
  },

  {
    path: "/",
    component: () => import("layouts/CleanLayout.vue"),
    children: [
      {
        path: "/register",
        component: () => import("src/pages/UserCenter/RegisterPage.vue"),
        name: "register",
        beforeEnter: async (to, from, next) => {
          await clearLocalDB('register');
          next();
        },
        meta: {
          requireAuth: false,
          title: "用户注册——易乎APP",
        },
      },
      {
        path: "/email-confirmed",
        component: () =>
          import("src/pages/UserCenter/RegisterSteps/EmailConfirmed.vue"),
        name: "confirmed",
        beforeEnter: async (to, from, next) => {
          await clearLocalDB('email-confirmed');
          next();
        },
        meta: {
          requireAuth: false,
          title: "邮件验证——易乎APP",
        },
      },
      {
        path: "/login",
        component: () => import("src/pages/UserCenter/LoginPage.vue"),
        name: "login",
        beforeEnter: async (from) => {
          console.log('from', from);
        },
        meta: {
          requireAuth: false,
          title: "用户登陆——易乎APP",
        },
      },
      {
        path: "/forgot-password",
        component: () => import("src/pages/UserCenter/ForgotPassword.vue"),
        name: "forgot",
        beforeEnter: async (to, from, next) => {
          await clearLocalDB('forgot');
          next();
        },
        meta: {
          requireAuth: false,
          title: "忘记密码——易乎APP",
        },
      },
      {
        path: "/reset-password",
        component: () => import("src/pages/UserCenter/ResetPassword.vue"),
        name: "reset",
        beforeEnter: async (to, from, next) => {
          await clearLocalDB('reset');
          next();
        },
        meta: {
          requireAuth: false,
          title: "重设密码——易乎APP",
        },
      },
      {
        path: "/schedule/share/:id",
        component: () => import("src/pages/team/schedule/SharedPage.vue"),
        name: "shared_schedule",
        meta: {
          requireAuth: false,
          title: "共享的规划",
        },
      },
      {
        path: "/card/share/:id",
        component: () => import("src/pages/team/card/ShareCard.vue"),
        name: "shared_card",
        meta: {
          requireAuth: false,
          title: "共享的Card",
        },
      },
    ],
  },
  {
    path: "/create_team",
    component: () => import("src/pages/Chat/components/Team/CreateTeam.vue"),
    props: true,
  },
  {
    path: "/join",
    component: () => import("src/pages/JoinPage.vue"),
    props: true,
  },

  {
    path: "/test",
    component: () => import("src/test/TestPage.vue"),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
