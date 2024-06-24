#!/usr/bin/env node
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

/**
 * 配置环境变量文件
 */
dotenv.config({
  path: path.join(__dirname, 'config.env'),
});

/**
 * 兜底逻辑: 抓取未捕获的异常 ( 完成笔记 )
 */
process.on('uncaughtException', (error) => {
  console.warn('ERROR_UNCAUGHT_EXCEPTION', error);
  process.exit(1);
});

const app = require('./app');

/**
 * 连接MongoDB数据库
 */
// 本地数据库, 注意开启mongod
let DB = process.env.DATABASE_LOCAL;
if (process.env.NODE_ENV === 'production') {
  // 线上数据库
  DB = process.env.DATABASE_SERVER.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
  ).replace('<user>', process.env.DATABASE_USER);
}

mongoose
  .connect(DB, {
    // 这些选项是为了消除一些警告, 因版本问题部分选项会报错
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: true,
  })
  .then(() => {
    console.warn('connect db success');
  })
  .catch((err) => {
    console.warn('connect db fail', err);
  });

/**
 * 初始化server
 */
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.warn('start:', port);
  console.warn('connect db loading...');
});

/**
 * 兜底逻辑: 处理被拒绝的promise错误
 *    a) 生产环境可以添加，日志数据库，发送紧急邮件告知相关负责人
 */
process.on('unhandledRejection', (error) => {
  console.warn('ERROR_UNHANDLED_REJECTION', error);

  // 关闭服务
  console.warn('ERROR_UNHANDLED_REJECTION: SUTDOWN...');
  server.close(() => {
    process.exit(1);
  });
});
