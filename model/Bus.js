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
          date: String, //otherwise it will be saved as Date format
          booked: [
            {
              city: String,
              take: {
                type: Boolean,
                default: false,
              },
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
  selectedDays: {
    weekDays: Boolean,
    sunday: Boolean,
    saturday: Boolean,
  },
  minHalts: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Bus", busSchema);
