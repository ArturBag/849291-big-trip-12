import NoRoutePoints from '../components/no-route-points.js';
import Sorting, {SortType} from '../components/sorting.js';
import TripDaysList from '../components/trip-days-list.js';
import FilterController from './filter-controller.js';
import PointController, {Mode as PointControllerMode, EmptyPoint} from './point-controller.js';
import {render, RenderPosition} from '../utils/render.js';
import {DEFAULT_SORTING_TYPE} from '../const.js';

const HIDDEN_CLASS = `visually-hidden`;

const getDates = (events)=> {
  const set = new Set();
  events.forEach((evt)=> set.add(JSON.stringify(
      {
        day: evt.startDate.getDate(),
        month: evt.startDate.getMonth() + 1
      }
  )));
  return Array.from(set).map((evt) => JSON.parse(evt));

};

export const getDefaultEvents = (events) => {
  let newData = [];
  const routeData = events.map((it) => Object.assign({}, it));
  const dates = getDates(routeData).sort((a, b) => a.day - b.day);

  dates.forEach((date) => {
    const dayEvents = routeData
  .filter((event)=> event.startDate.getDate() === date.day)
  .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    dayEvents[0].date = date;
    newData = [...newData, ...dayEvents];

  });

  return newData;

};


const renderTripPoints = (tripDaysListComponent, routeItems, onDataChange, onViewChange) => {

  return routeItems.map((route, routeIndex) => {

    const pointController = new PointController(tripDaysListComponent, onDataChange, onViewChange);

    pointController.render(route, routeIndex, PointControllerMode.DEFAULT);
    return pointController;

  });

};


export default class TripController {
  constructor(container, pointsModel, api, filtersContainer) {

    this._pointsModel = pointsModel;
    this._container = container;
    this._filtersContainer = filtersContainer;
    this._api = api;


    this._showedPointControllers = [];
    this._showingPointsCount = null;
    this._creatingPoint = null;

    this._filterController = new FilterController(this._filtersContainer);

    this._noRoutePoints = new NoRoutePoints();

    this._sorting = new Sorting();
    this._tripDaysList = new TripDaysList();

    this._showedPointControllers = [];

    this._onDataChange = this._onDataChange.bind(this);
    this._onViewChange = this._onViewChange.bind(this);
    this._onSortTypeChange = this._onSortTypeChange.bind(this);
    this._onFilterChange = this._onFilterChange.bind(this);

    this._activeSortType = SortType.EVENT;

    this._sorting.sortTypeChangeHandler(this._onSortTypeChange);
    this._pointsModel.setFilterChangeHandler(this._onFilterChange);

  }

  hide() {
    this._container.classList.add(HIDDEN_CLASS);
  }

  show() {
    this._container.classList.remove(HIDDEN_CLASS);
  }

  render() {


    const pointsData = getDefaultEvents(this._pointsModel.getPoints());

    const container = this._container;
    const tripDaysListElement = this._tripDaysList.getElement();
    const sortingList = this._sorting.getElement();
    const noRoutePointsNode = this._noRoutePoints.getElement();


    if (!pointsData.length) {
      render(container, noRoutePointsNode, RenderPosition.BEFOREEND);

    } else {
      render(container.children[0], sortingList, RenderPosition.AFTEREND);
      render(sortingList, tripDaysListElement, RenderPosition.AFTEREND);

    }

    const newTripPoints = renderTripPoints(tripDaysListElement, pointsData, this._onDataChange, this._onViewChange);

    this._showedPointControllers = newTripPoints;

  }

  renderFilters() {
    this._filterController.render(this._pointsModel);
  }

  createPoint() {


    if (this._creatingPoint) {
      return;
    }

    this._showedPointControllers.forEach((it)=> {
      it.setDefaultView();
    });
    const tripDaysListElement = this._tripDaysList.getElement();


    const index = this._showedPointControllers.length;
    const pointsQty = this._showedPointControllers.length;

    this._creatingPoint = new PointController(tripDaysListElement, this._onDataChange, this._onViewChange);
    this._creatingPoint.render(EmptyPoint, index, PointControllerMode.ADDING, pointsQty);

  }

