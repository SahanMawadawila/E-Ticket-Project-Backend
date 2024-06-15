const asyncHandler = require("express-async-handler");
const Bus = require("../model/Bus");

const getAllBusCompanies = asyncHandler(async (req, res) => {
  const busCompanies = await Bus.find().select("busName").lean();

  if (!busCompanies) {
    return res.sendStatus(404);
  }
  if (!busCompanies.length) {
    return res.sendStatus(204);
  }

  const companies = [];
  busCompanies.forEach((company) => {
    if (!companies.includes(company.busName)) {
      companies.push(company.busName);
    }
  });

  res.json(companies);
});

module.exports = getAllBusCompanies;
