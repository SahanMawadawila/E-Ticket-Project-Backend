const express = require("express");
const router = express.Router();

const {
  makePayment,
  getAllBookings,
  updateBooking,
  getAllBookingsAdmin,
  freezeBooking,
  getFreezedDays,
} = require("../controllers/bookingController");

router.post("/", makePayment);
router.get("/:id", getAllBookings);
router.get("/admin/:id", getAllBookingsAdmin);
router.post("/freeze/:id", freezeBooking);
router.get("/freeze/:id", getFreezedDays);
router.patch("/:id", updateBooking);

module.exports = router;
