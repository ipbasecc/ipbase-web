export const generateWechatLoginUrl = (isWechatBrowser) => {
    
    // 使用已配置的回调地址，electron 环境下使用本地地址
    const redirectUri = process.env.MODE === 'electron'
        ? `${process.env.APP_URI}/api/connect/wechat/callback`  // 使用线上地址
        : `${process.env.APP_URI}/api/connect/wechat/callback`

    // 确保 stateData 是一个有效的对象
    const stateData = {
        random: Math.random().toString(36).substring(7),
        loginType: isWechatBrowser ? 'mp' : 'qrcode'
    };
    
    // 先将对象转为 JSON 字符串，然后进行 Base64 编码
    // 这样可以避免特殊字符的问题
    const state = btoa(JSON.stringify(stateData));
    
    const appId = isWechatBrowser ? process.env.WECHAT_SERVICE_APP_ID : process.env.WECHAT_APP_ID
    
    // 根据环境选择不同的URL和参数
    const baseUrl = isWechatBrowser 
        ? 'https://open.weixin.qq.com/connect/oauth2/authorize'
        : 'https://open.weixin.qq.com/connect/qrconnect'
    
    const scope = isWechatBrowser ? 'snsapi_base' : 'snsapi_login'
    
    // 只对 redirectUri 进行一次编码
    return `${baseUrl}?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
}