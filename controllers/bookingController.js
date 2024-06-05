const asyncHandler = require("express-async-handler");
const Booking = require("../model/Booking");
const Bus = require("../model/Bus");

const addBooking = asyncHandler(async (req, res) => {
  const {
    id,
    email,
    phone,
    date,
    seats,
    busId,
    departureTime,
    arrivalTime,
    arrivalDate,
    numberPlate,
    routeNumber,
    from,
    to,
    busName,
    duration,
    busFrom,
    busTo,
    price,
  } = req.body;
  if (
    !id ||
    !email ||
    !phone ||
    !date ||
    !seats ||
    !busId ||
    !departureTime ||
    !arrivalTime ||
    !arrivalDate ||
    !numberPlate ||
    !routeNumber ||
    !from ||
    !to ||
    !busName ||
    !duration ||
    !busFrom ||
    !busTo ||
    !price
  ) {
    return res.sendStatus(400);
  }
  const bus = await Bus.findById(busId);
  if (!bus) {
    return res.sendStatus(404);
  }

  const seatSplit = seats.split(",");
  const seatNumbers = seatSplit.map(Number);
  const seatsObjectArray = bus.seats.filter((seat) =>
    seatNumbers.includes(seat.seatNumber)
  );
  //for all seats
  for (let i = 0; i < seatsObjectArray.length; i++) {
    const seatObj = seatsObjectArray[i]; //take one seat
    //object inside availability where date is equal to date
    const availability = seatObj.availability.find((obj) => obj.date === date);
    console.log(availability); //availability is a object
    if (!availability) {
      return res.sendStatus(400);
    }
    //object inside booked where city is equal to from
    for (let j = 0; j < availability.booked.length; j++) {
      if (availability.booked[j].city !== from) {
        continue;
      }
      availability.booked[j].take = true;
      for (let k = j + 1; k < availability.booked.length; k++) {
        if (availability.booked[k].city === to) {
          availability.booked[k].take = true;
          break;
        }
        availability.booked[k].take = true;
      }
      break;
    }
  }
  //bus should be updated
  await bus.save();

  const booking = new Booking({
    id,
    email,
    phone,
    date,
    seats: seatNumbers,
    busId,
  });
  await booking.save();
  res.sendStatus(201);
});

module.exports = addBooking;
