import OSS from "ali-oss";
import axios from "axios";
import { Notify } from "quasar";
import { ossStore } from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';
import { manualDecimal } from 'src/hooks/utilits.js'

const $t = i18n.global.t;
export default function oss() {
  // 将上传列表先置空
  // store中已经为空了，不知为何上传组件中认为时undefined
  ossStore.uploadQueue = [];
  //sts令牌
  // getToken方法不要在boot时就执行，影响首屏加载，在具体事件中再判断并将client保存进pinia
  const getToken = async () => {
    let ststoken;
    let ossConfig;
    const jwt = localStorage.getItem("jwt");
    // console.log('jwt');
    if (jwt) {
      if (ossStore.ststoken) {
        ststoken = ossStore.ststoken;
      } else {
        const url = `${process.env.REST_API}oss`;
        const config = {
          headers: { Authorization: `Bearer ${JSON.parse(jwt)}` },
        };
        // 在客户端使用临时访问凭证初始化OSS客户端，用于临时授权访问OSS资源。
        try {
          const token = await axios.get(url, config);
          if (token) {
            ststoken = token.data;
            ossStore.ststoken = token.data;
            ossConfig = {
              // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
              region: process.env.REGION,
              // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
              accessKeyId: ststoken.AccessKeyId,
              accessKeySecret: ststoken.AccessKeySecret,
              // 从STS服务获取的安全令牌（SecurityToken）。
              stsToken: ststoken.SecurityToken,
              // 填写Bucket名称。
              bucket: process.env.BUCKET,
              // 自动刷新token
              refreshSTSToken: true,
              refreshSTSTokenInterval: 120000,
            };
            // 第三方扩展可能需要OSS的配置、导出一份给Pinia
            ossStore.ossConfig = ossConfig;
            ossStore.client = new OSS(ossConfig);
          }
        } catch (error) {
          console.error(`OSS STS error：${error}`);
        }
      }
    }
    return ststoken;
  };

  //上传到oss
  this.uploadFile = async (uploadPath, fileBlob, id) => {
    if (!ossStore.client) {
      await getToken();
    }
    let _id = id;
    if (id) {
      ossStore.process = ossStore.process.filter((i) => i.id !== id);
      ossStore.process.push({
        id: id,
        percent: 0,
      });
    }
    function progressCallback(percentage) {
      if (!_id) return;
      // console.log(`Upload progress: ${percentage}%`);
      ossStore.process.find((i) => i.id === id).percent = manualDecimal(percentage, 2);
    }

    try {
      const result = await ossStore.client.multipartUpload(
        uploadPath,
        fileBlob,
        {
          progress: progressCallback,
        }
      );
      return result;
    } catch (e) {
      console.log(e);
      Notify.create({
        message: $t('upload_error'),
        position: "top",
        color: "negative",
      });
    }
  };

  // 获取oss文件访问权限
  this.catchFile = async (uploadPath) => {
    if (!ossStore.client) {
      await getToken();
    }
    try {
      // 1. 移除域名前缀，获取纯路径
      const cleanPath = uploadPath.replace(/^https?:\/\/[^\/]+\//, '');
      // console.log('cleanPath', cleanPath);
      // 2. 解码URL编码的路径
      const decodedPath = decodeURIComponent(cleanPath);
      // console.log('decodedPath', decodedPath);
      // 3. 生成签名URL
      const signedUrl = await ossStore.client.signatureUrl(decodedPath);
      // console.log('signedUrl', signedUrl);
      // if (signedUrl.startsWith('http:')) {
      //   signedUrl = signedUrl.replace(/^http?:\/\//, '');
      // }
      return signedUrl
      
    } catch (e) {
      console.log('OSS download error:', e);
      Notify.create({
        message: $t('oss_premission_error'),
        position: "top",
        color: "negative",
      });
    }
  };
  this.uploadUrl = async (url) => {
    if (!ossStore.client) {
      await getToken();
    }
    try {
      // 上传文件到 OSS
      return await ossStore.client.put(url);
    } catch (error) {
      console.error("Upload error：" + error);
    }
  };
  this.putBuffer = async (buffer) => {
    if (!ossStore.client) {
      await getToken();
    }
    try {
      const result = await ossStore.client.put(
        "object-name",
        new Buffer.from(buffer)
      );
      // console.log(result);
    } catch (e) {
      console.log(e);
    }
  };
}
