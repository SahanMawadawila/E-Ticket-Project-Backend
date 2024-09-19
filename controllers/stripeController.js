const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paymentStore = require("../db/store");
const { addBooking } = require("./bookingController");
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
    event.type === "payment_intent.canceled"
  ) {
    const tempBookId = event.data.object.metadata.tempBookId;
    console.log("tempBookId", tempBookId);
    delete paymentStore[tempBookId];
  }
  return res.json({ received: true });
};

module.exports = { stripeControllerFunction };
