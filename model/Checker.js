const mongoose = require("mongoose");

const checkerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  companyName: {
    type: String,
  },
  telephone: {
    type: String,
  },
  url: {
    type: String,
  },
});

module.exports = mongoose.model("Checker", checkerSchema);
