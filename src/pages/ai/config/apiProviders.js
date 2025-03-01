import { Dark } from "quasar"

const theme = Dark.isActive ? 'dark' : 'light'
const logoCdnPerfix = `https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/${theme}`

// 搜索服务提供商
export const searchProviders = [
    {
        id: 'tavily',
        name: 'Tavily',
        defaultEndpoint: 'https://api.tavily.com/search',
        logo: 'https://tavily.com/favicon.ico',
        description: 'Tavily是一个强大的搜索API，可以为AI助手提供实时的互联网搜索能力。'
    }
]

export const defaultProviders = [
    {
        id: 'deepseek',
        name: 'DeepSeek',
        defaultEndpoint: 'https://api.deepseek.com/v1/chat/completions',
        logo: `${logoCdnPerfix}/deepseek.png`,
        models: [
            { id: 'deepseek-chat', name: 'DeepSeek Chat', default: true },
            { id: 'deepseek-coder', name: 'DeepSeek Coder', default: false },
            { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', default: true }
        ]
    },
    {
        id: 'openai',
        name: 'OpenAI',
        defaultEndpoint: 'https://api.openai.com/v1/chat/completions',
        logo: `${logoCdnPerfix}/openai.png`,
        models: [
            { id: 'gpt-4', name: 'GPT-4', default: true },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', default: true },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', default: true }
        ]
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        defaultEndpoint: 'https://api.anthropic.com/v1/messages',
        logo: `${logoCdnPerfix}/anthropic.png`,
        models: [
            { id: 'claude-3-opus', name: 'Claude 3 Opus', default: true },
            { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', default: true },
            { id: 'claude-2.1', name: 'Claude 2.1', default: false }
        ]
    },
    {
        id: 'ollama',
        name: 'Ollama',
        defaultEndpoint: 'http://localhost:11434',
        logo: `${logoCdnPerfix}/ollama.png`,
        models: [],  // 模型列表将通过API动态获取
        tip: '调用本地Ollama服务需要配置CROS，允许服务端跨域请求'
    },
    // {
    //     id: 'custom',
    //     name: '自定义',
    //     defaultEndpoint: '',
    //     logo: 'https://cdn-icons-png.flaticon.com/512/5233/5233764.png',
    //     models: []
    // }
] 