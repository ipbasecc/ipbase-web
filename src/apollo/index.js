import { createHttpLink, InMemoryCache } from '@apollo/client/core'
export /* async */ function getClientOptions(/* {app, router, ...} */ options) {
  return Object.assign(
    // General options.
    {
      link: createHttpLink({
        uri:
          import.meta.env.VITE_GRAPHQL_URI ||
          // Change to your graphql endpoint.
          'https://api.home.yihu.team/graphql',
      }),
      cache: new InMemoryCache(),
    },
    // Specific Quasar mode options.
    import.meta.env.MODE === 'spa'
      ? {
          //
        }
      : {},
    import.meta.env.MODE === 'ssr'
      ? {
          //
        }
      : {},
    import.meta.env.MODE === 'pwa'
      ? {
          //
        }
      : {},
    import.meta.env.MODE === 'bex'
      ? {
          //
        }
      : {},
    import.meta.env.MODE === 'cordova'
      ? {
          //
        }
      : {},
    import.meta.env.MODE === 'capacitor'
      ? {
          //
        }
      : {},
    import.meta.env.MODE === 'electron'
      ? {
          //
        }
      : {},
    // dev/prod options.
    import.meta.env.DEV
      ? {
          //
        }
      : {},
    import.meta.env.PROD
      ? {
          //
        }
      : {},
    // For ssr mode, when on server.
    import.meta.env.MODE === 'ssr' && import.meta.env.SERVER
      ? {
          ssrMode: true,
        }
      : {},
    // For ssr mode, when on client.
    import.meta.env.MODE === 'ssr' && import.meta.env.CLIENT
      ? {
          ssrForceFetchDelay: 100,
        }
      : {}
  )
}
