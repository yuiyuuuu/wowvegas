const { execSync } = require("child_process");

// Function to terminate all Chromium instances
function killChromiumInstances() {
  try {
    // Attempt to kill all Chromium instances
    execSync("pkill -f chromium");
    execSync("pkill -f Google Chrome for Testing"); // Use this line if Chromium is named as "chrome"
    console.log("Closed all Chromium instances");
  } catch (error) {
    console.log("No Chromium instances found to terminate.");
  }
}

// Optional: Ensure Node process exits cleanly, which stops child processes.
function closeServer() {
  killChromiumInstances();
  console.log("Exiting Node process.");
  process.exit(0);
}

// Example: Call `closeServer()` when you want to terminate everything.
closeServer();
