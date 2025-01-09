const puppeteer = require("puppeteer");
const path = require("path");

const { run: claimWowVegas } = require("./daily/wowvegasloginrewards");
const { run: claimChumba } = require("./daily/chumbaDailyLogin");

async function claimDailyRewards(obj) {
  const userDataDir = path.resolve(__dirname, obj.folder);

  let browser;

  try {
    // Launch a new browser instance
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      userDataDir,
    });

    await new Promise(async (resolve) => {
      await claimWowVegas(obj, browser, resolve);
    });

    await new Promise(async (resolve) => {
      await claimChumba(obj, browser, resolve);
    });
  } catch (error) {
    console.log(error);

    if (browser) browser.close();
  }
}

module.exports = { claimDailyRewards };
