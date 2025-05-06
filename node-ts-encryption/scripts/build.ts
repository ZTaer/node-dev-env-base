import childProcess from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import logger from 'jet-logger';
import JavaScriptObfuscator from 'javascript-obfuscator';

/**
 * Start build process
 */
(async () => {
  try {
    // 清理旧目录
    await remove('./dist/');
    await remove('./dist-obf/');
    await remove('./dist-lite/');

    // 运行 ESLint 和 TypeScript 构建
    await exec('npm run lint', './');
    await exec('tsc --build tsconfig.prod.json', './');

    // 拷贝静态资源到 dist
    await copy('./src/public', './dist/public');
    await copy('./src/views', './dist/views');
    await copy('./src/repos/database.json', './dist/repos/database.json');
    await copy('./temp/config.js', './config.js');
    await copy('./temp/src', './dist');
    await remove('./temp/');

    // 混淆输出两个版本
    await obfuscateDist('./dist', './dist-obf', true); // 高混淆
    await obfuscateDist('./dist', './dist-lite', false); // 轻量混淆

    logger.info('Build and all obfuscation complete.');
  } catch (err) {
    logger.err(err);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
})();

/**
 * 删除文件或目录
 */
function remove(loc: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.remove(loc, (err) => (!!err ? rej(err) : res()));
  });
}

/**
 * 拷贝文件或目录
 */
function copy(src: string, dest: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.copy(src, dest, (err) => (!!err ? rej(err) : res()));
  });
}

/**
 * 执行命令行命令
 */
function exec(cmd: string, loc: string): Promise<void> {
  return new Promise((res, rej) => {
    childProcess.exec(cmd, { cwd: loc }, (err, stdout, stderr) => {
      if (stdout) logger.info(stdout);
      if (stderr) logger.warn(stderr);
      return !!err ? rej(err) : res();
    });
  });
}

/**
 * 混淆 dist 目录的所有 .js 文件并输出到目标目录
 * @param sourceDir 原始目录
 * @param targetDir 输出目录
 * @param strong 是否为高混淆
 */
async function obfuscateDist(
  sourceDir: string,
  targetDir: string,
  strong: boolean,
): Promise<void> {
  await fs.ensureDir(targetDir);
  const entries = await fs.readdir(sourceDir);

  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry);
    const tgtPath = path.join(targetDir, entry);
    const stat = await fs.stat(srcPath);

    if (stat.isDirectory()) {
      await obfuscateDist(srcPath, tgtPath, strong);
    } else if (entry.endsWith('.js')) {
      const code = await fs.readFile(srcPath, 'utf8');
      const obfuscated = JavaScriptObfuscator.obfuscate(
        code,
        strong
          ? {
              compact: true,
              controlFlowFlattening: true,
              deadCodeInjection: true,
              selfDefending: true,
            }
          : {
              compact: true,
              identifierNamesGenerator: 'hexadecimal',
              renameGlobals: false,
              controlFlowFlattening: false,
              deadCodeInjection: false,
              selfDefending: false,
            },
      ).getObfuscatedCode();
      await fs.outputFile(tgtPath, obfuscated);
    } else {
      await fs.copy(srcPath, tgtPath);
    }
  }

  logger.info(
    `${strong ? 'High' : 'Lite'} obfuscation written to ${targetDir}`,
  );
}
