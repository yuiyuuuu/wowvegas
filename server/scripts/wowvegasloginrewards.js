const puppeteer = require("puppeteer");
const path = require("path");

async function run(obj, browser, resolveMain) {
  // const userDataDir = path.resolve(__dirname, obj.folder);

  // const browser = await puppeteer.launch({
  //   headless: false,
  //   args: ["--no-sandbox", "--disable-setuid-sandbox"], // Optional for Heroku or secure environments
  //   userDataDir,
  // });

  const url = "https://www.wowvegas.com/lobby";

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  //log in, if not already
  if (page.url() === "https://www.wowvegas.com/login?redirect=/lobby") {
    await page.type("#email", obj.username, { delay: 100 });
    await page.type("#password", obj.password, { delay: 100 });

    //wait a second
    setTimeout(async () => {
      await page.click("button[type='submit']");
    }, 1000);
  }

  //claim reward
  await page.goto("https://www.wowvegas.com/lobby/?claimBonus=BLUEDAILY");

  //wait 3 seconds and then go to the email competition page and click the email button
  await new Promise((resolve) => {
    setTimeout(async () => {
      await page.goto(
        "https://www.wowvegas.com/promotions/daily-email-competition"
      );

      resolve();
    }, 3000);
  });

  //wait 3 seconds
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });

  //find the send email button and click it
  await page
    .evaluate(() => {
      const button = Array.from(document.querySelectorAll("button")).find(
        (btn) => btn.querySelector("span")?.textContent.trim() === "Send email"
      );

      button?.click();
      return button;
    })
    .then((res) => {
      console.log(res, "button");
    });

  //wait 5 seconds and close the browser
  await new Promise((resolve) => {
    setTimeout(async () => {
      await page.close();
      resolve();
      resolveMain();
    }, 5000);
  });

  //   //go to daily coins page
  //   setTimeout(async () => {
  //     await page.goto("https://www.wowvegas.com/promotions/daily-coin-reward", {
  //       waitUntil: "networkidle2",
  //     });
  //   }, 2000);

  //   //find the claim button
  //   await page.waitForSelector("article > button");
  //   page.click("article > button");

  //close the browser
  // setTimeout(async () => {
  //   await browser.close();
  // }, 12000);
}

// run({
//   username: process.env.LOGIN_1,
//   password: process.env.LOGIN_1_PW,
//   folder: "../sessions/session",
// });

module.exports = { run };
