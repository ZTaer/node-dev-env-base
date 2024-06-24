const mongoose = require('mongoose');

const {
  handleUtilMidDocsTimeStamp,
  handleUtilMidDocTimeStamp,
} = require('../utils/time-format.util');

const dataModelSchema = new mongoose.Schema(
  {
    /**
     * 功能字段
     */
    /**
     * 扩展字段
     */
  },
  {
    strict: false, // 关闭严格模式: 将使用动态模式，无需定义数据结构 ( 等待笔记 )
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

/**
 * 索引
 */
dataModelSchema.index({});

/**
 * 中间件
 */

// 查询前
dataModelSchema.pre(/^find/, function (next) {
  this.find().select('-__v');
  next();
});

// 查询后
dataModelSchema.post(/^find/, (docs, next) =>
  // 转北京时间戳: 方案 ( 等待笔记 )
  handleUtilMidDocsTimeStamp(docs, next, {
    timeKeyName: ['creationTime', 'updateTime'],
  })
);

// 查询后: 兼容findById
dataModelSchema.post(/^findOneAnd/, (doc, next) =>
  // 转北京时间戳
  handleUtilMidDocTimeStamp(doc, next, {
    timeKeyName: ['creationTime', 'updateTime'],
  })
);

const Model = mongoose.model('noLimit', dataModelSchema);

module.exports = Model;
