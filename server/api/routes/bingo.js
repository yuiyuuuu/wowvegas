const router = require("express").Router();
const prisma = require("../../prisma/prismaClient");

module.exports = router;

router.get("/test", async (req, res, next) => {
  try {
    res.send("hiii!!!!<3");
  } catch (error) {
    next(error);
  }
});
