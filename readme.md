## dbees-pub 基于 ali-oss 的静态文件发布工具

## 安装

```shell
npm i dbees-pub
```

## 配置

package.json 添加如下命令

```json
{
  "commit": "[输入git提交的相关命令，可以不输入]",
  "publish": "dbees-pub pub",
  "build": "[打包命令]"
}
```

运行：`npx dbees-pub init`创建`publish.config.js`并进入配置

## 发布

运行：`npm run publish`即可分预发线上方式发布
