const AppError = require('../utils/app-error.util');

/**
 * 开发环境: 报错信息逻辑
 */
const handleDevSendMessage = (error, res) => {
  res.status(200).json({
    code: error.statusCode,
    error,
    message: error.message,
    stack: error.stack, // 堆栈报错信息
  });
};

/**
 * 生产环境: 报错信息逻辑
 *    a) 注意: 因为考虑到安全性,系统不应透露错误细节信息给用户
 *    b) 注意: error.isOperational属性，在AppError逻辑中的铺垫属性
 */
const handleProdSendMessage = (error, res) => {
  // 1. 操作性错误发给用户
  if (error.isOperational) {
    res.status(200).json({
      code: error.statusCode,
      message: error.message,
    });

    // 2. 意外未知错误不发送错误细节给用户 ( 严重错误 )
  } else {
    console.warn('ERROR_PROD', error); // 真实的生产环境，可以放日志逻辑，或邮件通知相关负责人逻辑

    res.status(200).json({
      code: 500,
      message: 'Something went wrong!',
    });
  }
};

/**
 * MongoDB相关错误处理逻辑
 */
// CastError
const handleDBCastError = (error) => {
  const message = `Invalid ${error.path} ${error.value}`;
  return new AppError(message, 400);
};
// MongoError
const handleDBMongoError = (error) => {
  const errorValue = error.errmsg.match(/(["'])(\\?.)*?\1/)[0]; // 正则提取错误信息中的关键词
  const message = `Duplicate field value: ${errorValue}`;
  return new AppError(message, 400);
};
// ValidationError
const handleDBValidationError = (error) => {
  // 加工信息方便展示
  const errorValue = Object.values(error.errors)
    .map((item) => item.message)
    .join('. ');
  const message = `Duplicate input data: ${errorValue}`;
  return new AppError(message, 400);
};

/**
 * JWT错误处理相关
 */
// 令牌错误
const handleJWTError = (error) => {
  const message = 'Token error, please log in again!';
  return new AppError(message, 401);
};
// 令牌过期
const handleJWTExpiredError = (error) => {
  const message = 'Token expired, please log in again!';
  return new AppError(message, 401);
};

/**
 * 全局错误处理逻辑 ( 完成笔记 )
 *    a) 注意: 状态码始终为200，通过code返回真实状态码，是因个人习惯配置，这样更方便应用于实战中
 */
exports.handleGlobalError = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    handleDevSendMessage(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let errorResult = error;

    // CastError: 通过name==='CastError'判断
    if (errorResult.name === 'CastError')
      errorResult = handleDBCastError(errorResult);
    // MongoError: 通过code===11000判断
    if (errorResult.code === 11000) {
      errorResult = handleDBMongoError(errorResult);
    }
    // ValidationError: 通过name==='ValidationError'判断
    if (errorResult.name === 'ValidationError') {
      errorResult = handleDBValidationError(errorResult);
    }
    // JsonWebTokenError
    if (errorResult.name === 'JsonWebTokenError')
      errorResult = handleJWTError(errorResult);
    // TokenExpiredError
    if (errorResult.name === 'TokenExpiredError')
      errorResult = handleJWTExpiredError(errorResult);

    handleProdSendMessage(errorResult, res);
  }
};
