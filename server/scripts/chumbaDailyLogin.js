const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const path = require("path");

puppeteer.use(StealthPlugin());

async function run(obj, browser, resolveMain) {
  //check to see if this account has chumba login
  const { chumba_user } = obj;

  if (!chumba_user) return;

  // let browser;
  // const userDataDir = path.resolve(__dirname, obj.folder);

  try {
    // Launch a new browser instance
    // browser = await puppeteer.launch({
    //   headless: false,
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    //   userDataDir,
    // });

    const page = await browser.newPage();
    const url = "https://lobby.chumbacasino.com/";
    await page.goto(url, { waitUntil: "networkidle2" });

    if (page.url() === "https://login.chumbacasino.com/") {
      console.log("ran1");

      // Type email and password
      await page.type("#login_email-input", obj.chumba_user, { delay: 100 });
      await page.type("#login_password-input", obj.chumba_password, {
        delay: 100,
      });

      // Click the login button
      await page.click("#login_submit-button");

      // Wait for navigation or some confirmation of login
      try {
        await page.waitForNavigation({
          waitUntil: "networkidle2",
          timeout: 5000,
        });
        console.log("Login successful!");
      } catch (error) {
        console.error("Login failed or timeout:", error);
      }
    }

    // Wait a fixed amount of time for additional actions if needed
    await new Promise((resolve) => setTimeout(resolve, 4000));

    console.log("ran3");

    await page.click("#hud__primary-buy-btn");

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 3000);
    });

    await page.click("#store_tab_daily_bonus");

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 3000);
    });

    await page.click("#daily-bonus__claim-btn");

    setTimeout(() => {
      page.close();
      resolveMain();
    }, 3000);
  } catch (error) {
    console.error(error);

    //close page
    if (page) page.close();
  }
}

// run({
//   username: process.env.LOGIN_1,
//   password: process.env.LOGIN_1_PW,
//   pulsz_user: process.env.PULSZ_LOGIN_1,
//   pulsz_password: process.env.PULSZ_PASSWORD_1,
//   chumba_user: process.env.CHUMBA_LOGIN_1,
//   chumba_password: process.env.CHUMBA_PASSWORD_1,
//   folder: "../sessions/session",
// });

module.exports = { run };
