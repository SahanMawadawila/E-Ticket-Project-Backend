const Bus = require("../model/Bus");
const asyncHandler = require("express-async-handler");

const priceByNoOfHalts = require("../utils/priceByNoOfHalts");
const dayjs = require("dayjs");
const convertTimeToFloat = require("../utils/convertTimeToFloat");
const search = asyncHandler(async (req, res) => {
  const { from, to, date, isToday } = req.body;

  if (!from || !to || !date)
    return res.status(400).json({ message: "Missing fields" });

  if (from === to)
    return res.status(400).json({ message: "From and To cannot be the same" });

  if (isToday && dayjs(date).isBefore(dayjs(), "day"))
    return res.status(400).json({ message: "Past dates cannot be booked" });

  //if the date is yesterday then return empty array because buses are started its journey
  if (
    !isToday &&
    dayjs(date).format("YYYY-MM-DD") ===
      dayjs().subtract(1, "day").format("YYYY-MM-DD")
  ) {
    return res.json([]);
  }

  const buses = await Bus.find();
  if (!buses) return res.sendStatus(404);

  const busesArray = [];

  buses.forEach((bus) => {
    for (let i = 0; i < bus.route.length; i++) {
      if (bus.route[i].city === from) {
        for (let j = i + 1; j < bus.route.length; j++) {
          if (bus.route[j].city === to) {
            if (
              bus.seats[53].availability.find(
                //53 seat is always available
                (obj) => obj.date === dayjs(date).format("YYYY-MM-DD")
              )
            ) {
              busesArray.push(bus);
              break;
            }
          }
        }
        break;
      }
    }
  });

  if (!busesArray.length) return res.sendStatus(204);

  //sorting the busesArray by arrivalTime
  let sortedArray = busesArray.sort(
    (a, b) =>
      convertTimeToFloat(a.route.find((obj) => obj.city === from).arrivalTime) -
      convertTimeToFloat(b.route.find((obj) => obj.city === from).arrivalTime)
  );

  //remover busses when user search for today and bus has already started its journey
  if (
    dayjs(date).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD") &&
    isToday
  ) {
    console.log("today");
    sortedArray = sortedArray.filter((bus) => {
      return (
        convertTimeToFloat(bus.busFrom.departureTime) >=
        convertTimeToFloat(dayjs().format("HH:mm"))
      );
    });
  }

  //setting the searchedDepartureTime, searchedArrivalTime, thisBusPrice, actualPrice
  for (let i = 0; i < sortedArray.length; i++) {
    let bus = sortedArray[i].toObject();
    bus.route.forEach((obj) => {
      if (obj.city === from) {
        bus = {
          ...bus,
          searchedDepartureTime: obj.departureTime,
        };
      }
      if (obj.city === to) {
        let actualPrice = priceByNoOfHalts[obj.halts];
        let thisBusPrice = 0;
        if (obj.halts > bus.minHalts) {
          thisBusPrice = actualPrice;
        } else {
          thisBusPrice = priceByNoOfHalts[bus.minHalts];
        }
        bus = {
          ...bus,
          searchedArrivalTime: obj.arrivalTime,
          thisBusPrice,
          actualPrice,
        };
      }
    });
    sortedArray[i] = bus;
  }

  //remove busses which has lower searchedDepartureTime than busFrom.departureTime
  if (isToday) {
    sortedArray = sortedArray.filter((bus) => {
      return (
        convertTimeToFloat(bus.searchedDepartureTime) >=
        convertTimeToFloat(bus.busFrom.departureTime)
      );
    });
  } else {
    sortedArray = sortedArray.filter((bus) => {
      return (
        convertTimeToFloat(bus.searchedDepartureTime) <
        convertTimeToFloat(bus.busFrom.departureTime)
      );
    });
  }
  if (!sortedArray.length) return res.sendStatus(204);

  let arrayOfBussesAfterAvailableSeatsChecking = [];
  //finding no of seats available and give property to each seat as availabilityBoolean

  for (let i = 0; i < sortedArray.length; i++) {
    let bus = sortedArray[i];
    let totalAvailableSeats = 0;

    for (let j = 0; j < bus.seats.length; j++) {
      let seat = bus.seats[j];
      seat.availabilityBoolean = 0;
      if (!seat.isBookable) {
        continue;
      }

      console.log(seat.seatNumber);
      console.log(totalAvailableSeats);
      // all the seats are bookable. j+1 is a bookable seat
      //find the available date for the seat
      for (let k = 0; k < seat.availability.length; k++) {
        if (seat.availability[k].date !== dayjs(date).format("YYYY-MM-DD")) {
          continue;
        }
        console.log(seat.availability[k].date);
        console.log(totalAvailableSeats);
        //this point availability date object is found. that object will be seat.availability[k]
        let booked = seat.availability[k].booked; // this is a array of objects
        //iterate through the booked array
        for (let l = 0; l < booked.length; l++) {
          //continue untill booked object.city === from
          if (booked[l].city !== from) {
            continue;
          }

          //when booked object.city === from
          if (booked[l].take === 0) {
            //when take false if true.
            let x = l + 1;
            let isgoneThrough = 0;
            while (x < booked.length && booked[x].city !== to) {
              //while flase when booked[x].city === to
              if (booked[x].take == 1) {
                isgoneThrough = 1; //1 means taken
                break;
              } else if (booked[x].take == 2) {
                isgoneThrough = 2; //2 means processing
                break;
              }
              x++;
            }
            if (!isgoneThrough) {
              seat.availabilityBoolean = 3;
              totalAvailableSeats++;
            } else if (isgoneThrough == 1) {
              seat.availabilityBoolean = 1;
            } else if (isgoneThrough == 2) {
              seat.availabilityBoolean = 2;
            }
            break;
          } else if (booked[l].take && !booked[l + 1].take) {
            //when take true this execute

            let x = l + 1;
            let isgoneThrough = 0;
            while (x < booked.length && booked[x].city !== to) {
              if (booked[x].take === 1) {
                isgoneThrough = 1;
                break;
              } else if (booked[x].take === 2) {
                isgoneThrough = 2;
                break;
              }
              x++;
            }
            if (!isgoneThrough) {
              seat.availabilityBoolean = 3;
              totalAvailableSeats++;
            } else if (isgoneThrough == 1) {
              seat.availabilityBoolean = 1;
            } else if (isgoneThrough == 2) {
              seat.availabilityBoolean = 2;
            }

            break;
          } else if (booked[l].take === 1) {
            seat.availabilityBoolean = 1;
            break;
          } else {
            seat.availabilityBoolean = 2;
          }
        }
      }
    }
    bus = {
      ...bus,
      totalAvailableSeats,
    };
    arrayOfBussesAfterAvailableSeatsChecking.push(bus);
  }

  console.log(arrayOfBussesAfterAvailableSeatsChecking);
  console.log(arrayOfBussesAfterAvailableSeatsChecking[0].seats[53]);
  console.log(
    arrayOfBussesAfterAvailableSeatsChecking[0].seats[53].availabilityBoolean
  );
  console.log(
    arrayOfBussesAfterAvailableSeatsChecking[0].seats[45].availabilityBoolean
  );
  res.json(arrayOfBussesAfterAvailableSeatsChecking);
});

module.exports = { search };
