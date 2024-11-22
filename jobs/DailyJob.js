const cron = require("node-cron");
const Bus = require("../model/Bus");
const asyncHandler = require("express-async-handler");
const dayjs = require("dayjs");
const weekdayOrWeekendFinder = require("../utils/weekdayOrWeekendFinder");
const Booking = require("../model/Booking");
const fsPromises = require("fs").promises;

const bookingOpen = asyncHandler(async () => {
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
                  ) === undefined &&
                  !bus.freezedDays.includes(
                    dayjs().add(i, "day").format("YYYY-MM-DD")
                  )
                ) {
                  seat.availability.push({
                    date: dayjs().add(i, "day").format("YYYY-MM-DD"),
                    booked: seat.availability[0].booked.map((obj) => {
                      return {
                        city: obj.city,
                        take: {
                          in: 0,
                          out: 0,
                        },
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

//delete the booking after 3 days
const deleteBooking = asyncHandler(async () => {
  const threeDaysAgo = dayjs().subtract(3, "day").format("YYYY-MM-DD");
  await Booking.deleteMany({ mappedDate: threeDaysAgo });
  console.log(`Deleted all bookings before ${threeDaysAgo}`);
});

//delete freeze days after 3 days
const deleteFreezeDays = asyncHandler(async () => {
  const threeDaysAgo = dayjs().subtract(3, "day").format("YYYY-MM-DD");
  const buses = await Bus.find();
  if (!buses) {
    return;
  }
  if (!buses.length) {
    return;
  }
  const operations = buses.map((bus) => ({
    updateOne: {
      filter: { _id: bus._id },
      update: {
        $set: {
          freezedDays: bus.freezedDays.filter((date) => {
            return dayjs(date).diff(dayjs(), "day") >= -3;
          }),
        },
      },
    },
  }));
  await Bus.bulkWrite(operations);
});

//delete pdfs after 3 days
const deletePDFs = async () => {
  const threeDaysAgo = dayjs().subtract(3, "day").format("YYYY-MM-DD");
  const files = await fsPromises.readdir("./pdf");
  console.log(files);
  files.forEach(async (file) => {
    if (file.includes(threeDaysAgo)) {
      console.log(`Deleted ${file}`);
      await fsPromises.unlink(`./pdf/${file}`);
    }
  });
};

const task1 = cron.schedule(
  "43 01 * * *",
  () => {
    bookingOpen();
    deleteBooking();
    deleteFreezeDays();
    deletePDFs();
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
