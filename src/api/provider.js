import Point from "../models/point.js";

const isOnline = () => {
  return window.navigator.onLine;
};

const getSyncedPoints = (items)=> {

  return items.filter(({success})=> success)
    .map(({payload})=> payload.point);
};

const createStoreStructure = (items)=> {
  return items.reduce((acc, current)=> {
    return Object.assign({}, acc, {
      [current.id]: current
    });
  }, {});
};


export default class Provider {
  constructor(api, store) {
    this._api = api;
    this._store = store;

  }

  getDestinations() {
    if (isOnline()) {
      return this._api.getDestinations()
      .then((destinationsData)=> {

        this._store.setItems(`destinations`, destinationsData);

        return destinationsData;
      });

    }

    const storeDestinationsData = this._store.getItems().destinations;

    return Promise.resolve(storeDestinationsData);
  }


  getOffers() {
    if (isOnline()) {

      return this._api.getOffers()
      .then((offers)=> {
        this._store.setItems(`offers`, offers);

        return offers;
      });

    }

    const storeOffersData = this._store.getItems().offers;

    return Promise.resolve(storeOffersData);
  }

  getPoints() {

    if (isOnline()) {


      return this._api.getPoints()
      .then((points)=> {
        const storePointsData = points.map((point)=> Point.toRAW(point));
        this._store.setItems(`points`, storePointsData);

        return points;
      });
    }


    const storePointsData = Object.values(this._store.getItems().points);


    return Promise.resolve(Point.parsePoints(storePointsData));


  }


  createPoint(data) {
    if (isOnline()) {
      return this._api.createPoint(data)
        .then((newPoint)=> {
          this._store.setItem(newPoint.id, Point.toRAW(newPoint));

          return newPoint;
        });
    }


    this._store.setItem(data.id, Point.toRAW(data));

    return Promise.resolve(data);
  }


  updatePoint(id, data) {
    if (isOnline()) {
      return this._api.updatePoint(id, data)
        .then((newPoints)=> newPoints);
    }


    this._store.setItem(id, Point.toRAW(data));

    return Promise.resolve(data);
  }

  deletePoint(id) {
    if (isOnline()) {
      return this._api.deletePoint(id)
        .then((newPoints)=> newPoints);
    }

    this._store.removeItem(id);
    const newStorePoints = this._store.getItems().points;

    return Promise.resolve(newStorePoints);
  }

  sync() {
    if (isOnline()) {

      const storePoints = this._store.getItems().points;

      return this._api.sync(storePoints)
        .then((response) => {

          const createdPoits = getSyncedPoints(response.created);
          const updatedPoits = getSyncedPoints(response.updated);

          const items = createStoreStructure([...createdPoits, ...updatedPoits]);

          this._store.setItems(`points`, items);
        });
    }

    return Promise.reject(new Error(`Sync data failed`));
  }

}
