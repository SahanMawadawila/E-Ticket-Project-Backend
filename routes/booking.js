const express = require("express");
const router = express.Router();

<<<<<<< Updated upstream
const addBooking = require("../controllers/bookingController");

router.post("/", addBooking);
=======
const {
  makePayment,
  getAllBookings,
  updateBooking,
} = require("../controllers/bookingController");

router.post("/", makePayment);
router.get("/:id", getAllBookings);
router.patch("/:id", updateBooking);
>>>>>>> Stashed changes

module.exports = router;
