import { ApolloClient, ApolloLink, InMemoryCache /*,  */ } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { createHttpLink } from '@apollo/client/link/http';
import { ApolloClients } from '@vue/apollo-composable'
import { provideApolloClient } from "@vue/apollo-composable";
import { boot } from 'quasar/wrappers'
import { $server } from 'src/boot/server.js'

// import { getClientOptions } from 'src/apollo'

const setAPI = async () => {
  let GRAPHQL_URI
  const { graphql_endpoint } = await $server();
  // console.log('graphql_endpoint', graphql_endpoint)
  if(graphql_endpoint && graphql_endpoint !== "") {
    GRAPHQL_URI = graphql_endpoint
  } else {
    GRAPHQL_URI = process.env.GRAPHQL_URI || 'https://api.yihu.team/graphql'
  }
  return GRAPHQL_URI
}
export default boot(
  async ({ app }) => {
    // 创建一个authLink
    const authLink = setContext((_, { headers }) => {
      // 从本地存储中获取JWT令牌
      const token = JSON.parse(localStorage.getItem('jwt'));
      // 返回新的头部对象，包含JWT令牌
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        }
      }
    });
    const GRAPHQL_URI = await setAPI();
    // 创建一个HTTP链接
    const httpLink = createHttpLink({
      uri: GRAPHQL_URI
    });

    // 组合authLink和httpLink
    const link = ApolloLink.concat(authLink, httpLink);

    // 创建Apollo客户端实例，并传递link
    const apolloClient = new ApolloClient({
      link,
      cache: new InMemoryCache(),
      // 其他配置选项
    });

    // Default client.
    // const options = /* await */ getClientOptions(/* {app, router ...} */)
    // const apolloClient = new ApolloClient(options)
    // // Additional client `clientA`
    // const optionsA = { ...options }
    // // Modify options as needed.
    // optionsA.link = createHttpLink({ uri: 'http://clientA.example.com' })
    // const clientA = new ApolloClient(optionsA)
    // // Additional client `clientB`
    // const optionsB = { ...options }
    // // Modify options as needed.
    // optionsB.link = createHttpLink({ uri: 'http://clientB.example.com' })
    // const clientB = new ApolloClient(optionsB)
    const apolloClients = {
      default: apolloClient,
      // clientA,
      // clientB,
    }
    app.provide(ApolloClients, apolloClients);
    provideApolloClient(apolloClient);
  }
)
