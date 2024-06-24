const fs = require('fs').promises;
const path = require('path');
const _ = require('lodash');
const { handleUtilConvertToTimestamp } = require('./time-format.util');

/**
 * 对照字段加工数据
 */
exports.handleUtilComparisonData = (props) => {
  try {
    const { dataSource = [], comparisonField = [] } = props;

    // 1. 根据字段对照表, 将有效数据进行加工,  得到实际上传数据
    const data = dataSource.map((item) => {
      const result = {};

      comparisonField.forEach((fieldItem) => {
        const { label, value } = fieldItem;

        result[value] = item[label] || '';
      });

      return result;
    });

    return data;
  } catch {
    console.warn('handleUtilComparisonData error');
    return null;
  }
};

/**
 * 数据格式化加工
 */
exports.handleUtilFormatFileUploadData = (props) => {
  try {
    const { dataSource = [], formatTimeFile = [], addItemData = {} } = props;

    return dataSource.map((item) => {
      const result = { ...item, ...addItemData };

      // 格式化时间戳
      Object.keys(item).forEach((keyName) => {
        if (keyName.includes(formatTimeFile)) {
          result[keyName] = handleUtilConvertToTimestamp(item[keyName]);
        }
      });

      // 将金额负数转为正数
      item.tradeAmount = Math.abs(item.tradeAmount);

      return result;
    });
  } catch {
    console.warn('handleUtilFormatFileUploadData error');
    return props.dataSource || [];
  }
};

exports.handleUtilReadJsonFile = async (fileName) => {
  try {
    // 读取 JSON 文件内容
    const fileDir = path.join(__dirname, `../out/${fileName}`);

    const data = await fs.readFile(fileDir, 'utf8');

    if (!data) {
      return null;
    }

    // 解析 JSON 数据
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (err) {
    console.warn('handleUtilReadJsonFile error', err);
    return null;
  }
};

// 自定义函数，用于递归搜索指定键的第一个值
exports.handleUtilFindFirstValueByKey = (obj, key) => {
  let result;

  // eslint-disable-next-line no-shadow
  function recursiveSearch(obj) {
    if (_.isObject(obj)) {
      for (const [k, value] of Object.entries(obj)) {
        if (k === key) {
          result = value;
          return true; // 结束递归
        }
        if (_.isObject(value) && recursiveSearch(value)) {
          return true; // 结束递归
        }
      }
    }
    return false;
  }

  recursiveSearch(obj);
  return result;
};

// 自定义函数，用于导出 JSON 文件并自动创建目录
exports.handleUtilExportJsonToFile = async (props) => {
  try {
    const { directory, filename, jsonData } = props;
    // 确保目录存在，如果不存在则创建
    await fs.mkdir(directory, { recursive: true });

    // 拼接完整的文件路径
    const filePath = path.join(directory, filename);

    // 将JavaScript对象转换为JSON字符串
    const jsonString = JSON.stringify(jsonData, null, 2);

    // 将JSON字符串写入文件
    await fs.writeFile(filePath, jsonString);

    return true;
  } catch (err) {
    console.warn('handleUtilExportJsonToFile error', err);
    return null;
  }
};
