const router = require("express").Router();
const prisma = require("../../prisma/prismaClient");
const { runTest } = require("../../puppet");

require("dotenv").config;

module.exports = router;

router.get("/test", async (req, res, next) => {
  try {
    //hard coded logins for now
    const logins = [
      {
        username: process.env.LOGIN_1,
        password: process.env.LOGIN_1_PW,
        folder: "sessions/session",
      },

      {
        username: process.env.LOGIN_2,
        password: process.env.LOGIN_2_PW,
        folder: "sessions/session2",
      },
    ];

    for (let i = 0; i < logins.length; i++) {
      const cur = logins[i];
      console.log(cur, "cur");
      runTest(cur);
    }

    res.send("hiii!!!!<3");
  } catch (error) {
    next(error);
  }
});
