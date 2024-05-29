const express = require("express");
const router = express.Router();

const { search } = require("../controllers/searchController");

router.post("/", search);

module.exports = router;
