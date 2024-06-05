const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  busId: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  seats: [Number],
});

module.exports = mongoose.model("Booking", bookingSchema);
