const cron = require("node-cron");
const Bus = require("../model/Bus");
const asyncHandler = require("express-async-handler");
const dayjs = require("dayjs");

const date = dayjs().add(3, "day").format("YYYY-MM-DD");
const bookingOpen = asyncHandler(async (req, res) => {
  const buses = await Bus.find();
  if (!buses) {
    return;
  }
  if (!buses.length) {
    return;
  }

  const newObject = {
    date,
    booked: [],
  };

  //going through each bus we found above and use that details to update the new bus using bulkWrite method
  const operations = buses.map((bus) => ({
    updateOne: {
      filter: { _id: bus._id },
      update: {
        $set: {
          seats: bus.seats.map((seat) => {
            if (seat.isBookable) {
              if (seat.availability.length === 5) {
                const deleteDate = dayjs.add(-2, "day").format("YYYY-MM-DD");
                seat.availability = seat.availability.filter(
                  (obj) => obj.date !== deleteDate
                );
                seat.availability = [...seat.availability, newObject];
              } else {
                let found = false;
                for (let obj of seat.availability) {
                  if (obj.date === date) {
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  seat.availability = [...seat.availability, newObject];
                }
              }
            }
            return seat;
          }),
        },
      },
    },
  }));

  await Bus.bulkWrite(operations);
});

const task1 = cron.schedule(
  "55 13 * * *",
  () => {
    bookingOpen();
    console.log(`Booking open for ${date}`);
  },
  {
    scheduled: false,
    timezone: "Asia/Kolkata",
  }
);

module.exports = {
  task1,
};
