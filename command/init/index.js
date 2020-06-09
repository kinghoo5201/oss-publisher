const co = require('co');
const colors = require('colors');
const fs = require('fs');
const path = require('path');

const configTpl = `
module.exports = {
  // oss登录配置
  ossConfig: {
    // oss域名
    // endpoint: '',
    // oss区域
    // region: '',
    // accessKeyId: '',
    // accessKeySecret: '',
    // 目录节点
    // bucket: '',
    // 其他配置参考官网传入，使用对象解构传入
  },
  /** 发布到oss的目录，注意，发布前一定要检查是否有同名目录，否则会覆盖 */
  publishPath: '',
  /** 发布使用的本地目录 */
  publishDir: '',
  /** alioss地址 */
  cdnRoot: '',
  /** 选择发布分支 */
  pubBranch: 'develop',
  // build之前的操作，可以用于一些特殊操作
  preBuild:async (mode, pkgVersion)=>{

  },
  // 发布之后操作，如果是函数则直接运行函数（async函数）
  afterPublish: {
    /** version api:后端接收版本信息的接口 */
    // versionApi: '',
    /** api提交需要用到的token */
    // apiToken: ''
  }
};

`;

module.exports = () => {
  co(function* () {
    if (fs.existsSync('./publish.config.js')) {
      console.log(colors.bgBlue('publish.config.js文件已存在！'));
      process.exit(0);
    }
    try {
      fs.writeFileSync('./publish.config.js', configTpl);
      console.log(colors.bgGreen('[./publish.config.js]写入成功！'));
    } catch (e) {
      console.log(colors.bgRed('写入[./publish.config.js]失败，请检查！'));
    }
    process.exit(0);
  });
};
