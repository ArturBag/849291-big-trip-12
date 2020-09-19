import AbstractComponent from './abstract-component.js';

export default class Filters extends AbstractComponent {
  constructor(filters, pointsModel) {
    super();

    this.filters = filters;
    this._setFilterChangeHandler = null;
    this._pointsModel = pointsModel;
  }


  setFilterChangeHandler(handler) {
    this.getElement().addEventListener(`change`, handler);
    this._setFilterChangeHandler = handler;
  }


  getTemplate() {

    const filterTabs = this.filters.map((it) => {

      const isChecked = it.checked ? `checked` : ``;
      const isDisabled = it.disabled ? `disabled` : ``;

      return `<div class="trip-filters__filter">
          <input id="${it.id}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="${it.name.toLowerCase()}" ${isChecked}
          ${isDisabled}>
          <label class="trip-filters__filter-label" for="${it.id}">${it.name}</label>
          </div>`;
    }).join(``);


    return `<form class="trip-filters" action="#" method="get">${filterTabs}</form>`;

  }

}
