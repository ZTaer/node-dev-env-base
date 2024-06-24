const express = require('express');
const helmet = require('helmet');
const winston = require('winston');
const dotenv = require('dotenv');
const projectRouter = require('./route/project.route');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 配置安全中间件
app.use(helmet());
app.use(express.json());

// 配置日志记录
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

/**
 * 数据集API路由
 */
app.use('/api/v1/project', projectRouter);

// 全局错误处理中间件
app.use((err, req, res, next) => {
  logger.error('服务器错误:', err);
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message,
  });
});

// 启动服务器
app.listen(port, () => {
  logger.info(`服务器运行在 http://localhost:${port}`);
});
