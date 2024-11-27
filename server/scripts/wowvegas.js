const puppeteer = require("puppeteer");
const path = require("path");

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
  //kill all chromium sessions before running
  //   try {
  //     execSync("pkill -f Chromium"); // MacOS command to kill all Chromium instances
  //   } catch (error) {
  //     console.log("No existing Chromium instances found");
  //   }

  const userDataDir = path.resolve(__dirname, obj.folder);

  // Launch a new browser instance
  let browser = await puppeteer.launch({
    headless: false, // Set to `true` to run in headless mode
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Optional for Heroku or secure environments
    userDataDir,
  });

  // Open a new page
  const page = await browser.newPage();

  //   await page.setViewport({ width: 1920, height: 1080 });

  //go to lobby on wow vegas
  const url = "https://www.wowvegas.com/lobby";
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

  //   //everything below will be logged in
  //   await page.goto("https://www.wowvegas.com/play/bingo");

  //switch currency to sc
  await page.locator('#top-bar button[aria-expanded="false"]').click();
  setTimeout(async () => {
    //find the sc currency and click on it
    const sc = await page.$('#top-bar button[role="menuitem"]');
    sc.click();
  }, 2000);

  //go to the bingo link after 3 second delay
  setTimeout(async () => {
    await page.goto("https://www.wowvegas.com/play/bingo", {
      waitUntil: "load",
    });
  }, 3000);

  //5 seconds delay to allow page to load
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 5000);
  });

  //nested iframes. find the first
  await page.waitForSelector("main > div > div > iframe");

  //first iframe, there should only be one on each layer
  const t = await page.$("main > div > div > iframe");
  const topframe = await t.contentFrame();

  if (topframe) {
    //find second iframe
    // const nested = await topframe.$("iframe");
    // const nestedIframe = await nested.contentFrame();

    // if (nestedIframe) {
    //   await nestedIframe.waitForSelector(".room__item--inner-wrapper");
    //   const bingoRooms = nestedIframe.$$(".room__item--inner-wrapper");
    //   console.log(bingoRooms, "rooms");
    // }

    // let nestedIframeHandle;
    let nestedIframe;

    try {
      nestedIframe = await findFrameWithRetry(topframe, "#gameFrame"); // Replace with your frame selector

      //   nestedIframe = await topframe.$("#gameFrame");

      //   nestedIframe = await nestedIframeHandle.contentFrame();

      if (nestedIframe) {
        await nestedIframe.waitForSelector(".room__item--inner-wrapper", {
          visible: true,
          timeout: 60000,
        });

        const bingoRooms = await nestedIframe.$$(".room__item--inner-wrapper");

        console.log(bingoRooms, " B I N G O");

        //find the one room that is free
        for (const room of bingoRooms) {
          const titleElement = await room.$(
            ".room__item-info > .room__item-name > p"
          );

          const title = await nestedIframe.evaluate(
            (el) => el.textContent,
            titleElement
          );

          console.log(title, "title");

          if (title.toLowerCase() === "bingo freeway") {
            console.log("found free room");

            await room.evaluate((roomElement) => {
              const button = roomElement.querySelector(
                ".room__item-play-button > button"
              );

              if (button) button.click();
            });
          }
        }

        // //close the popup
        // await nestedIframe.waitForSelector(".popup__close-button", {
        //   visible: true,
        // });

        // await new Promise((resolve) => {
        //   setTimeout(async () => {
        //     await nestedIframe.click(".popup__close-button");
        //     resolve();
        //   }, 3000);
        // });

        //find and click the quick buy button
        await nestedIframe.waitForSelector("#quick-buy-button", {
          visible: true,
        });

        setTimeout(async () => {
          await nestedIframe.click("#quick-buy-button");
        }, 3000);

        //click the claim button
        await nestedIframe.waitForSelector(".popup__button-shaded", {
          visible: true,
        });

        setTimeout(async () => {
          await nestedIframe.click(".popup__button-shaded");
        }, 3000);
      }
    } catch (error) {
      console.log(error);
    }
  }

  //close tab after  minutes, which is around when the bingo game will end
  setTimeout(() => {
    browser.close();
  }, 360000);
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
