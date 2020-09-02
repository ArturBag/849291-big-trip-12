import moment from "moment";


const STOP_EVENTS = [`Check-in`, `Sightseeing`, `Restaurant`];

export const getPrefix = (travelType)=> {

  const prefix = STOP_EVENTS.some((it)=> it === travelType) ? `in` : `to`;

  return prefix;
};


export const getFormattedTime = (date, withDay = false) => {
  return withDay ? moment(date).format(`D/M/YY`) : moment(date).format(`HH:mm`);
};

export const getTimeDiff = (time) => {
  const duration = moment.duration(time);
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  return `${days > 0 ? days + `D` : ``} ${hours > 0 ? hours + `H` : ``} ${minutes > 0 ? minutes + `M` : ``}`;
};

export const getTimeDiffinHours = (time) => {
  const duration = moment.duration(time);

  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();

  const timeInHoursFormat = days * 24 + hours + (minutes > 30 ? 1 : 0.5);

  return timeInHoursFormat;
};

export const turnFirstLetterToCapital = (word) =>
  word.charAt(0).toUpperCase() + word.substr(1);

