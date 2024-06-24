const xlsx = require('xlsx');

/**
 * 读取excel文件
 */
exports.handleUtilReadXlsxFile = (props) => {
  try {
    const { filePath } = props;

    // 1. 使用xlsx模块解析文件
    const workbook = xlsx.readFile(filePath);

    // 2. 检查工作簿是否包含工作表
    if (!workbook.SheetNames.length) {
      return null;
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 3. 检查工作表是否为空
    if (!worksheet) {
      return null;
    }

    // 4. 将工作表数据转换为JSON格式
    let data = xlsx.utils.sheet_to_json(worksheet);

    // 5. 清洗数据
    data = data.map((item) => {
      const result = {};
      // eslint-disable-next-line guard-for-in
      for (const keyName in item) {
        let value = item[keyName];

        if (item[keyName] === '-') {
          value = '';
        }
        if (typeof value === 'string') {
          value = value.trim();
        }

        result[keyName.trim()] = value;
      }
      return result;
    });

    return data;
  } catch {
    console.warn('handleUtilReadXlsxFile error');
    return null;
  }
};
