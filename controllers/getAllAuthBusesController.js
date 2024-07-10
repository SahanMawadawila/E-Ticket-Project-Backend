const Bus = require("../model/Bus");
const Booking = require("../model/Booking");
const asyncHandler = require("express-async-handler");
const dayjs = require("dayjs");

const getAllAuthBusesController = asyncHandler(async (req, res) => {
  const company = req.body.company;
  const buses = await Bus.find({ busName: company })
    .select("routeNumber busFrom busTo numberPlate seats _id")
    .lean();

  if (!buses) {
    return res.sendStatus(404);
  }
  if (!buses.length) {
    return res.sendStatus(204);
  }

  const today = dayjs().format("YYYY-MM-DD");

  const busesWithTodayBookings = [];
  buses.map((bus) => {
    const objectArray = bus.seats[bus.seats.length - 1].availability;

    for (let i = 0; i < objectArray.length; i++) {
      if (objectArray[i].date === today) {
        busesWithTodayBookings.push(bus);
        break;
      }
    }
  });

  if (busesWithTodayBookings.length === 0) {
    return res.sendStatus(204);
  }

  //console.log(busesWithTodayBookings);
  const busesWithTodayBookingsAndDetails = [];
  for (let i = 0; i < busesWithTodayBookings.length; i++) {
    const bus = busesWithTodayBookings[i].toObject();
    const bookings = await Booking.find({ busId: bus._id, mappedDate: today });
    bus.noOfBookings = bookings.length;
    if (bookings.length !== 0) {
      bus.haveToCheck = bookings.reduce((acc, booking) => {
        return acc + (booking.isChecked ? 0 : 1);
      }, 0);
    } else {
      bus.haveToCheck = 0;
    }
    busesWithTodayBookingsAndDetails.push(bus);
  }

  console.log(busesWithTodayBookingsAndDetails);
  res.json(busesWithTodayBookingsAndDetails);
});

module.exports = getAllAuthBusesController;
