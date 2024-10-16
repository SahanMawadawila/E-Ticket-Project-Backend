const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paymentStore = require("../db/store");
const { addBooking } = require("./bookingController");
const Bus = require("../model/Bus");
const stripeControllerFunction = async (req, res) => {
  const payload = req.rawBody;

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    console.log("metadata", event.data.object.metadata);
    const tempBookId = event.data.object.metadata.tempBookId;
    const paymentDetails = paymentStore[tempBookId];
    console.log("paymentDetails", paymentDetails);
    await addBooking(paymentDetails, tempBookId);
    delete paymentStore[tempBookId];
  } else if (
    event.type === "payment_intent.payment_failed" ||
    event.type === "payment_intent.canceled" ||
    event.type === "checkout.session.expired"
  ) {
    console.log("event", event);
    const tempBookId = event.data.object.metadata.tempBookId;
    console.log("tempBookId", tempBookId);

    const data = paymentStore[tempBookId];

    const { busId, seats, date, from, to, busDepartureTime, departureTime } =
      data;

    const bus = await Bus.findById(busId);
    //make that seats as processing
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
        convertTimeToFloat(busDepartureTime) <=
        convertTimeToFloat(departureTime)
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
        return res.sendStatus(404);
      }
      //object inside booked where city is equal to from
      for (let j = 0; j < availability.booked.length; j++) {
        if (availability.booked[j].city !== from) {
          continue;
        }

        availability.booked[j].take = 3;
        for (let k = j + 1; k < availability.booked.length; k++) {
          if (availability.booked[k].city === to) {
            availability.booked[k].take = 3;
            break;
          }
          availability.booked[k].take = 3;
        }
        break;
      }
    }

    await bus.save();
    delete paymentStore[tempBookId];
  }
  return res.json({ received: true });
};

module.exports = { stripeControllerFunction };
