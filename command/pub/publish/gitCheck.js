/* eslint-disable */
const colors = require('colors');
const path = require('path');
const { execSync } = require('child_process');

module.exports = function() {
  const config = require(path.resolve('./', './publish.config'));
  console.log(colors.blue('info::正在检查git分支状态，请稍后...'));
  let status;
  try {
    status = execSync(`git status`);
  } catch (e) {
    return console.log('没有初始化git，跳过！');
  }
  const statusUtf8 = status.toString();

  branch = statusUtf8
    .match(/On branch (.+?)\n/)[0]
    .replace(/On branch/, '')
    .trim();
  if (branch !== config.pubBranch) {
    console.log(
      colors.red(
        `error::当前分支为：${branch} ;请将分支切换到  ${config.pubBranch}  并且保证代码和线上同步！`
      )
    );
    process.exit(1);
  }
  return console.log('请确保分支内容和线上同步！！');
  if (
    statusUtf8.match(/nothing to commit, working tree clean/) &&
    !statusUtf8.match(/nothing to commit, working tree clean/).length
  ) {
    console.log(colors.red(`error::您有代码未提交，请将代码提交后再发布！`));
    process.exit(1);
  }
  execSync('git pull');
  console.log(colors.bgGreen('success::git分支检查完毕！'));
};
