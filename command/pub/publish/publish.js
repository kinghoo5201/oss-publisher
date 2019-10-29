/* eslint-disable */
const OSS = require('ali-oss');
const colors = require('colors');
const path = require('path');

const config = require(path.resolve('./', './publish.config'));

/**发发布工具，包含publish方法 */
module.exports = class Publish {
  constructor() {
    this.client = new OSS({
      region: config.ossConfig.region,
      accessKeyId: config.ossConfig.accessKeyId,
      accessKeySecret: config.ossConfig.accessKeySecret,
      bucket: config.ossConfig.bucket
    });
    console.log(colors.bgGreen('连接 oss 成功！！'));
  }
  /**
   * @description 发布方法
   * @param localPath {string} 本地要发布的文件路径
   * @param onLinePath {string} 线上发布的地址
   * @returns {Promise<boolean>} 是否发布成功
   */
  async publish(localPath, onLinePath) {
    if (!this.client) {
      console.log(colors.bgRed('client 未实例化成功，请检查！！！'));
      return false;
    }
    let result = false;
    try {
      result = await this.client.put(onLinePath, path.resolve('./', localPath));
    } catch (e) {
      console.log(colors.bgRed('发布失败，请检查网络！！', e));
      result = false;
    }
    return !!result;
  }
};
