const Bus = require("../model/Bus");
const asyncHandler = require("express-async-handler");
const weekdayOrWeekendFinder = require("../utils/weekdayOrWeekendFinder");

const search = asyncHandler(async (req, res) => {
  const { from, to, date } = req.body;
  if (!from || !to || !date) return res.sendStatus(400);

  const weekDayOrWeekend = weekdayOrWeekendFinder(date);
  console.log(weekDayOrWeekend);

  const buses = await Bus.find();
  if (!buses) return res.sendStatus(404);

  const busesArray = [];

  buses.forEach((bus) => {
    for (let i = 0; i < bus.route.length; i++) {
      if (bus.route[i].city === from) {
        for (let j = i + 1; j < bus.route.length; j++) {
          if (bus.route[j].city === to) {
            console.log(bus.selectedDays[weekDayOrWeekend]);
            if (bus.selectedDays[weekDayOrWeekend] === true) {
              busesArray.push(bus);
              break;
            }
            break;
          }
        }
        break;
      }
    }
  });

  if (!busesArray.length) return res.sendStatus(204);

  const sortedArray = busesArray.sort(
    (a, b) =>
      parseFloat(a.route.find((obj) => obj.city === from).arrivalTime) -
      parseFloat(b.route.find((obj) => obj.city === from).arrivalTime)
  );

  for (let i = 0; i < sortedArray.length; i++) {
    let bus = sortedArray[i].toObject();
    bus.route.forEach((obj) => {
      if (obj.city === from) {
        bus = { ...bus, searchedDepartureTime: obj.departureTime };
      }
      if (obj.city === to) {
        bus = { ...bus, searchedArrivalTime: obj.arrivalTime };
      }
    });
    sortedArray[i] = bus;
  }

  console.log(sortedArray);
  res.json(sortedArray);
});

module.exports = { search };
