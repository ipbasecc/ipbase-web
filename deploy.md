环境配置：

PostgreSQL 安装

```https://www.postgresql.org/download/```

Nodejs安装

```https://nodejs.org/zh-cn/download/package-manager```

Redis安装



```sudo dnf -y install redis```

### 配置数据库

Strapi
```
CREATE DATABASE ipbase_strapi_demo WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE=template0;

CREATE USER ipbase_strapi_demo WITH PASSWORD 'Hregrg5668GjGHFR';

GRANT ALL PRIVILEGES ON DATABASE ipbase_strapi_demo to ipbase_strapi_demo;

ALTER DATABASE ipbase_strapi_demo OWNER TO ipbase_strapi_demo;

GRANT USAGE, CREATE ON SCHEMA PUBLIC TO ipbase_strapi_demo;
```

Mattermost

```CREATE DATABASE ipbase_mm_demo WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE=template0;

CREATE USER ipbase_mm_demo WITH PASSWORD 'QstFhjyHRFer4VfBF';

GRANT ALL PRIVILEGES ON DATABASE ipbase_mm_demo to ipbase_mm_demo;

ALTER DATABASE ipbase_mm_demo OWNER TO ipbase_mm_demo;

GRANT USAGE, CREATE ON SCHEMA PUBLIC TO ipbase_mm_demo;
```

#### Strapi安装与配置

安装

# 准备一个文件夹部署源码
```
cd ~
mkdir www
cd www
```

# 拉取后端源码
```
git clone https://gitee.com/auxcc/ipbase-backend.git
# 进入后端目录
cd ipbase-backend
# 复制.env文件
cp .env.example .env
# 使用VSCode打开目录（可以使用自己的编辑器）
# 编辑.env文件，按照说明文件填充对应字段
code .
```


环境配置
```
# 首先完成Strapi运行时的基础配置
# 你需要补充的字段组包括
1. 数据库配置
2. OSS配置
3. STS配置
4. 基础安全配置
```

初始化
```
# 安装第三方依赖包
yarn  # 或者 npm install， 请勿使用pnpm，可能遗漏依赖
# 运行
yarn develop

#成功后会提示后端访问地址，复制地址到浏览器中访问，根据向导创建管理员账号

可以访问Strapi后台后，
```




进入 settings -> users-permissions -> roles配置用户权限，根据页面 ``https://github.com/ipbasecc/ipbase-backend/wiki/%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9%EF%BC%9A`` 中的截图来逐个设置权限;



准备7张图片，来作为初始化资源，分别对应的是：
1. 用户头像；
2. 用户海报形象图；
3. 用户品牌形象图；
4. 用户频道头像；
5. 用户频道海报形象图；
6. 用户频道品牌形象图；
7. 用户频道品牌形象图；

项目预览默认图；

进入Media Library，新建一个文件夹，例如INIT，进入，上传7张图片；

再次编辑.env文件，填写对应的图片ID到.env对应字段值中；
如果需要开启邮件功能，填写.env文件中对应的字段；

进入源码 config 目录，根据视频，逐个按需要修改内部配置；

至此，Strapi部分第一轮配置完成，稍后仍需进一步配置；

Mattermost

数据库
```
CREATE DATABASE ipbase_mm_demo WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE=template0;

CREATE USER ipbase_mm_demo WITH PASSWORD 'QstFhjyHRFer4VfBF';

GRANT ALL PRIVILEGES ON DATABASE ipbase_mm_demo to ipbase_mm_demo;

ALTER DATABASE ipbase_mm_demo OWNER TO ipbase_mm_demo;

GRANT USAGE, CREATE ON SCHEMA PUBLIC TO ipbase_mm_demo;
```
应用部署
```
# 下载执行文件
wget https://releases.mattermost.com/9.10.1/mattermost-9.10.1-linux-amd64.tar.gz

# 解压并存放到目录，例如 ~/www/mattermost

# 配置数据库连接参数，打开config/config.json文件，找到 SqlSettings -> DataSource,修改用户、密码、数据库名后保存
```

# 终端执行二进制文件
```
~/www/mattermost/bin/mattermost
# 查看是否有错误，如无错误，进入Mattermost页面
http://localhost:8065
```

Mattermost配置

# 跨域白名单，进入 system_console -> 侧导航顶部搜索 CORS
```
1. 填写跨域白名单地址，多个使用空格分开，这里先填写http://localhost:9000，这是本地前端地址；
2. 填写公开头：Token，前端需要以此作为鉴权凭据
3. 勾选允许证书

4. 进入 ENVIRONMENT -> Web Server -> Site URL:填写http://localhost:8065，先保存，再点击 Test Live URL，无错后进入下一步；
5. 进入 INTEGRATIONS -> Integration Management -> Enable Personal Access Tokens:否选 true，保存；

6.点击左上角 Back to ...，返回用户界面，点击右上角用户头像 -> profile -> Security -> Personal Access Tokens;点击创建一个证书，妥善保存生成内容后关闭
```

Strapi关联配置Mattermost

# 编辑Strapi .env文件
```
MM_API=http://localhost:8065/api/v4/
MM_MASTER_TOKEN=此处填写上一步保存的Personal Access Token的Token值
```
至此，后端配置完成


### 前端配置
```
# 拉取源码
git clone https://gitee.com/auxcc/ipbase-web.git
# 进入源码目录
cd ipbase-web
# 安装依赖
pnpm install

# 复制并配置.env文件
cp .env.example .env

# VSCode打开文件夹，并编辑.env文件
# 根据提示，填写OSS、MM、后端对应地址、EJ2密钥（自行根据提示前往申请）
# 懂的朋友，自行配置路由模式
```

至此，前后端运行环境配置完成，最后一步，关联前后端，原因：前端可以独立连接不同后端，因此后端需要反馈给前端完成的后端端点配置

# 进入Strapi后台，Content Manager -> SINGLE TYPES -> server,填写对应内容
# 此处内容运行时可以自定修改成运营环境地址
```
version: 0.0.1
http_api_endpoint: http://localhost:1337/api/
ws_api_endpoint: http://localhost:8065/api/v4/
graphql_endpoint: http://localhost:1337/graphql
ws_endpoint: ws://localhost:8065/api/v4/websocket
```

******  配置结束  ******

运行测试
```
# 进入前端目录
cd ~/www/ipbase-web/
quasar dev
# 如无问题，将自动打开前端页面，请注册用户开始测试

# 其它命令
quasar build  #编译SPA
quasar build -m pwa  # 编译PWA应用
quasar build -m electron  #编译桌面端
```
