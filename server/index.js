const express = require("express");
const app = express();
const morgan = require("morgan");
const parser = require("body-parser");
const path = require("path");

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

//api routes
app.use("/api", require("./api/api"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(port, () => console.log("listening on port " + port));
v();
