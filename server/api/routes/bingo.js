const router = require("express").Router();
const prisma = require("../../prisma/prismaClient");

const path = require("path");

//bingo
const { runTest } = require("../../scripts/wowvegas");

//daily reward
const {
  run: dailyRewards,
} = require("../../scripts/daily/wowvegasloginrewards");

//chumba daily reward
const {
  run: chumbaDailyRewards,
} = require("../../scripts/daily/chumbaDailyLogin");
const { claimDailyRewards } = require("../../scripts/dailyRewards");

require("dotenv").config;

module.exports = router;

//hard coded logins for now
//logins = wowvegas logins
//different variables for different sites - each one will be its own process to not interfere with each other
const logins = [
  {
    username: process.env.LOGIN_1,
    password: process.env.LOGIN_1_PW,
    folder: path.resolve(__dirname, "../../sessions/session"),
  },
  {
    username: process.env.LOGIN_2,
    password: process.env.LOGIN_2_PW,
    folder: path.resolve(__dirname, "../../sessions/session2"),
  },
];

const chumbaLogins = [
  {
    username: process.env.CHUMBA_LOGIN_1,
    password: process.env.CHUMBA_PASSWORD_1,
    folder: path.resolve(__dirname, "../../sessions/chumba/session1"),
  },
];

const pulszLogins = [
  {
    username: process.env.PULSZ_LOGIN_1,
    password: process.env.PULSZ_PASSWORD_1,
    folder: path.resolve(__dirname, "../../sessions/pulsz/session1"),
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

// router.get("/dailypromotions", async (req, res, next) => {
//   try {
//     for (let i = 0; i < logins.length; i++) {
//       const cur = logins[i];
//       await claimDailyRewards(cur);
//     }

//     res.send("hiii!!!!<3");
//   } catch (error) {
//     next(error);
//   }
// });

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
    for (let i = 0; i < chumbaLogins.length; i++) {
      const cur = chumbaLogins[i];
      await chumbaDailyRewards(cur);
    }

    res.send("hiii!!!!<3");
  } catch (error) {
    next(error);
  }
});