  _destroyCreatingPoint() {
    this._creatingPoint.destroy();
    this._creatingPoint = null;
  }


  _removePoints() {
    this._showedPointControllers.forEach((pointController) => pointController.destroy());
    this._showedPointControllers = [];
  }

  _renderPoints(points) {
    const tripDaysListElement = this._tripDaysList.getElement();
    const newTripPoints = renderTripPoints(tripDaysListElement, points, this._onDataChange, this._onViewChange);
    this._showedPointControllers = this._showedPointControllers.concat(newTripPoints);

  }

  _updatePoints() {
    this._removePoints();

    const points = getDefaultEvents(this._pointsModel.getPoints().slice());

    this._renderPoints(points);
  }

  _onViewChange() {
    if (this._creatingPoint) {

      this._destroyCreatingPoint();
    }

    this._showedPointControllers.forEach((it) => it.setDefaultView());

  }

  _onDataChange(pointController, oldData, newData, shouldRender) {

    if (oldData === EmptyPoint) {
      this._creatingPoint = null;
      if (newData === null) {
        pointController.destroy();

        this._updatePoints();

      } else {

        this._api.createPoint(newData)
        .then((parsedResponseData)=> {
          this._pointsModel.addPoint(parsedResponseData);

          const index = this._showedPointControllers.length;

          pointController.render(parsedResponseData, index, PointControllerMode.DEFAULT);
          this._showedPointControllers = [].concat(pointController, this._showedPointControllers);
          this._onSortTypeChange(this._sorting._currenSortType);
          pointController.removeFlatpickr();
          this.renderFilters();
        })
        .catch(()=>{
          pointController.showStyledServerError();
        });

      }
    } else if (newData === null) {

      this._api.deletePoint(oldData.id)
      .then(()=> {
        this._pointsModel.removePoint(oldData.id);
        this._updatePoints();
        pointController.removeFlatpickr();
        this.renderFilters();
      })
      .catch(()=>{
        pointController.showStyledServerError();
      });

    } else {

      this._api.updatePoint(oldData.id, newData)
      .then((response)=> {

        return response;
      })
      .then((parsedResponseData)=> {

        const isSuccess = this._pointsModel.updatePoint(oldData.id, parsedResponseData);
        const index = this._showedPointControllers.findIndex((it)=> it === pointController);

        if (isSuccess && shouldRender) {

          pointController.render(parsedResponseData, index, PointControllerMode.DEFAULT);
          this._onSortTypeChange(this._sorting._currenSortType);
          pointController.removeFlatpickr();
          this.renderFilters();
        }
      })
      .catch(()=>{
        pointController.showStyledServerError();
      });

    }

  }

  setDefaultSortType(defaultSortType) {

    this._sorting.getElement().querySelectorAll(`input`)[0].checked = true;
    this._sorting.resetSortingToDefault();

    this._onSortTypeChange(defaultSortType);
  }

  _onSortTypeChange(sortType) {

    const tripDaysListElement = this._tripDaysList.getElement();
    this._activeSortType = sortType;

    let pointsData = this._pointsModel.getPoints();


    switch (sortType) {

      case SortType.EVENT:

        pointsData = getDefaultEvents(pointsData.slice());
        break;
      case SortType.TIME:

        pointsData.sort((a, b) => (b.endDate - b.startDate) - (a.endDate - a.startDate));
        break;
      case SortType.PRICE:

        pointsData.sort((a, b) => b.price - a.price);
        break;
    }

    if (this._creatingPoint) {
      this._destroyCreatingPoint();
    }

    tripDaysListElement.innerHTML = ``;
    const newTripPoints = renderTripPoints(tripDaysListElement, pointsData, this._onDataChange, this._onViewChange);
    this._showedPointControllers = newTripPoints;

  }

  _onFilterChange() {
    this._updatePoints();
    this.setDefaultSortType(DEFAULT_SORTING_TYPE);
  }


}
