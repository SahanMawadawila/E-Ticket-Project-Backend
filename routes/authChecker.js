const express = require("express");
const router = express.Router();
const { handleLogin } = require("../controllers/authCheckerController");

router.post("/", handleLogin);

module.exports = router;
