const express = require("express");
const router = express.Router();
const { handleLogin } = require("../controllers/authAdminController");

router.post("/", handleLogin);

module.exports = router;
