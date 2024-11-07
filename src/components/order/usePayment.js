export default function usePayment() {
    const paymentWays = [
        // 'QR_CASHIER',	//聚合扫码(用户扫商家)
        // 'AUTO_BAR',	//聚合条码(商家扫用户)
        // 'ALI_BAR',	//支付宝条码
        // 'ALI_JSAPI',	//支付宝生活号
        // 'ALI_APP',	//支付宝APP
        // 'ALI_WAP',	//支付宝WAP
        // 'ALI_PC',	//支付宝PC网站
        // 'ALI_QR',	//支付宝二维码
        // 'WX_BAR',	//微信条码
        // 'WX_JSAPI',	//微信公众号
        // 'WX_LITE',	//微信小程序
        // 'WX_APP',	//微信APP
        // 'WX_H5',	//微信H5
        // 'WX_NATIVE',	//微信扫码
        // 'YSF_BAR',	//云闪付条码
        // 'YSF_JSAPI'	//云闪付jsapi
        {
            way: 'WX_NATIVE',
            logo: '',
            title: '微信支付',
            color: 'positive'
        },
        {
            way: 'ALI_PC',
            logo: '',
            title: '支付宝',
            color: 'primary'
        },
    ]

    return {
        paymentWays
    }
} 