/**
 * 错误促发逻辑 ( 完成笔记 )
 *    a) Error.captureStackTrace(this, this.constructor) 方便抓取错误堆栈信息
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode || 500;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
