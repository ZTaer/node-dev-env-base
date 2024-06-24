const AppError = require('./app-error.util');

/**
 * 更新单条数据方法
 */
exports.handleUtilUpdate = async (props) => {
  try {
    const { findProps = {}, updateProps = {}, Model } = props;
    updateProps.updateTime = Date.now();

    const data = await Model.findOneAndUpdate(findProps, updateProps, {
      new: true, // 返回更新后的文档
      runValidators: true, // 运行 Schema 校验
    });

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.warn('handleUtilUpdate error', error);
    return null;
  }
};
