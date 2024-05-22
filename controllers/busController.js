const Bus = require("../model/Bus");
const asyncHandler = require("express-async-handler");

//get all busses name,numberplate,route
const getBuses = asyncHandler(async (req, res) => {
  const buses = await Bus.find()
    .select("-seats -capacity -noOfAlocatedSeats")
    .lean();

  if (!buses) {
    return res.sendStatus(404);
  }
  if (!buses.length) {
    return res.sendStatus(204);
  }
  res.json(buses);
});
//add a bus
const addBus = asyncHandler(async (req, res) => {
  const {
    routeNumber,
    busName,
    capacity,
    noOfAlocatedSeats,
    BusFrom,
    BusTo,
    numberPlate,
    table,
  } = req.body;

  const imageExists = req.files.length;
  if (
    !routeNumber ||
    !busName ||
    !capacity ||
    !noOfAlocatedSeats ||
    !BusFrom ||
    !BusTo ||
    !numberPlate ||
    !imageExists ||
    !table
  ) {
    res.sendStatus(400);
  }
  const busFrom = JSON.parse(BusFrom);
  const busTo = JSON.parse(BusTo);
  const routeVariable = JSON.parse(table);

  const bus = new Bus({
    routeNumber,
    busName,
    capacity,
    noOfAlocatedSeats,
    busFrom,
    busTo,
    numberPlate,
    route: routeVariable,
  });

  const nonBookableSeats = capacity - noOfAlocatedSeats;

  for (let i = 1; i <= capacity; i++) {
    if (i <= nonBookableSeats) {
      bus.seats.push({
        seatNumber: i,
        isBookable: false,
        availability: [],
      });
    } else {
      bus.seats.push({
        seatNumber: i,
        isBookable: true,
        availability: [],
      });
    }
  }

  req.files.map((file) => {
    bus.imagesURLs.push(file.filename);
  });

  const savedBus = await bus.save();

  if (savedBus) {
    res.status(201).json({ message: "Bus added successfully" });
  } else {
    res.sendStatus(500);
  }
});

//get bus by id
const getBus = asyncHandler(async (req, res) => {
  console.log(req.params.id);
  const bus = await Bus.findById(req.params.id).lean();
  if (!bus) {
    return res.sendStatus(404);
  }
  res.json(bus);
});
//delete bus by id

const deleteBus = asyncHandler(async (req, res) => {
  const bus = await Bus.findByIdAndDelete(req.params.id);
  if (!bus) {
    return res.sendStatus(404);
  }
  res.json({ message: "Bus deleted successfully" });
});

//get bus by route

//add a bus

//update bus by id

module.exports = { getBuses, addBus, getBus, deleteBus };
