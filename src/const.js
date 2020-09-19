export const DESTINATION_INFO = [];
export const DEFAULT_SORTING_TYPE = `event`;

export const getDestinationsInfo = (data) => {
  data.forEach((it)=> {
    DESTINATION_INFO.push({
      name: it.name,
      description: it.description,
      pictures: it.pictures
    });

  });
};

export const OFFERS = [];

export const getOffersInfo = (data) => {
  data.forEach((it)=> {
    OFFERS.push({
      type: it.type,
      offers: it.offers
    });

  });
};

export const getCitiesList = (data) => {
  const citiesSet = new Set();
  data.forEach((it)=> citiesSet.add(it.name));
  Array.from(citiesSet).forEach((city)=> CITIES.push(city));

};


export const CITIES = [];


export const MONTH_NAMES = new Map([
  [1, `JAN`],
  [2, `FEB`],
  [3, `MAR`],
  [4, `APR`],
  [5, `MAY`],
  [6, `JUN`],
  [7, `JUL`],
  [8, `AUG`],
  [9, `SEP`],
  [10, `OCT`],
  [11, `NOV`],
  [12, `DEC`],
]);


export const filterTypes = {

  'filter-everything': {
    'name': `Everything`,
    'isChecked': true
  },
  'filter-future': {
    'name': `Future`,
    'isChecked': false
  },
  'filter-past': {
    'name': `Past`,
    'isChecked': false
  }
};
