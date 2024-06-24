const { handleUtilEscapeRegex, handleUtilNumber } = require('./common.util');

/**
 * 通用型高级筛选
 */
exports.handleUtilAdvanceFilter = (props) => {
  try {
    const {
      findSource = [],
      sortSource = [],
      findPropsDiv = {},
      sortPropsDiv = {},
      method = 'POST', // "POST" | "GET"
    } = props;
    let findProps = {};
    let sortProps = {};

    if (!(findSource instanceof Array) || !(sortSource instanceof Array)) {
      return null;
    }

    findSource.forEach((item) => {
      // 清理无用入参
      if (
        !item.name ||
        typeof item.value === 'undefined' ||
        item.value === 'undefined' ||
        item.value === 'null' ||
        item.value === null ||
        item.value === '' ||
        !item.type
      ) {
        return;
      }

      // 兼容GET类型入参
      if (
        (item.type === 'rangeQuery' || item.type === 'multipleQuery') &&
        method === 'GET'
      ) {
        item.value =
          item.valueType === 'number'
            ? item.value.split(',').map((cur) => handleUtilNumber(cur))
            : item.value.split(',');
      }

      // 校验数据库查询入参格式
      if (item.type === 'rangeQuery' && item.value.length !== 2) {
        return;
      }
      if (item.type === 'multipleQuery' && item.value.length === 0) {
        return;
      }

      // 2. 根据类型处理
      switch (item.type) {
        case 'exactQuery':
          findProps[item.name] = item.value;
          break;
        case 'fuzzyQuery':
          findProps[item.name] = new RegExp(
            handleUtilEscapeRegex(item.value),
            'i'
          );
          break;
        case 'rangeQuery':
          findProps[item.name] = { $gte: item.value[0], $lte: item.value[1] };
          break;
        case 'multipleQuery':
          findProps[item.name] = { $in: item.value };
          break;
        default:
          break;
      }
    });

    // 3. 排序参数处理
    sortSource.forEach((item) => {
      const { name, value } = item;

      if (!name || typeof value === 'undefined' || value === null) {
        return;
      }

      sortProps[name] = value;
    });

    // 4. 追加条件
    findProps = { ...findProps, ...findPropsDiv };
    sortProps = { ...sortProps, ...sortPropsDiv };

    return {
      findProps,
      sortProps,
    };
  } catch (error) {
    console.warn('handleUtilAdvanceFilter error', error);
    return null;
  }
};
