const express = require("express");
const app = express();
const morgan = require("morgan");
const parser = require("body-parser");
const path = require("path");

const cron = require("node-cron");
const axios = require("axios");

const port = process.env.PORT || 4009;

const { createServer } = require("vite");

require("dotenv").config();

app.use(express.json({ extended: true, limit: "100mb" }));
app.use(morgan("dev"));
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../dist")));

// /assets virtual path for the images
app.use("/assets", express.static(path.join(__dirname, "../assets")));

const v = async function () {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);
};

//cron schedule tasks
//wowvegas bingo every 15 minutes
cron.schedule("14,26,44,59 * * * *", async () => {
  console.log("Running task at minute 14, 29, 44, and 59");
  await axios.get("http://localhost:4009/api/bingo/wowvegas");
});

// axios.get("http://localhost:4009/api/bingo/wowvegas");
// axios.get("http://localhost:4009/api/bingo/chumbadaily");
axios.get("http://localhost:4009/api/bingo/wowvegasdaily");
// axios.get("http://localhost:4009/api/bingo/dailypromotions");

//wowvegas claim daily reward, 12:09am
cron.schedule("9 0 * * *", async () => {
  console.log("Running task at 12:08 AM");
  // await axios.get("http://localhost:4009/api/bingo/dailypromotions");

  axios.get("http://localhost:4009/api/bingo/wowvegasdaily");
});

//chumba claim daily reward, 12:08 am. One minute apart to prevent excessive ram usage
cron.schedule("8 0 * * *", async () => {
  console.log("Running task at 12:08 AM");
  // await axios.get("http://localhost:4009/api/bingo/dailypromotions");

  axios.get("http://localhost:4009/api/bingo/chumbadaily");
});

//api routes
app.use("/api", require("./api/api"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(port, () => console.log("listening on port " + port));
v();
