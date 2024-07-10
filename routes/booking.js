const express = require("express");
const router = express.Router();

const {
  addBooking,
  getAllBookings,
} = require("../controllers/bookingController");

router.post("/", addBooking);
router.get("/:id", getAllBookings);

module.exports = router;
