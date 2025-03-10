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

  page.on("frameattached", (frame) => {
    console.log(`Frame attached: ${frame.url()}`);
  });

  page.on("framedetached", (frame) => {
    console.log(`Frame attached: ${frame.url()}`);
  });

  //   await page.setViewport({ width: 1920, height: 1080 });

  //go to lobby on wow vegas
  const url = "https://www.pulszbingo.com/bingo/rooms/sc_route_66/play";
  await page.goto(url, { waitUntil: "networkidle2" });

  //log in, if not already
  await page.waitForSelector("main", { visible: true });

  //   //everything below will be logged in
  //   await page.goto("https://www.wowvegas.com/play/bingo");

  //switch currency to sc
  await page.locator('#top-bar button[aria-expanded="false"]').click();
  setTimeout(async () => {
    //find the sc currency and click on it
    const sc = await page.$('#top-bar button[role="menuitem"]');
    sc.click();
  }, 1000);

  //go to the bingo link after 3 second delay
  setTimeout(async () => {
    await page.goto("https://www.wowvegas.com/play/bingo", {
      waitUntil: "networkidle2",
    });
  }, 3000);

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
      console.log(nestedIframe, "Frame found!");

      //   nestedIframe = await nestedIframeHandle.contentFrame();

      if (nestedIframe) {
        await nestedIframe.waitForSelector(".room__item--inner-wrapper", {
          visible: true,
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

          if (title.toLowerCase() === "bingo freeway") {
            console.log("found free room");

            //find the play button and click it for the free room
            // await room.$(".room__item-play-button > button").click();
            // const c = await room.$(".room__item-play-button > button", {
            //   visible: true,
            // });
            // await c.click();
            // console.log(c, "csdcjskdc");

            await room.evaluate((roomElement) => {
              const button = roomElement.querySelector(
                ".room__item-play-button > button"
              );

              if (button) button.click();
            });
          }
        }

        if (nestedIframe.$(".popup__close-button")) {
          await nestedIframe.click(".popup__close-button");
        }

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

        // await nestedIframe.evaluate(() => {
        //   const claimButton = document.querySelector("#quick-buy-button");
        //   console.log(claimButton, "button claim");

        //   if (claimButton) claimButton.click();
        // });
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
//   folder: "session",
// }).catch((error) => {
//   console.error("Error running Puppeteer test:", error);
// });

module.exports = { runTest };
