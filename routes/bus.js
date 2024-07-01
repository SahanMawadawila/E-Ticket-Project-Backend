const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  addBus,
  getBuses,
  getBus,
  deleteBus,
} = require("../controllers/busController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads/busses"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

router
  .post("/", upload.array("images", 4), (req, res, next) => {
    const totalSize = req.files.reduce((total, file) => total + file.size, 0);
    if (totalSize > 5 * 1024 * 1024) {
      return res.status(413).json({ message: "payload too large" });
    }
    addBus(req, res, next);
  })
  .get("/", getBuses)
  .get("/:id", getBus)
  .delete("/:id", deleteBus);

module.exports = router;
