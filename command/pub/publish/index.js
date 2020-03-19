/* eslint-disable */
/**
 * @author kinghoo
 * @description 本地发布脚本，需要断开zwww网，使用databees网才行
 * 发布后地址为：https://zwfw-mc.oss-cn-hangzhou.aliyuncs.com/[publishPath]/xxxx
 * publishPath区分预发和本地
 */

const colors = require('colors');
const Publish = require('./publish');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const build = require('./build');
const gitCheck = require('./gitCheck');
const { readDir } = require('./util');
const request = require('./request');
const _ = require('lodash');

module.exports = (
  mode,
  versionPos = '-z',
  useTag = false,
  buildCommand = '',
  commitMessage = ''
) => {
  const pkg = require(path.resolve('./', './package.json'));
  const config = require(path.resolve('./', './publish.config.js'));

  if (!mode || (mode !== '-p' && mode !== '-n')) {
    console.log(
      colors.red(`
    参数错误,请使用正确发布命令
    正确参数应该是：
    1. 预发：npm run publish -- -n -x|-y|-z
    2. 正式：npm run publish -- -p -x|-y|-z
    3. 刷新版本的xyz位
    `)
    );
    process.exit(1);
  }
  console.log(
    colors.blue(
      `正在进入${colors.blue(mode === '-n' ? '预发布' : '正式版本')} 发布环节`
    )
  );
  gitCheck();
  build(mode, buildCommand);

  if (!config.publishPath) {
    console.log(colors.red('未配置oss上的发布路径：config.publishPath'));
    process.exit(1);
  }

  let publishDir = config.publishDir;
  if (!publishDir) {
    publishDir = './dist';
  }
  const files = readDir(publishDir);
  console.log(
    colors.blue(`将对如下文件进行发布：
  ${JSON.stringify(files, null, 2)}
  `)
  );

  // process.exit(0);

  const publishPath = config.publishPath;
  const publish = new Publish();

  let temp = {};
  const fixVersion = (type = 'up') => {
    if (mode === '-n') {
      return;
    }
    let version = pkg.version;
    const versionArr = version.split('.').map(item => Number(item));
    let len = 2;
    if (versionPos === '-y') {
      len = 1;
    } else if (versionPos === '-x') {
      len = 0;
    }
    switch (type) {
      case 'up': {
        /**增加版本号 */
        version = versionArr
          .map((item, index) => {
            if (index === len) {
              return item + 1;
            }
            if (index > len) {
              temp[index] = item;
              return 0;
            }
            return item;
          })
          .join('.');
        break;
      }
      default: {
        /**降低版本号 */
        version = versionArr
          .map((item, index) => {
            if (index === len) {
              return item - 1;
            }
            if (!_.isNil(temp[index])) {
              return temp[index];
            }
            return item;
          })
          .join('.');
        break;
      }
    }
    pkg.version = version;
    fs.writeFileSync(
      path.resolve('./', './package.json'),
      JSON.stringify(pkg, null, 2)
    );
    return version;
  };

  const gitOpt = () => {
    try {
      if (commitMessage) {
        execSync(
          `git add . && git commit -m \"${commitMessage}\" && ( ( git pull && git push && echo \"提交成功\" )|| ( git reset HEAD && echo \"pull错误，已重置\" ) )`
        );
      } else {
        execSync(
          `git add . && git commit -m \"auto commit with shell\" && ( ( git pull && git push && echo \"提交成功\" )|| ( git reset HEAD && echo \"pull错误，已重置\" ) )`
        );
      }
    } catch (e) {
      console.log('无更新或者未提交：npm run commit');
    }
  };
  const pub = async () => {
    let flag = true;
    const version = fixVersion();
    const pubPath =
      mode === '-n' ? `${publishPath}_pre` : `${publishPath}/${version}`;
    for (const i in files) {
      const fileName = files[i];
      const isSuccess = await publish.publish(
        `${publishDir}/${fileName}`,
        `${pubPath}/${fileName}`
      );
      if (isSuccess) {
        console.log(
          colors.bgGreen(`文件：${publishDir}/${fileName} 发布成功！！`)
        );
      } else {
        console.log(colors.red(`文件：${publishDir}/${fileName} 发布失败！！`));
        flag = false;
      }
    }
    if (!flag) {
      fixVersion('decrease');
      // gitOpt();
      console.log(colors.red('error::操作失败,网络原因，请再次尝试！'));
    } else {
      console.log(
        colors.green(`文件发布地址：
  ${files
            .map(item => {
              return `${config.cdnRoot}${pubPath}/${item}`;
            })
            .join('\n')}
      `)
      );
    }
    gitOpt();
    if (mode === '-p' && flag) {
      if (useTag) {
        execSync(`git tag v${version} && git push origin v${version}`);
      }
      await request(version);
    }
    process.exit(0);
  };

  pub();
};
