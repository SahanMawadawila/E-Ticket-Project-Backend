const { format } = require("date-fns");
const { v4: uuid } = require("uuid");

const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const logEvents = async (message, logName) => {
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const id = uuid();
  const logMessage = `${timestamp} [${id}] ${message}\n`;

  try {
    //check if the file exists.if not create it
    const logDir = path.join(__dirname, "..", "logs"); //.. used to go back one directory
    if (!fs.existsSync(logDir)) {
      await fsPromises.mkdir(logDir);
    }
    await fsPromises.appendFile(path.join(logDir, logName), logMessage);
  } catch (error) {
    console.error(error);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logger, logEvents };
