import API from './api/index.js';
import Provider from './api/provider.js';
import Store from "./api/store.js";
import Route from './components/route.js';
import Menu, {MenuItem} from './components/menu.js';
import Statistics from './components/statistics.js';
import PriceController from './controllers/price-controller.js';
import FilterController from './controllers/filter-controller.js';
import TripController from './controllers/trip-controller.js';
import PointsModel from './models/points.js';
import {RenderPosition, render, createElement} from './utils/render.js';
import {getDestinationsInfo, getOffersInfo, getCitiesList} from './const.js';


const AUTHORIZATION = `Basic dXNlckBwYXNzd29yZAo=`;
const END_POINT = `https://htmlacademy-es-10.appspot.com/big-trip`;
const LOADING_LIST_PRELOADER = createElement(`<p class="trip-events__msg">Loading...</p>`);
const STORE_PREFIX = `big-trip-localstorage`;
const STORE_VER = `v1`;
const STORE_NAME = `${STORE_PREFIX}-${STORE_VER}`;

const header = document.querySelector(`.page-header`);
const tripInfo = header.querySelector(`.trip-main__trip-info`);
const addPointButton = header.querySelector(`.trip-main__event-add-btn`);

const tripControlHeaders = header.querySelectorAll(`.trip-main__trip-controls h2`);
const tripEventsContainer = document.querySelector(`.trip-events`);

const showListPreloader = ()=> {
  tripEventsContainer.prepend(LOADING_LIST_PRELOADER);
  addPointButton.setAttribute(`disabled`, `disabled`);
};
const hideListPreloader = ()=> {
  LOADING_LIST_PRELOADER.remove();
  addPointButton.removeAttribute(`disabled`);
};

showListPreloader();

tripEventsContainer.prepend(LOADING_LIST_PRELOADER);

const api = new API(END_POINT, AUTHORIZATION);
const store = new Store(STORE_NAME, window.localStorage);
const apiWithProvider = new Provider(api, store);

const menuComponent = new Menu();
render(tripControlHeaders[0], menuComponent.getElement(), RenderPosition.AFTEREND);

addPointButton.addEventListener(`click`, () => {
  tripControllerComponent.createPoint();
});


const pointsModel = new PointsModel();

const renderPriceData = ()=> {
  const priceController = new PriceController(tripInfo, pointsModel);
  priceController.render();
};

const renderFiltesrData = ()=> {
  const filterController = new FilterController(tripControlHeaders[1], pointsModel);
  filterController.render();
};


const tripControllerComponent = new TripController(tripEventsContainer, pointsModel, apiWithProvider);

let statisticsComponent = new Statistics(pointsModel, pointsModel.getPointsAll());

const redrawStatistics = () => {

  statisticsComponent = new Statistics(pointsModel, pointsModel.getPointsAll());
  render(tripEventsContainer, statisticsComponent.getElement(), RenderPosition.AFTEREND);
};

const renderBriefRouteProgram = (data) => {
  const routeComponent = new Route(data);
  render(tripInfo, routeComponent.getElement(), RenderPosition.AFTERBEGIN);
};


statisticsComponent.hide();


menuComponent.setOnChange((menuItem) => {

  switch (menuItem) {
    case MenuItem.TABLE:
      menuComponent.setActiveItem(MenuItem.TABLE);
      statisticsComponent.hide();
      tripControllerComponent.show();
      break;
    case MenuItem.STATS:
      menuComponent.setActiveItem(MenuItem.STATS);
      tripControllerComponent.hide();
      redrawStatistics();
      statisticsComponent.show();
      break;

  }
});


const getPoints = new Promise((res) => {
  apiWithProvider.getPoints().then((points) => {
    pointsModel.setPoints(points);
    renderBriefRouteProgram(points);
    renderPriceData();
    renderFiltesrData();
    res();
  });
});


const getDestinations = new Promise((res) => {
  apiWithProvider.getDestinations().then((destinations) => {
    getDestinationsInfo(destinations);
    getCitiesList(destinations);
    res();
  });
});

const getOffers = new Promise((res) => {
  apiWithProvider.getOffers().then((offers) => {
    getOffersInfo(offers);
    res();
  });
});


Promise.all([getPoints, getDestinations, getOffers])
  .then(()=> {
    tripControllerComponent.render();
    hideListPreloader();
  });


window.addEventListener(`load`, ()=>{
  navigator.serviceWorker.register(`/sw.js`);
});

window.addEventListener(`online`, () => {
  document.title = document.title.replace(` [offline]`, ``);
  apiWithProvider.sync();
});

window.addEventListener(`offline`, () => {
  document.title += ` [offline]`;
});
