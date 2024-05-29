const express = require("express");
const router = express.Router();

const getAllCities = require("../../controllers/getAllCitiesController");

router.get("/", getAllCities);

module.exports = router;
