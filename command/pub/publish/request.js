/* eslint-disable */
const superagent = require('superagent');
const path = require('path');
const _ = require('lodash');
const colors = require('colors');

module.exports = async function setVersion(version) {
  const config = require(path.resolve('./', './publish.config'));
  if (_.isEmpty(config.afterPublish)) {
    return console.log(colors.bgYellow('afterPublish未配置，跳过！'));
  }
  if (_.isFunction(config.afterPublish)) {
    await config.afterPublish();
    return;
  }
  // return console.log('跳过版本号刷新！！！');
  let result;
  if (!config.afterPublish.versionApi) {
    return console.log(colors.bgYellow('当前未配置刷新版本接口'));
  }
  try {
    result = await superagent
      .post(config.afterPublish.versionApi)
      .set('token', config.afterPublish.apiToken)
      .set('Content-Type', 'application/json;charset=UTF-8')
      .send({ version });
  } catch (e) {
    console.log(colors.red('error::请求错误！'));
  }
  const text = JSON.parse(_.get(result, 'text', '{}'));
  if (text.code === 200 && text.success) {
    console.log(colors.bgGreen('线上版本号刷新成功！'));
  } else {
    console.log(colors.red('线上版本号刷新失败!'));
  }
};
