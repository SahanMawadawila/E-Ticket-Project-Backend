function convertTimeToFloat(timeString) {
  const floatTimeString = timeString.replace(":", ".");
  return parseFloat(floatTimeString);
}

module.exports = convertTimeToFloat;
