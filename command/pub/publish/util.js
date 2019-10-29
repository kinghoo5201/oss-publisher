/* eslint-disable */
const fs = require('fs');
const path = require('path');
const colors = require('colors');
// console.log('path', path.sep);
function readFileList(dir, filesList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((item, index) => {
    var fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList); //递归读取文件
    } else {
      filesList.push(
        fullPath
          .replace(new RegExp(`\\${path.sep}`, 'g'), '/')
          .split('/')
          .slice(1)
          .join('/')
      );
    }
  });
  return filesList;
}

// 读取目录
module.exports = {
  readDir(dirPath) {
    const filesList = [];
    try {
      readFileList(dirPath, filesList);
    } catch (e) {
      console.log(colors.red('读取目录出错::', e));
      process.exit(1);
    }
    return filesList;
  }
};
