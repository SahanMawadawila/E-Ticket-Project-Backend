const express = require("express");
const router = express.Router();

const {
  addBooking,
  getAllBookings,
  updateBooking,
} = require("../controllers/bookingController");

router.post("/", addBooking);
router.get("/:id", getAllBookings);
router.patch("/:id", updateBooking);

module.exports = router;
