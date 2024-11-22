const paymentStore = require("../db/store");
const dayjs = require("dayjs");
const Bus = require("../model/Bus");
const convertTimeToFloat = require("./convertTimeToFloat");

async function checkTimeOut() {
  console.log("checking for timeout at", new Date());
  const currentTime = dayjs();

  //for all keys in paymentStore
  for (const key in paymentStore) {
    const { createdAt } = paymentStore[key];
    const createdAtTime = dayjs(createdAt);

    //expired after 5 minutes
    if (currentTime.diff(createdAtTime, "minute") > 1) {
      //timeout after 1 minute
      const { busId, seats, date, from, to, busDepartureTime, departureTime } =
        paymentStore[key];

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

          if (availability.booked[j].take === 2) {
            availability.booked[j].take = 0;
          }

          for (let k = j + 1; k < availability.booked.length; k++) {
            if (availability.booked[k].city === to) {
              if (availability.booked[j].take === 2) {
                availability.booked[j].take = 0;
              }
              break;
            }
            if (availability.booked[j].take === 2) {
              availability.booked[j].take = 0;
            }
          }
          break;
        }
      }

      await bus.save();
      console.log("Timeout", key);
      delete paymentStore[key];
    }
  }
}

function sheduler() {
  console.log("sheduler running");
  setInterval(checkTimeOut, 1 * 30 * 1000); //sheduler will run every 30 seconds
}

module.exports = sheduler;
