const express = require("express");
const router = express.Router();

const getAllAuthBusesController = require("../../controllers/getAllAuthBusesController");

router.post("/", getAllAuthBusesController);

module.exports = router;
