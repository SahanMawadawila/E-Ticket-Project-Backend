const express = require("express");
const router = express.Router();

const getAllBusCompanies = require("../../controllers/getAllBusCompaniesController");

router.get("/", getAllBusCompanies);

module.exports = router;
