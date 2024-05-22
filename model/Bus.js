const { ar } = require("date-fns/locale");
const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: true,
  },
  busName: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  noOfAlocatedSeats: {
    type: Number,
    required: true,
  },
  busFrom: {
    city: {
      type: String,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
  },

  busTo: {
    city: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
  },
  numberPlate: {
    type: String,
    required: true,
  },
  route: [
    {
      city: {
        type: String,
        required: true,
      },
      halts: {
        type: Number,
        required: true,
      },
      arrivalTime: {
        type: String,
        required: true,
      },
      departureTime: {
        type: String,
        required: true,
      },
    },
  ],
  seats: [
    {
      seatNumber: Number,
      isBookable: Boolean,
      availability: [
        {
          date: Date,
          booked: [
            {
              from: String,
              to: String,
            },
          ],
        },
      ],
    },
  ],

  imagesURLs: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("Bus", busSchema);
