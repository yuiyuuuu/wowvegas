const puppeteer = require("puppeteer"); // Use puppeteer for launching a new session if needed
// const puppeteerCore = require("puppeteer-core"); // Use puppeteer-core for connecting to an existing session
const fs = require("fs");
const path = require("path");

async function getBrowser(userDataDir) {
  const wsEndpointPath = path.resolve(userDataDir, "wsEndpoint.txt");
  let browser;

  try {
    if (fs.existsSync(wsEndpointPath)) {
      // Attempt to connect to an existing session
      const wsEndpoint = fs.readFileSync(wsEndpointPath, "utf8");
      console.log("Connecting to existing browser session...");
      return await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
    }
  } catch (error) {
    console.warn("Failed to connect to existing session:", error);
  }

  // If no existing session, launch a new browser
  console.log("No existing session found. Launching a new browser...");
  browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    userDataDir,
  });

  // Save the WebSocket endpoint for future connections
  const wsEndpoint = browser.wsEndpoint();
  fs.writeFileSync(wsEndpointPath, wsEndpoint);
  return browser;
}

module.exports = { getBrowser };
