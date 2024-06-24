const express = require('express');
const morgan = require('morgan');
const expressRateLimit = require('express-rate-limit');
const helmet = require('helmet');
const expressMongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const moment = require('moment-timezone');
const cors = require('cors');
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
const projectRouter = require('./router/project.router');
const AppError = require('./utils/app-error.util');
const { handleGlobalError } = require('./controller/error.controller');

require('moment/locale/zh-cn'); // 引入中文语言包

/**
 * 配置时区
 */

// 设置时区为中国北京时间（UTC+8）
moment.tz.setDefault('Asia/Shanghai');

// 设置 moment 的默认语言为中文
moment.locale('zh-cn');

/**
 * 初始化express
 */

const app = express();

/**
 * 收集错误初始化: sentry.io
 */
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://6be724b99825315a9ed2aaabda34021e@o980404.ingest.us.sentry.io/4507106510110720',
    integrations: [
      // 启用 HTTP 调用跟踪
      new Sentry.Integrations.Http({ tracing: true }),
      // 启用 Express.js 中间件跟踪
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    // 性能监控
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // 设置分析的采样率 - 这是相对于 tracesSampleRate 的
    profilesSampleRate: 1.0,
  });
}

/**
 * 第三方中间件
 */
// 安全问题: 1. 配置API安全头
app.use(helmet());

// 安全问题: 2. 限制API速率
//     a) yarn add express-rate-limit
//     b) 当前限制: 限制含"/api"路由API接口,每个IP,10分钟最大访问为10000次
const limiter = expressRateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: {
    code: 429,
    message: 'Visiting too frequently, please try again in 10 minutes.',
  },
});
app.use('/api', limiter);

app.use(express.json({ limit: '1mb' }));

// 安全问题: 4. 针对 NoSQL 查询注入的数据清理
app.use(expressMongoSanitize());

// 安全问题: 5. 针对 XSS 的数据清理
app.use(xssClean());

// 安全问题: 6. 防止参数污染
app.use(
  hpp({
    // 白名单: 避免检测的字段
    whitelist: ['duration'],
  })
);

// 收集错误: 7. 请求处理器必须是应用程序上的第一个中间件
if (process.env.NODE_ENV === 'production') {
  app.use(Sentry.Handlers.requestHandler());

  // 收集错误: 8. TracingHandler 为每个传入请求创建一个跟踪
  app.use(Sentry.Handlers.tracingHandler());
}

if (process.env.NODE_ENV === 'development') {
  // 当环境变量为开发环境时, 将在控制台打印请求日志
  app.use(morgan('dev'));
  // 使用默认配置允许所有跨域请求
  app.use(cors());
} else if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}

/**
 * 数据集API路由
 */
app.use('/api/v1/project', projectRouter);

/**
 * 404路由兜底逻辑
 */
app.all('*', (req, res, next) => {
  next(new AppError(`Not found ${req.originalUrl} !`, 404));
});

/**
 * 收集错误: sentry.io
 */

if (process.env.NODE_ENV === 'production') {
  app.use(Sentry.Handlers.errorHandler());
}

/**
 * 全局错误处理中间件
 */
app.use(handleGlobalError);

module.exports = app;
