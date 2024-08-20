const express = require("express");
const router = express.Router();

const {
  addBooking,
  getAllBookings,
  updateBooking,
  getAllBookingsAdmin,
  freezeBooking,
  getFreezedDays,
} = require("../controllers/bookingController");

router.post("/", addBooking);
router.get("/:id", getAllBookings);
router.get("/admin/:id", getAllBookingsAdmin);
router.post("/freeze/:id", freezeBooking);
router.get("/freeze/:id", getFreezedDays);
router.patch("/:id", updateBooking);

module.exports = router;
