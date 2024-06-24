class ViewPage {
  constructor(model, viewProps) {
    this.model = model;
    this.viewProps = viewProps;
  }

  // 排序
  sort() {
    const { sort } = this.viewProps;
    if (sort && typeof sort === 'string') {
      const sortBy = sort.split(',').join(' ');
      this.model = this.model.sort(sortBy);
    } else if (sort && typeof sort === 'object') {
      this.model = this.model.sort(sort);
    } else {
      this.model = this.model.sort('-creationTime');
    }

    return this;
  }

  // 翻页
  page() {
    const current = this.viewProps.current * 1 || 1;
    const pageSize = this.viewProps.pageSize * 1 || 10;
    const skip = (current - 1) * pageSize;

    this.model = this.model.skip(skip).limit(pageSize);
    return this;
  }
}

module.exports = ViewPage;
