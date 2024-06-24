const mongoose = require('mongoose');

const {
  handleUtilMidDocsTimeStamp,
  handleUtilMidDocTimeStamp,
} = require('../utils/time-format.util');

const dataModelSchema = new mongoose.Schema(
  {
    name: String,

    /**
     * 功能字段
     */

    /**
     * 扩展字段
     */
  },
  {
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
dataModelSchema.index({ title: 1, mainWechatAccount: 1 });

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

const Model = mongoose.model('project', dataModelSchema);

module.exports = Model;
