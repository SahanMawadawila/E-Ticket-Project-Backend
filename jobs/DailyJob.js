const cron = require("node-cron");
const Bus = require("../model/Bus");
const asyncHandler = require("express-async-handler");
const dayjs = require("dayjs");
const weekdayOrWeekendFinder = require("../utils/weekdayOrWeekendFinder");

const bookingOpen = asyncHandler(async (req, res) => {
  const buses = await Bus.find();
  if (!buses) {
    return;
  }
  if (!buses.length) {
    return;
  }

  //going through each bus we found above and use that details to update the new bus using bulkWrite method
  const operations = buses.map((bus) => ({
    updateOne: {
      filter: { _id: bus._id },
      update: {
        $set: {
          seats: bus.seats.map((seat) => {
            if (seat.isBookable) {
              for (let i = 0; i < 4; i++) {
                if (
                  bus.selectedDays[
                    weekdayOrWeekendFinder(dayjs().add(i, "day"))
                  ] === true &&
                  seat.availability.find(
                    (obj) =>
                      obj.date === dayjs().add(i, "day").format("YYYY-MM-DD")
                  ) === undefined
                ) {
                  seat.availability.push({
                    date: dayjs().add(i, "day").format("YYYY-MM-DD"),
                    booked: seat.availability[0].booked.map((obj) => {
                      return {
                        city: obj.city,
                        take: false,
                      };
                    }),
                  });
                }
              }

              //remove objects that happen before 2 days to the current date ( others will be removed)
              seat.availability = seat.availability.filter((obj) => {
                return dayjs(obj.date).diff(dayjs(), "day") >= -2;
              });
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
  "39 06 * * *",
  () => {
    bookingOpen();
    console.log(
      `Booking open until ${dayjs().add(3, "day").format("YYYY-MM-DD")}`
    );
  },
  {
    scheduled: false,
    timezone: "Asia/Kolkata",
  }
);

module.exports = {
  task1,
};
