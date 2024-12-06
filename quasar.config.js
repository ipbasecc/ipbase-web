/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js
// const { configure } = require("quasar/wrappers");
// const path = require("path");

import { configure } from "quasar/wrappers";
import { fileURLToPath } from "node:url";

export default configure((ctx) => {
  return {
    eslint: {
      /**
       * Enable or disable caching of the linting results.
       * @default true
       */
      cache: true,

      /**
       * Formatter to use
       * @default 'stylish'
       */
      // formatter: ESLint.Formatter,
      formatter: "stylish",
      // fix: true,
      // include: [],
      // exclude: [],
      // rawOptions: {},
      warnings: true,
      errors: true,
    },

    // https://v2.quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli/boot-files
    boot: [
      "server",
      "axios",
      "mmapi",
      "apollo.js",
      "service",
      "i18n",
      "hevueImgPreview",
      "dragscroll",
      "dragselect",
      "auth",
      "dexie",
      "ej2",
      "oss",
      "meet",
      "error"
      // 'addressbar-color',
      // 'localforage'
      // { path: 'websocket', server: false }
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ["app.scss"],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'ionicons-v4',
      "mdi-v5",
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      "roboto-font", // optional, you are not bound to it
      "material-icons", // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      vueRouterMode: "history", // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,
      useFilenameHashes: true,

      /**
       * Automatically open remote Vue Devtools when running in development mode.
       */
      vueDevtools: true,

      /**
       * Folder where Quasar CLI should look for .env* files.
       * Can be an absolute path or a relative path to project root directory.
       *
       * @default project root directory
       */
      // envFolder: './',
      /**
       * Additional .env* files to be loaded.
       * Each entry can be an absolute path or a relative path to quasar.config > build > envFolder.
       *
       * @example ['.env.somefile', '../.env.someotherfile']
       */
      envFiles: [".env"],

      // publicPath: '/',
      // analyze: true,
      // env: require("dotenv").config().parsed,
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      extendViteConf(viteConf) {
        viteConf.esbuild = {
          drop: ['console', 'debugger']
        }
      },
      // viteVuePluginOptions: {},

      vitePlugins: [
        [
          "@intlify/unplugin-vue-i18n/vite",
          {
            // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
            // compositionOnly: false,

            // if you want to use named tokens in your Vue I18n messages, such as 'Hello {name}',
            // you need to set `runtimeOnly: false`
            // runtimeOnly: false,

            // you need to set i18n resource including paths !
            include: [fileURLToPath(new URL("./src/i18n", import.meta.url))],
            ssr: ctx.modeName === "ssr",
          },
        ],
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true
      open: true, // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {
        dark: "auto",
      },
      directives: ["ClosePopup"],

      // iconSet: 'material-icons', // Quasar icon set
      lang: "zh-CN", // Quasar language pack

      // For special cases outside where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      components: ["QResizeObserver"],
      // directives: [],

      // Quasar plugins
      plugins: [
        "Notify",
        "Dialog",
        "AppVisibility",
        // "AddressbarColor"
      ],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
    //   pwaServiceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    // },

    // https://v2.quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        "render", // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: "GenerateSW", // 'GenerateSW' or 'InjectManifest'
      injectPwaMetaTags: true,
      // injectPwaMetaTags: boolean | ((injectParam: InjectPwaMetaTagsParams) => string),
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false,
      // useFilenameHashes: true, // Moved to quasar.config > build > useFilenameHashes
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendManifestJson (json) {}
      // extendPWACustomSWConf (esbuildConf) {}
      workboxOptions: {
        // 这两项配置会导致应用更新后，用户端会自动更新代码，并直接刷新页面，因此这里设置为false，在App.vue文件中监听并通知用户手动刷新
        skipWaiting: false, // 跳过等待
        clientsClaim: false, // 立即接管页面
      },
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|md|json|mp4|m4v)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            },
          },
        },
        {
          urlPattern: /\.(?:html|js|css)$/,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "app-shell",
            // 设置适当的 expiration 以清理旧缓存
            expiration: {
              maxEntries: 10, // 最缓存条目数
              maxAgeSeconds: 7 * 24 * 60 * 60, // 7 天
            },
          },
        },
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      preloadScripts: ["electron-preload"],
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      // specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      bundler: "builder", // 'packager' or 'builder'

      packager: {
        // asar: {
        //   unpackDir: "node_modules"
        // },
        // appId: "com.ipbase.ipbase",
        // productName: "IPBase",
        // directories: {
        //   output: "dist/electron"
        // },
      },

      builder: {
        // https://www.electron.build/configuration/configuration
        appId: "com.ipbase.ipbase",
        productName: "IPBase",
        copyright: "Copyright © 2024 IPBase",
        asar: true,
        protocols: {
          name: "ipbase-protocol",
          schemes: ["ipbase", "wss", "ws"]
        },
        // files: [
        //   'dist/electron/**/*'
        // ],
        dmg: {
          contents: [
            {
              x: 130,
              y: 220,
            },
            {
              x: 410,
              y: 220,
              type: "link",
              path: "/Applications",
            },
          ],
        },
        mac: {
          icon: fileURLToPath(new URL("./src-electron/icons/icon.icns", import.meta.url)),
          target: ["dmg"],
          identity: null, // 跳过签名步骤
        },
        win: {
          target: "msi",
          icon: fileURLToPath(new URL("./src-electron/icons/icon.ico", import.meta.url)),
          requestedExecutionLevel: "requireAdministrator"
        },
        linux: {
          target: [
            "AppImage",
            "rpm",
            "deb",
            {
              target: "flatpak",
              arch: ["x64"]
            }
          ],
          category: "Development",
          maintainer: "auxcc <jerr@foxmail.com>",
          vendor: "IPBase",
          synopsis: "IPBase Desktop Application"
        },
        flatpak: {
          base: "org.electronjs.Electron2.BaseApp",
          baseVersion: "22.08",
          runtime: "org.freedesktop.Platform",
          runtimeVersion: "22.08",
          sdk: "org.freedesktop.Sdk",
          finishArgs: [
            "--share=network",
            "--share=ipc",
            "--socket=x11",
            "--socket=wayland",
            "--device=dri"
          ]
        }
      },

      // Specify additional parameters when yarn/npm installing
      // the UnPackaged folder, right before bundling with either
      // electron packager or electron builder;
      // Example: [ 'install', '--production', '--ignore-optional', '--some-other-param' ]
      unPackagedInstallParams: ["install", "--production"],

      // optional; add/remove/change properties
      // of production generated package.json
      extendPackageJson(pkg) {
        // directly change props of pkg;
        // no need to return anything
      },

      extendElectronMainConf(cfg) {
        // do something with Esbuild config
        // for the Electron Main thread
      },

      extendElectronPreloadConf(cfg) {
        // do something with Esbuild config
        // for the Electron Preload thread
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ["my-content-script"],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },
  };
});
