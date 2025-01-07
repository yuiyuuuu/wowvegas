const router = require("express").Router();
const prisma = require("../../prisma/prismaClient");

//bingo
const { runTest } = require("../../scripts/wowvegas");

//daily reward
const { run: dailyRewards } = require("../../scripts/wowvegasloginrewards");

//chumba daily reward
const { run: chumbaDailyRewards } = require("../../scripts/chumbaDailyLogin");
const { claimDailyRewards } = require("../../scripts/dailyRewards");

require("dotenv").config;

module.exports = router;

//hard coded logins for now
const logins = [
  {
    username: process.env.LOGIN_1,
    password: process.env.LOGIN_1_PW,
    pulsz_user: process.env.PULSZ_LOGIN_1,
    pulsz_password: process.env.PULSZ_PASSWORD_1,
    chumba_user: process.env.CHUMBA_LOGIN_1,
    chumba_password: process.env.CHUMBA_PASSWORD_1,
    folder: "../sessions/session",
  },

  {
    username: process.env.LOGIN_2,
    password: process.env.LOGIN_2_PW,
    folder: "../sessions/session2",
  },
];

router.get("/wowvegas", async (req, res, next) => {
  try {
    for (let i = 0; i < logins.length; i++) {
      const cur = logins[i];
      runTest(cur);
    }

    res.send("hiii!!!!<3");
  } catch (error) {
    next(error);
  }
});

router.get("/dailypromotions", async (req, res, next) => {
  try {
    for (let i = 0; i < logins.length; i++) {
      const cur = logins[i];
      await claimDailyRewards(cur);
    }

    res.send("hiii!!!!<3");
  } catch (error) {
    next(error);
  }
});

router.get("/wowvegasdaily", async (req, res, next) => {
  try {
    for (let i = 0; i < logins.length; i++) {
      const cur = logins[i];
      await dailyRewards(cur);
    }

    res.send("hiii!!!!<3");
  } catch (error) {
    next(error);
  }
});

router.get("/chumbadaily", async (req, res, next) => {
  try {
    for (let i = 0; i < logins.length; i++) {
      const cur = logins[i];
      await chumbaDailyRewards(cur);
    }

    res.send("hiii!!!!<3");
  } catch (error) {
    next(error);
  }
});
