const moment = require('moment');
const _ = require('lodash');
const { format } = require('fast-csv');
const JSONStream = require('JSONStream');
require('moment-timezone'); // 引入时区扩展
const AppError = require('../utils/app-error.util');
const ViewPage = require('../utils/view-page.util');
const CatchAsync = require('../utils/catch-async.util');
const { handleUtilOmitDeep } = require('../utils/common.util');
/**
 * 函数: 根据多个id批量删除
 */
exports.handleFactoryUtilDeleteMany = async (Model, props) => {
  try {
    const { ids = [] } = props;
    const data = await Model.deleteMany({ _id: { $in: ids } });
    return data;
  } catch {
    return [];
  }
};

/**
 * 批量根据ids删除
 */
exports.handleFactoryApiBatchDelete = (Model, props) =>
  CatchAsync(async (req, res, next) => {
    const { ids, dataSetId } = req.body;
    const { dataType = '' } = props;

    if (!(ids instanceof Array)) {
      return next(new AppError('ids must be an array', 400));
    }

    // 1. 批量删除
    const data = await Model.deleteMany({
      dataSetId,
      _id: { $in: ids },
    });

    if (!data) {
      return next(new AppError('Delete failed!', 400));
    }

    res.status(200).json({
      code: 200,
      data,
      message: 'success',
    });
  });

/**
 * 批量根据ids更新数据
 */
exports.handleFactoryApiForIdsUpdateMany = (Model, props) =>
  CatchAsync(async (req, res, next) => {
    const { ids, dataSetId, updateContent = {} } = req.body;
    const { dataType } = props;

    if (!(ids instanceof Array) || !dataSetId) {
      return next(
        new AppError('ids must be an array, dataSetId is required', 400)
      );
    }

    // 1. 批量更新内容
    const data = await Model.updateMany(
      { dataSetId, _id: { $in: ids } },
      { $set: updateContent },
      { runValidators: true } // 开启校验
    );

    if (!data) {
      return next(new AppError('Update failed!', 400));
    }

    res.status(200).json({
      code: 200,
      data,
      message: 'success',
    });
  });

/**
 * 指定字段去重, 用于Select做动态选项
 */
exports.handleFactoryApiSelect = (Model) =>
  CatchAsync(async (req, res, next) => {
    const { dataSetIdObjectId } = req;
    const { labelIndex = {}, keyName } = req.body;

    if (!keyName) {
      return next(new AppError('keyName is required', 400));
    }

    // 指定字段去重
    const data = await Model.aggregate([
      {
        $match: {
          dataSetId: dataSetIdObjectId,
        },
      },
      {
        $group: {
          _id: `$${keyName}`,
        },
      },
      {
        $project: {
          _id: 0, // 不显示 _id 字段
          value: '$_id',
        },
      },
    ]);

    if (!data) {
      return next(new AppError('Failed to get content', 400));
    }

    // 返回Select组件要求的数据格式
    const result = data.map((item) => ({
      label: labelIndex[item.value] || item.value,
      value: item.value,
    }));

    res.status(200).json({
      code: 200,
      message: 'success',
      data: result,
    });
  });

/**
 * 翻页查看数据
 */
exports.handleFactoryApiViewPage = (Model) =>
  CatchAsync(async (req, res, next) => {
    const { dataSetId, current = 1, pageSize = 10, sort = '' } = req.query;

    if (!dataSetId) {
      return next(new AppError('DataSetId is required', 400));
    }

    // 1. findProps用于高级筛选
    const { findProps = { dataSetId } } = req.body;

    // 2. 初始化通用翻页查询逻辑
    const viewPage = new ViewPage(Model.find(findProps), {
      current,
      pageSize,
      sort,
    })
      .sort()
      .page();

    // 3. 执行查询
    const data = await viewPage.model;

    // 4. 计算查询结果总数 ( 等待笔记 )
    const total = await Model.countDocuments(findProps);

    res.status(200).json({
      code: 200,
      data: {
        dataSource: data,
        pageInfo: {
          total,
          current,
          pageSize,
        },
      },
      message: 'success',
    });
  });

/**
 * 删除查询结果
 */
exports.handleFactoryApiDeleteSearch = (Model, props) =>
  CatchAsync(async (req, res, next) => {
    const { findProps = {}, dataSetId } = req.body;
    const { dataType } = props;

    // 1. 删除
    const data = await Model.deleteMany(findProps);

    if (!data) {
      return next(new AppError('Delete failed!', 400));
    }

    res.status(200).json({
      code: 200,
      data,
      message: 'success',
    });
  });

/**
 * 导出查询结果csv
 */
exports.handleFactoryApiExportSearchCsv = (Model) =>
  CatchAsync(async (req, res, next) => {
    // 1. findProps用于高级筛选
    const { findProps = {}, deleteField = [] } = req.body;

    if (!findProps.dataSetId) {
      return next(new AppError('DataSetId is required', 400));
    }

    // 2. 配置参数头, 让浏览量下载csv
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');

    // 3. 查询数据
    //    a) .cursor()方法: 返回一个可读流, 不让大量数据直接加载到内存中
    const cursor = Model.find(findProps).cursor();
    const csvStream = format({ headers: true });

    // 4. 将 CSV 数据流直接写入响应对象
    csvStream.pipe(res);

    // 5. 加工并写入csv数据流
    cursor.on('data', (doc) => {
      // 5.1 加工csv数据流
      const { _doc } = doc;

      // 5.1.1 删除指定字段
      if (deleteField instanceof Array && deleteField.length > 0) {
        deleteField.forEach((item) => {
          delete _doc[item];
        });
      }

      const formartDoc = {
        ..._doc,
      };

      // 5.2 写入 CSV
      csvStream.write(formartDoc);
    });

    // 6. 结束 CSV 数据流
    cursor.on('end', () => {
      csvStream.end();
    });
  });

