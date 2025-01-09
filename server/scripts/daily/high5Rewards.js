const puppeteer = require("puppeteer-extra");
const path = require("path");
const { getBrowser } = require("../helper/findExistingBrowserSession");

async function run(obj) {
  const userDataDir = path.resolve(__dirname, obj.folder);

  let browser = await getBrowser(userDataDir);

  try {
  } catch (error) {
    console.log(error);
    if (browser) browser.close();
  }
}
