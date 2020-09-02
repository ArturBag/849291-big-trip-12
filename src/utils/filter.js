import {filterTypes} from '../const.js';

export const getFutureRoutePoints = (nowDate, points) => {

  return points.filter((it) => {
    return it.startDate > nowDate;
  });
};

export const gePastRoutePoints = (nowDate, points) => {

  return points.filter((it) => {
    return it.startDate < nowDate;
  });
};

export const getPointsByFilter = (points, filterType) => {
  const nowDate = new Date();
  switch (filterType) {
    case filterTypes[`filter-everything`].name:
      return points;

    case filterTypes[`filter-past`].name:
      return gePastRoutePoints(nowDate, points);

    case filterTypes[`filter-future`].name:
      return getFutureRoutePoints(nowDate, points);
  }
  return points;
};
