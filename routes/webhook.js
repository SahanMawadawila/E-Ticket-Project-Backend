const express = require("express");
const router = express.Router();

const { stripeControllerFunction } = require("../controllers/stripeController");

router.post("/", stripeControllerFunction);

module.exports = router;
