const asyncHandler = require("express-async-handler");
const Bus = require("../model/Bus");
const getAllCities = asyncHandler(async (req, res) => {
  const routes = await Bus.find().select("route").lean();
  if (!routes) {
    return res.sendStatus(404);
  }
  if (!routes.length) {
    return res.sendStatus(204);
  }
  const cities = [];
  routes.forEach((route) => {
    route.route.forEach((obj) => {
      if (!cities.includes(obj.city)) {
        cities.push(obj.city);
      }
    });
  });

  res.json(cities);
});

module.exports = getAllCities;
