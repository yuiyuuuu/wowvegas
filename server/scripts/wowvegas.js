const puppeteer = require("puppeteer");
const path = require("path");
const { getBrowser } = require("./helper/findExistingBrowserSession");

//find iframe and retry
async function findFrameWithRetry(
  page,
  frameSelector,
  maxRetries = 5,
  delay = 1000
) {
  let attempts = 0;
  let frameElement;

  while (attempts < maxRetries) {
    try {
      // Try to find the frame element
      frameElement = await page.$(frameSelector);
      if (frameElement) {
        const frame = await frameElement.contentFrame();
        if (frame) {
          console.log(frame, "frame");
          return frame; // Return the frame if found
        }
      }
    } catch (error) {
      console.log(`Attempt ${attempts + 1} failed. Retrying...`);
    }

    attempts++;
    console.log(
      `Retrying to locate frame ${frameSelector} (${attempts}/${maxRetries})`
    );

    await new Promise(function (resolve) {
      setTimeout(resolve, delay);
    });
  }

  throw new Error(
    `Failed to find frame ${frameSelector} after ${maxRetries} attempts`
  );
}

async function runTest(obj) {
  const userDataDir = path.resolve(__dirname, obj.folder);

  let browser = await getBrowser(userDataDir);
  try {
    // Launch a new browser instance
    // browser = await puppeteer.launch({
    //   headless: false,
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    //   userDataDir,
    // });

    const page = await browser.newPage();
    const url = "https://www.wowvegas.com/lobby";
    await page.goto(url, { waitUntil: "networkidle2" });

    // Handle login
    if (page.url() === "https://www.wowvegas.com/login?redirect=/lobby") {
      await page.type("#email", obj.username, { delay: 100 });
      await page.type("#password", obj.password, { delay: 100 });
      await page.click("button[type='submit']");
      await page.waitForNavigation({ waitUntil: "networkidle2" });
    }

    // Switch currency to SC
    await page.waitForSelector('#top-bar button[aria-expanded="false"]');
    await page.click('#top-bar button[aria-expanded="false"]');
    await page.waitForSelector('#top-bar button[role="menuitem"]');
    const sc = await page.$('#top-bar button[role="menuitem"]');
    if (sc) await sc.click();

    // Navigate to bingo and handle nested iframes
    await page.goto("https://www.wowvegas.com/play/bingo", {
      waitUntil: "load",
    });

    await page.waitForSelector("main > div > div > iframe");

    const t = await page.$("main > div > div > iframe");
    const topframe = await t.contentFrame();

    if (topframe) {
      const nestedIframe = await findFrameWithRetry(topframe, "#gameFrame");
      if (nestedIframe) {
        await nestedIframe.waitForSelector(".room__item--inner-wrapper", {
          visible: true,
          timeout: 60000,
        });
        const bingoRooms = await nestedIframe.$$(".room__item--inner-wrapper");

        for (const room of bingoRooms) {
          const titleElement = await room.$(
            ".room__item-info > .room__item-name > p"
          );
          const title = await nestedIframe.evaluate(
            (el) => el.textContent,
            titleElement
          );

          if (title.toLowerCase() === "bingo freeway!") {
            await room.evaluate((roomElement) => {
              const button = roomElement.querySelector(
                ".room__item-play-button > button"
              );
              if (button) button.click();
            });

            await nestedIframe.waitForSelector("#quick-buy-button", {
              visible: true,
            });
            await nestedIframe.click("#quick-buy-button");

            await nestedIframe.waitForSelector(".popup__button-shaded", {
              visible: true,
            });
            await nestedIframe.click(".popup__button-shaded");
          }
        }
      }
    }

    // Schedule browser close
    setTimeout(() => browser.close(), 360000); // Close after 6 minutes
  } catch (error) {
    console.error("Error occurred:", error);

    // Close browser if it exists
    if (browser) await browser.close();
  }
}

// // Run the function
// runTest({
//   username: process.env.LOGIN_1,
//   password: process.env.LOGIN_1_PW,
//   folder: "../sessions/session",
// }).catch((error) => {
//   console.error("Error running Puppeteer test:", error);
// });

module.exports = { runTest };
