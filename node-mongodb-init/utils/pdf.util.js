const puppeteer = require('puppeteer');
const path = require('path');
const { rootPath } = require('../config');

async function handleUtilExportPageToPDF(props) {
  try {
    const {
      fileName,
      url,
      dataSetId,
      waitForSelector,
      isBuffer,
      is401 = true,
    } = props;

    // 1. 初始化浏览器
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // 2. 获取页面
    const page = await browser.newPage();

    // 2.1 http基本认证
    if (is401) {
      await page.setExtraHTTPHeaders({
        Authorization: `Basic ${Buffer.from(
          `${process.env.HTTP_USERNAME}:${process.env.HTTP_PASSWORD}`
        ).toString('base64')}`,
      });
    }
    await page.goto(url, { waitUntil: 'networkidle0' });

    // 3. 等待指定元素加载完毕
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { visible: true });
    }

    // 4. 导出A4尺寸的PDF
    // await page.pdf({
    //   path: path.join(
    //     `${rootPath}/public/${dataSetId}/pdf/`,
    //     `${fileName}.pdf`
    //   ),
    //   format: 'A4',
    //   printBackground: true, // 确保PDF中包含页面背景
    // });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    // 5. 关闭浏览器
    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.log('error', error);
    return null;
  }
}

module.exports = {
  handleUtilExportPageToPDF,
};
