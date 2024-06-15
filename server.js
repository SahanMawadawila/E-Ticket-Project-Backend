require("dotenv").config();
const { logger } = require("./middleware/logEvents");
const errorHandle = require("./middleware/errorHandle");
const express = require("express");
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbconn");
const mongoose = require("mongoose");
const { task1 } = require("./jobs/DailyJob");

// Start the cron job
task1.start();

const PORT = process.env.PORT || 3200;
const app = express();

connectDB();
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/bus", express.static(path.join(__dirname, "uploads")));

app.use("/", require("./routes/root"));
app.use("/auth/checker", require("./routes/authChecker"));
app.use("/auth/admin", require("./routes/authAdmin"));
app.use("/bus", require("./routes/bus"));
app.use("/cities", require("./routes/api/getAllCities"));
app.use("/search", require("./routes/search"));
app.use("/booking", require("./routes/booking"));
app.use("/companies", require("./routes/api/getAllBusComapnies"));
app.use("/checkers", require("./routes/checker"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "Page not found" });
  } else {
    res.type("txt").send("Page not found");
  }
});

app.use(errorHandle);

mongoose.connection.once("open", () => {
  console.log("Database connected");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
