const CatchAsync = require('../utils/catch-async.util');
const AppError = require('../utils/app-error.util');

/**
 * 查看分析项目
 */
exports.handleApiWechatDataSetAll = CatchAsync(async (req, res, next) => {
  const data = {};

  res.status(200).json({
    code: 200,
    data,
  });
});
