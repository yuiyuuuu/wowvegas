const puppeteer = require("puppeteer-extra");
const path = require("path");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const stealth = StealthPlugin();
// stealth.enabledEvasions.delete("chrome.runtime"); // Customize evasion

puppeteer.use(stealth);

const { setPromiseTimeout } = require("../helper/timeout");
const { connect } = require("puppeteer-real-browser");
const { executablePath } = require("puppeteer");

async function run(obj) {
  const userDataDir = path.resolve(__dirname, obj.folder);

  const { browser, page } = await connect({
    headless: false,
    customConfig: {
      userDataDir,
      chromePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    },
  });

  // const browser = await puppeteer.launch({
  //   headless: false,
  //   args: [
  //     "--disable-blink-features=AutomationControlled",
  //     "--disable-infobars",
  //     "--no-sandbox",
  //     "--disable-setuid-sandbox",
  //     "--disable-features=IsolateOrigins,site-per-process",
  //     "--flag-switches-begin --disable-site-isolation-trials --flag-switches-end",
  //   ],
  //   executablePath:
  //     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  //   // executablePath: executablePath(),
  //   userDataDir,
  // });

  try {
    // const page = await browser.newPage();

    // Stealth techniques: Remove navigator.webdriver and spoof properties
    await page.evaluateOnNewDocument(() => {
      // Object.defineProperty(navigator, "webdriver", {
      //   get: () => false,
      // });

      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US"],
      });

      Object.defineProperty(navigator, "platform", {
        get: () => "MacIntel",
      });

      Object.defineProperty(navigator, "userAgent", {
        get: () =>
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      });

      // Object.defineProperty(navigator, "plugins", {
      //   get: () => [
      //     {
      //       name: "PDF Viewer",
      //       description: "Portable Document Format",
      //       filename: "internal-pdf-viewer",
      //     },
      //   ],
      // });

      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: "prompt" })
          : originalQuery(parameters);

      // Mock WebGL Vendor and Renderer
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        if (parameter === 37445) return "Google Inc. (Intel)"; // UNMASKED_VENDOR_WEBGL
        if (parameter === 37446)
          return "ANGLE (Intel, ANGLE Metal Renderer: Intel(R) UHD Graphics 630, Unspecified Version)"; // UNMASKED_RENDERER_WEBGL
        return getParameter(parameter);
      };

      // Mock Chrome runtime
      window.chrome = {
        runtime: {},
      };

      // Prevent detection of console.debug
      console.debug = () => {};
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    );

    // await page.setBypassCSP(true);

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    // const url = "https://stake.us/";
    const url = "https://bot.sannysoft.com/";

    await page.goto(url, { waitUntil: "networkidle2" });

    return;

    // Check if user is logged in
    const signinButton = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("[data-testid]")).filter(
        (t) => t?.innerText?.toLowerCase() === "sign in"
      );
    });

    // Login button found, user is not signed in
    if (signinButton.length > 0) {
      console.log("User not signed in.");
    }

    // Wait 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // User authenticated beyond

    // Go to wallet
    await page.goto(
      "https://stake.us/?tab=overview&currency=btc&modal=wallet",
      { waitUntil: "networkidle2" }
    );

    await setPromiseTimeout(3000);

    await page.evaluate(async () => {
      const dailyLoginButton = document.querySelector(
        '[data-test="wallet-nav-dailyBonus"]'
      );

      if (dailyLoginButton) {
        await dailyLoginButton.click();
      }
    });

    await setPromiseTimeout(2500);

    await page.evaluate(async () => {
      const claimButton = document.querySelector(
        '[data-testid="password-reset-button"]'
      );

      if (claimButton) {
        await claimButton.click();
      }
    });

    await setPromiseTimeout(5000);

    // Close browser if needed
    // await browser.close();
  } catch (error) {
    console.error(error);
    await setPromiseTimeout(2500);
    // await browser.close();
  }
}

module.exports = { run };
