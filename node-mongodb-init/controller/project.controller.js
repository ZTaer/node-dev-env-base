const CatchAsync = require('../utils/catch-async.util');
const NoLimit = require('../model/no-limit.model');
const AppError = require('../utils/app-error.util');

/**
 * 查看分析项目
 */
exports.handleApiWechatDataSetAll = CatchAsync(async (req, res, next) => {
  const data = await NoLimit.find({}).limit(10);

  res.status(200).json({
    code: 200,
    data,
  });
});
