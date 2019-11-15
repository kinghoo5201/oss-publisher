const co = require('co');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const prompt = require('co-prompt');
const _ = require('lodash');
const publish = require('./publish');

module.exports = () => {
  co(function*() {
    if (!fs.existsSync('./publish.config.js')) {
      console.log(
        colors.bgRed(
          '请运行:dbees-pub init 命令新建publish.config.js来创建文件并配置！'
        )
      );
      process.exit(1);
    }
    const config = require(path.resolve('./', './publish.config.js'));
    if (
      _.isEmpty(config.ossConfig) ||
      !config.publishPath ||
      !config.publishDir ||
      !config.cdnRoot ||
      !config.pubBranch
    ) {
      console.log(colors.bgRed('请配置好publish.config.js后再运行！'));
      process.exit(1);
    }
    let mode = yield prompt('请输入发布环境[预发(默认)：-n]|[正式：-p]: ');
    const buildCommand = yield prompt('npm run build 命令参数，没有可以跳过: ');
    const commitMessage=yield prompt('请输入commit提交 message:');
    mode = mode || '-n';
    let versionPos;
    let useTag = false;
    if (mode === '-p') {
      versionPos = yield prompt(
        '请输入更新版本号的类型[版本号:x.y.z分别对应位置][请输入-x|-y|-z默认-z]: '
      );
      versionPos = versionPos || '-z';
      useTag = yield prompt(`是否使用Tag[y|n]:`);
      useTag = useTag.toLowerCase() === 'y' ? true : false;
    }
    publish(mode, versionPos, useTag, buildCommand, commitMessage);
  });
};
