const CatchAsync = require('../utils/catch-async.util');
const dbQuery = require('../utils/db-query.util');
const AppError = require('../utils/app-error.util');

/**
 * 查看分析项目
 */
exports.handleApiAll = CatchAsync(async (req, res, next) => {
  const data = {};

  const rows = await dbQuery('SELECT * FROM yy_user LIMIT 100');

  res.status(200).json({
    code: 200,
    data: rows,
  });
});
