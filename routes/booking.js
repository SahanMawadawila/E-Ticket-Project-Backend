const express = require("express");
const router = express.Router();

const addBooking = require("../controllers/bookingController");

router.post("/", addBooking);

module.exports = router;
