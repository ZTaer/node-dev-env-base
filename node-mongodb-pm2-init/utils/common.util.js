const mongoose = require('mongoose');

/**
 * 用于模糊搜索, 防止正则表达式攻击
 */
exports.handleUtilEscapeRegex = (text) =>
  text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

/**
 * 用于配合insertMany检测那些数据成功上传
 */
exports.handleUtilCheckUploadFailData = (props) => {
  try {
    const { notUpload = [], successUpload = [], keyName = 'id' } = props;
    const ids = successUpload.map((item) => item[keyName]);

    return notUpload.filter((item) => {
      let result = true;
      if (ids.includes(item[keyName])) {
        result = false;
      }
      return result;
    });
  } catch {
    return [];
  }
};

/**
 * 将字符串转换为ObjectId, 方便聚合查询
 */
exports.handleUtilStringToObjectId = (str) => {
  try {
    const { ObjectId } = mongoose.Types;
    return new ObjectId(str);
  } catch {
    return str;
  }
};

/**
 * 为高级筛选清除无用入参
 */
exports.handleUtilCpuClearProps = (props) => {
  try {
    Object.keys(props).forEach((keyName) => {
      if (typeof props[keyName] === 'string') {
        if (
          !props[keyName] ||
          props[keyName] === 'undefined' ||
          props[keyName] === 'null'
        ) {
          delete props[keyName];
        }
      }
    });

    return props;
  } catch {
    console.warn('handleUtilCpuClearProps error');
    return {};
  }
};

/**
 * 用于转换数字
 */
exports.handleUtilNumber = (str) => {
  try {
    return parseFloat(str.replace(/[^\d.]/g, '')) || 0;
  } catch {
    console.warn('handleUtilNumber error');
    return 0;
  }
};

/**
 * 验证字符串是否符合银行卡格式
 */
exports.handleUtilCheckBankCard = (str) => {
  try {
    return /^[1-9]\d{12,18}$/.test(str);
  } catch {
    console.warn('handleUtilCheckBankCard error');
    return false;
  }
};
