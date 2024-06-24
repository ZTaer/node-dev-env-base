/**
 * 通用型async错误逻辑抓捕
 */
const CatchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

module.exports = CatchAsync;
