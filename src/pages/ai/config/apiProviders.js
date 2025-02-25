export const defaultProviders = [
    {
        id: 'deepseek',
        name: 'DeepSeek',
        defaultEndpoint: 'https://api.deepseek.com/v1/chat/completions',
        logo: 'https://unpkg.com/@lobehub/icons-static-svg@latest/icons/deepseek.svg',
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
        logo: 'https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openai.svg',
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
        logo: 'https://unpkg.com/@lobehub/icons-static-svg@latest/icons/anthropic.svg',
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
        logo: 'https://unpkg.com/@lobehub/icons-static-svg@latest/icons/ollama.svg',
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