/**
 * 导出查询结果json
 */
exports.handleFactoryApiExportSearchJson = (Model) =>
  CatchAsync(async (req, res, next) => {
    // 1. findProps用于高级筛选
    const { findProps = {}, deleteField = [], arrayField = [] } = req.body;

    // 2. 配置参数头, 让浏览量下载csv
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=data.json');

    // 3. 查询数据
    //    a) .cursor()方法: 返回一个可读流, 不让大量数据直接加载到内存中
    const cursor = Model.find(findProps).cursor();

    // 4. 使用 JSONStream 转换流来美化JSON输出
    const transformStream = JSONStream.stringify();
    transformStream.pipe(res);

    // 5. 逐条处理数据
    // cursor.on('data', (doc) => transformStream.write(doc));
    cursor.on('data', (doc) => {
      // 为方便加工将doc转换为普通对象 ( 等待笔记 )
      let result = doc.toObject();

      // 删除指定字段
      result = _.omit(result, deleteField);

      // 删除指定数组中的字段
      if (arrayField instanceof Array && arrayField.length > 0) {
        arrayField.forEach((keyname) => {
          if (result[keyname] instanceof Array && result[keyname].length > 0) {
            result[keyname] = result[keyname].map((item) => {
              item = _.omit(item, deleteField);
              return item;
            });
          }
        });
      }

      transformStream.write(result);
    });

    // 6. 结束 CSV 数据流
    cursor.on('end', () => transformStream.end());

    // 7. 错误处理
    cursor.on('error', (err) => {
      res.status(400).send('JSON stream error');
    });
  });

/**
 * 高级筛选翻页查看数据
 */
exports.handleFactoryApiAdvancedFilterViewPage = (Model) =>
  CatchAsync(async (req, res, next) => {
    const {
      current = 1,
      pageSize = 10,
      sortProps,
      findProps = {},
      dataSetId,
    } = req.body;

    // 0. findProps用于高级筛选, 如果dataSetId存在则是必不可少的筛选条件
    if (dataSetId) {
      findProps.dataSetId = dataSetId;
    }

    // 1. 初始化通用翻页查询逻辑
    const viewPage = new ViewPage(Model.find(findProps), {
      current,
      pageSize,
      sort: sortProps,
    })
      .sort()
      .page();

    // 2. 执行查询
    const data = await viewPage.model.exec();

    // 3. 计算查询结果总数
    const total = await Model.countDocuments(findProps);

    res.status(200).json({
      code: 200,
      data: {
        dataSource: data,
        pageInfo: {
          total,
          current,
          pageSize,
        },
      },
      message: 'success',
    });
  });

/**
 * 批量更新数据: 可根据ids批量更新，也可以根据高级筛选条件批量更新
 */
exports.handleFactoryApiAdvancedFilterUpdateMany = (Model) =>
  CatchAsync(async (req, res, next) => {
    const {
      ids,
      dataSetId,
      dataType,
      isQuery = false,
      updateContent = {},
      findProps = {},
    } = req.body;

    if (isQuery === false && (!(ids instanceof Array) || !dataSetId)) {
      return next(
        new AppError('ids must be an array, dataSetId is required', 400)
      );
    }

    // 0. findProps用于高级筛选, 如果dataSetId存在则是必不可少的筛选条件
    if (dataSetId) {
      findProps.dataSetId = dataSetId;
    }

    // 1. 批量更新内容
    let data = null;
    if (isQuery === true) {
      data = await Model.updateMany(
        findProps,
        { $set: updateContent },
        { runValidators: true } // 开启校验
      );
    } else {
      data = await Model.updateMany(
        { dataSetId, _id: { $in: ids } },
        { $set: updateContent },
        { runValidators: true } // 开启校验
      );
    }

    if (!data) {
      return next(new AppError('Update failed!', 400));
    }

    res.status(200).json({
      code: 200,
      data,
      message: 'success',
    });
  });

/**
 * 批量删除: 可根据ids批量删除, 也可以根据高级筛选条件批量删除
 */
exports.handleFactoryApiAdvancedFilterDeleteMany = (Model) =>
  CatchAsync(async (req, res, next) => {
    const {
      ids,
      dataSetId,
      dataType,
      isQuery = false,
      findProps = {},
    } = req.body;

    if (isQuery === false && !(ids instanceof Array)) {
      return next(new AppError('ids must be an array', 400));
    }

    // 0. findProps用于高级筛选, 如果dataSetId存在则是必不可少的筛选条件
    if (dataSetId) {
      findProps.dataSetId = dataSetId;
    }

    // 1. 批量更新内容
    let data = null;
    if (isQuery === true) {
      data = await Model.deleteMany(findProps);
    } else {
      data = await Model.deleteMany({
        dataSetId,
        _id: { $in: ids },
      });
    }

    if (!data) {
      return next(new AppError('Update failed!', 400));
    }

    res.status(200).json({
      code: 200,
      data,
      message: 'success',
    });
  });

/**
 * 批量上传数据
 */
exports.handleFactoryApiBatchUpload = (Model) =>
  CatchAsync(async (req, res, next) => {
    const { data = {} } = req.body;

    //  批量入库
    const total = data.length;
    let successUploadTotal = 0;
    const maxUploadNum = 1000;
    for (let i = 0; i < total; i += maxUploadNum) {
      const batchData = await Model.insertMany(
        data.slice(i, i + maxUploadNum),
        {
          ordered: false, // 忽略失败数据继续上传
        }
      );
      successUploadTotal += batchData.length; // 计算成功上传数据
    }

    res.status(200).json({
      code: 200,
      data: {
        total,
        successUploadTotal,
      },
    });
  });
