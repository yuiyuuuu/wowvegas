const router = require("express").Router();

module.exports = router;

router.use("/bingo", require("./routes/bingo"));
