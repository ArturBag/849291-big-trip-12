import Point from "../models/point.js";

const Method = {
  GET: `GET`,
  POST: `POST`,
  PUT: `PUT`,
  DELETE: `DELETE`
};

const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

};

const API = class {
  constructor(endPoint, authorization) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  getDestinations() {

    return this._load({
      url: `destinations`
    })
    .then((response)=> response.json());
  }

  getOffers() {

    const headers = new Headers();
    headers.append(`Authorization`, this._authorization);

    return fetch(`https://htmlacademy-es-10.appspot.com/big-trip/offers`, {headers})
    .then(checkStatus)
    .then((response)=> response.json());
  }


  getPoints() {

    return this._load({
      url: `points`,
    })
    .then((response)=> response.json())
    .then(Point.parsePoints);

  }


  updatePoint(id, data) {

    return this._load({
      url: `points/${id}`,
      method: Method.PUT,
      body: JSON.stringify(Point.toRAW(data)),
      headers: new Headers({"Content-Type": `application/json`})
    })
    .then((response)=> response.json())
    .then(Point.parsePoint);

  }

  deletePoint(id) {
    return this._load({url: `points/${id}`, method: Method.DELETE});
  }

  createPoint(point) {

    return this._load({
      url: `points`,
      method: Method.POST,
      body: JSON.stringify(Point.toRAW(point)),
      headers: new Headers({"Content-Type": `application/json`})
    })
    .then((response)=> response.json())
    .then(Point.parsePoint);

  }

  sync(data) {
    return this._load({
      url: `points/sync`,
      method: Method.POST,
      body: JSON.stringify(data),
      headers: new Headers({"Content-Type": `application/json`})
    })
    .then((response)=> response.json());
  }

  _load({url, method = Method.GET, body = null, headers = new Headers()}) {
    headers.append(`Authorization`, this._authorization);

    return fetch(`${this._endPoint}/${url}`, {method, body, headers})
    .then(checkStatus)
    .catch((err)=>{
      throw new Error(err);
    });
  }
};

export default API;
