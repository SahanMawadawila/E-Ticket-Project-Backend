const dayjs = require("dayjs");

const weekdayOrWeekendFinder = (date) => {
  const dayOfWeek = dayjs(date).day();
  switch (dayOfWeek) {
    case 0:
      return "sunday";
    case 6:
      return "saturday";
    default:
      return "weekDays";
  }
};

module.exports = weekdayOrWeekendFinder;
