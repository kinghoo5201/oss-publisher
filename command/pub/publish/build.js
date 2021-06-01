/* eslint-disable */
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
/**本地构建 */
module.exports = function (mode, buildCommand = '') {
  const config = require(path.resolve('./', './publish.config'));
  const pkg = require(path.resolve('./', './package.json'));
  console.log(colors.blue('info::开始构建，请稍后...'));
  let status;
  try {
    status = execSync(`npm run build ${buildCommand}`);
  } catch (e) {
    console.log(colors.red('未配置build命令，跳过构建！'));
    return;
  }
  const statusUtf8 = status.toString();
  if (config.ignoreVersion) {
    return;
  }
  if (
    statusUtf8.match(/compile done/) &&
    !statusUtf8.match(/compile done/).length
  ) {
    console.log(colors.red('error::构建失败，请检查！'));
    process.exit(1);
  }
  fs.writeFileSync(
    path.resolve('./', config.publishDir, 'readme.md'),
    `
  ## ${pkg.name}

  > ${pkg.description}
  `
  );
  if (mode === '-n') {
    fs.writeFileSync(
      path.resolve('./', config.publishDir, 'pre_version.js'),
      `
+function(){
  window.cdn_time_version=${Date.now()};
}();
      `
    );
  }
  console.log(colors.bgGreen('success::构建成功！'));
};
