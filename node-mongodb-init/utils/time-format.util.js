const moment = require('moment-timezone');
require('moment/locale/zh-cn'); // 引入中文语言包
const CatchAsync = require('./catch-async.util');

// 是否为时间戳
function handleUtilIsTimestamp(str) {
  try {
    if (!/^\d+$/.test(str)) return false; // 检查是否为纯数字

    const num = Number(str);
    const isSecondTimestamp = str.length === 10 && num > 0;
    const isMillisecondTimestamp = str.length === 13 && num > 0;

    // 转换为毫秒级时间戳并检查有效性
    if (isSecondTimestamp) {
      return num * 1000;
    }
    if (isMillisecondTimestamp) {
      return num;
    }

    return false;
  } catch {
    console.warn('handleUtilIsTimestamp error');
    return false;
  }
}

// 将时间转换为时间戳
function handleUtilConvertToTimestamp(
  dateStr,
  timeFormat = [],
  autoTimeStamp = false
) {
  try {
    // 1. 验证是否为时间戳，如果是则直接返回，否则进行后续加工
    if (autoTimeStamp) {
      const isTmieStamp = handleUtilIsTimestamp(dateStr);
      if (isTmieStamp) {
        return isTmieStamp;
      }
    }

    // 2. 不是时间戳进行后续加工
    let formatTime = [
      'YYYY-MM-DD HH:mm:ss',
      'DD/MM/YYYY HH:mm:ss',
      'YYYYMMDDHHmmss',
      moment.ISO_8601,
      moment.RFC_2822,
    ];

    // 3. 扩展格式
    if (timeFormat instanceof Array && timeFormat.length > 0) {
      formatTime = [...timeFormat, ...formatTime];
    }

    const date = moment(dateStr.trim(), formatTime);
    if (date.isValid()) {
      return date.valueOf(); // 返回时间戳
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 转换为北京时间戳: 方法 ( 等待笔记 )
 */
function handleUtilToTimeStamp(mongoTime) {
  try {
    const beijing = moment.utc(mongoTime.getTime()).tz('Asia/Shanghai');
    return beijing.valueOf();
  } catch {
    console.warn('handleUtilToTimeStamp error');
    return mongoTime.getTime();
  }
}

/**
 * 转换为北京时间戳: 面向多个数据
 */
const handleUtilMidDocsTimeStamp = CatchAsync(async (docs, next, props) => {
  const { timeKeyName = [] } = props;

  if (docs instanceof Array && timeKeyName instanceof Array) {
    docs.forEach((doc, index, arr) => {
      const plainObject = doc.toObject();

      timeKeyName.forEach((keyName) => {
        if (plainObject[keyName])
          plainObject[keyName] = handleUtilToTimeStamp(plainObject[keyName]);
      });

      arr[index] = plainObject;
    });
  }

  next();
});

/**
 * 转换为北京时间戳: 面向单个数据
 */
const handleUtilMidDocTimeStamp = CatchAsync(async (doc, next, props) => {
  const { timeKeyName = [] } = props;

  const plainObject = doc.toObject();

  timeKeyName.forEach((keyName) => {
    if (plainObject[keyName])
      plainObject[keyName] = handleUtilToTimeStamp(plainObject[keyName]);
  });

  next();
});

module.exports = {
  handleUtilConvertToTimestamp,
  handleUtilIsTimestamp,
  handleUtilMidDocsTimeStamp,
  handleUtilMidDocTimeStamp,
  handleUtilToTimeStamp,
};
