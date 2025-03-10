const puppeteer = require("puppeteer");
const path = require("path");

const vipLevels = {
  //if the next tier is bronze, then the current tier is blue, etc
  bronze: "https://www.wowvegas.com/lobby?claimBonus=blueDAILY",
  silver: "https://www.wowvegas.com/lobby?claimBonus=bronzeDAILY",
  gold: "https://www.wowvegas.com/lobby?claimBonus=silverDAILY",
};

async function run(obj) {
  const userDataDir = path.resolve(__dirname, obj.folder);

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Optional for Heroku or secure environments
    userDataDir,
  });

  const url = "https://www.wowvegas.com/lobby";

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  //log in, if not already
  if (page.url().includes("https://www.wowvegas.com/login")) {
    await page.type("#email", obj.username, { delay: 100 });
    await page.type("#password", obj.password, { delay: 100 });

    //wait a second
    setTimeout(async () => {
      await page.click("button[type='submit']");
    }, 1000);
  }

  page.waitForNavigation({ waitUntil: "networkidle0" }); // Wait for navigation to complete

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });

  //find the vip tier level
  const vip = await page.evaluate(() => {
    const vipelement = Array.from(document.querySelectorAll("span")).find(
      (t) => t?.innerText === "Progress to "
    ).nextSibling.innerText;

    // console.log(vipelement, "vipp");

    return vipelement;
  });

  // console.log(vip, "vipp");

  //claim reward
  await page.goto(vipLevels[vip]);

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
      await browser.close();
      resolve();
      // resolveMain();
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
