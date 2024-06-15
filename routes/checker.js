const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  getCheckers,
  addChecker,
  deleteChecker,
} = require("../controllers/checkerController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
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

router.get("/", getCheckers);
router.post("/", upload.single("image"), addChecker);
router.delete("/:id", deleteChecker);

module.exports = router;
