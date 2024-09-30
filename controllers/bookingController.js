const asyncHandler = require("express-async-handler");
const Booking = require("../model/Booking");
const Bus = require("../model/Bus");
const generateQRCodeAndPDF = require("../utils/generateQR");
const sendEmailWithAttachment = require("../utils/sendEmail");
const { search } = require("./searchController");
const dayjs = require("dayjs");
const convertTimeToFloat = require("../utils/convertTimeToFloat");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const crypto = require("crypto");
const paymentStore = require("../db/store");
//const dayjs = require("dayjs");
//const { Console } = require("console");

/* let globalVars = {
  id: null,
  email: null,
  phone: null,
  date: null,
  seats: null,
  busId: null,
  departureTime: null,
  arrivalTime: null,
  arrivalDate: null,
  numberPlate: null,
  routeNumber: null,
  from: null,
  to: null,
  busName: null,
  duration: null,
  busFrom: null,
  busTo: null,
  price: null,
  busDepartureTime: null,
}; */

const generateRandomStringAndStoreDetails = (data) => {
  const id = crypto.randomBytes(16).toString("hex");
  const currentDateFromLibrary = dayjs().format("YYYY-MM-DD");
  const temp = id + currentDateFromLibrary;
  paymentStore[temp] = data;
  return temp;
};

const makePayment = asyncHandler(async (req, res) => {
  const tempBookId = generateRandomStringAndStoreDetails(req.body);
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
    busDepartureTime,
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

  /* const currentDateFromLibrary = dayjs().format("YYYY-MM-DD");
  const temp = tempBookId + currentDateFromLibrary; */

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "lkr",
          product_data: {
            name: "E-Ticket by eseats.lk",
          },
          unit_amount: price * 100,
        },
        quantity: 1,
      },
    ],

    mode: "payment",
    customer_email: email,
    success_url: process.env.FRONTEND_URL + "/payment-success",
    cancel_url: process.env.FRONTEND_URL + "/",
    metadata: {
      tempBookId: tempBookId,
    },
  });

  //console.log("TempBookId: ", tempBookId);

  //console.log("TempBookId: ", temp);
  res.json({ id: session.id, tempBookId: tempBookId });
});

const addBooking = async (data, tempBookId) => {
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
    busDepartureTime,
    price,
  } = data;

  const bus = await Bus.findById(busId);
  const seatSplit = seats.split(",");
  const seatNumbers = seatSplit.map(Number);
  const seatsObjectArray = bus.seats.filter((seat) =>
    seatNumbers.includes(seat.seatNumber)
  );
  //for all seats
  for (let i = 0; i < seatsObjectArray.length; i++) {
    const seatObj = seatsObjectArray[i]; //take one seat
    //object inside availability where date is equal to date

    let availability = {};
    if (
      convertTimeToFloat(busDepartureTime) <= convertTimeToFloat(departureTime)
    ) {
      availability = seatObj.availability.find((obj) => obj.date === date);
    } else {
      availability = seatObj.availability.find(
        (obj) =>
          obj.date === dayjs(date).subtract(1, "day").format("YYYY-MM-DD")
      );
    }

    console.log(availability); //availability is a object
    if (!availability) {
      return;
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
  //pdf part start..
  const randomNumber = Math.floor(Math.random() * 100000000); // random number
  console.log(`QR code data: ${randomNumber}`);

  generateQRCodeAndPDF(
    id,
    phone,
    randomNumber,
    email,
    from,
    to,
    departureTime,
    arrivalTime,
    arrivalDate,
    date,
    numberPlate,
    routeNumber,
    price,
    seats,
    tempBookId
  )
    .then(() => {
      return sendEmailWithAttachment(email, tempBookId);
    })
    .then(() => {
      console.log("Process completed successfully.");
    })
    .catch((err) => {
      console.error("An error occurred:", err);
    });

  //pdf part end...

  //bus should be updated
  await bus.save();

  const booking = new Booking({
    id,
    email,
    phone,
    date,
    seats: seatNumbers,
    busId,
    randomNumber,
    mappedDate:
      busDepartureTime <= departureTime
        ? date
        : dayjs(date).subtract(1, "day").format("YYYY-MM-DD"),
    from,
    to,
    departureTime,
    arrivalTime,
    arrivalDate,
  });
  await booking.save();
  //res.sendStatus(201);
};

const getAllBookings = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const today = dayjs().format("YYYY-MM-DD");

  const bookings = await Booking.find({ busId: id, mappedDate: today })
    .select(
      "_id id date seats from to departureTime arrivalTime arrivalDate isChecked"
    )
    .lean();

  console.log(bookings);
  if (!bookings) {
    return res.sendStatus(404);
  }
  if (!bookings.length) {
    return res.sendStatus(204);
  }
  console.log(bookings);
  res.json(bookings);
});

const updateBooking = asyncHandler(async (req, res) => {
  const busId = req.params.id;
  //console.log(busId);
  const bookingId = req.body.bookingId;
  //console.log(bookingId);
  const booking = await Booking.findOne({ randomNumber: bookingId, busId });

  //console.log(booking);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.isChecked) {
    return res.status(400).json({ message: "Already checked" });
  }

  booking.isChecked = true;
  await booking.save();
  console.log(booking._id);
  res.json({ bookingId: booking._id });
});

const getAllBookingsAdmin = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const arrayOfBookings = [];
  for (let i = 0; i < 4; i++) {
    const date = dayjs().add(i, "day").format("YYYY-MM-DD");
    const count = await Booking.countDocuments({ busId: id, mappedDate: date });
    arrayOfBookings.push({ date, count });
  }
  console.log(arrayOfBookings);
  res.json(arrayOfBookings);
});

const freezeBooking = asyncHandler(async (req, res) => {
  const busId = req.params.id;
  const date = req.body.date;
  //hello
  console.log(busId, date);
  const bus = await Bus.findById(busId);
  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  const freezeArray = bus.freezedDays;

  if (freezeArray.includes(date)) {
    return res.status(400).json({ message: "Already freezed" });
  }
  bus.freezedDays.push(date);

  await bus.save();

  res.status(200).json({
    message: `${date} is 
    successfully freezed`,
  });
});

const getFreezedDays = asyncHandler(async (req, res) => {
  const busId = req.params.id;
  const froze = [];

  const bus = await Bus.findById(busId);
  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  const freezeArray = bus.freezedDays;
  for (let i = 0; i < freezeArray.length; i++) {
    froze.push({
      date: freezeArray[i],
      reason: "Froze",
    });
  }

  console.log(froze);

  /* const tripDaysArray = bus.tripDetails.days;
  for (let i = 0; i < tripDaysArray.length; i++) {
    if (!freezeArray.includes(tripDaysArray[i])) {
      froze.push({
        date: tripDaysArray[i],
        reason: "Trip",
      });
    }
  } */
  res.json(froze);
});

module.exports = {
  addBooking,
  getAllBookings,
  updateBooking,
  getAllBookingsAdmin,
  freezeBooking,
  getFreezedDays,
  makePayment,
};
