const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionPos = process.argv[2] || '-z';

const temp = {};

const fixVersion = (type = 'up') => {
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

const tagVersion = fixVersion();

execSync(
  `npm run commit && git tag v${tagVersion} && git push origin v${tagVersion}`
);

execSync(`npm publish`);

console.log('发布成功！');
process.exit(0);
