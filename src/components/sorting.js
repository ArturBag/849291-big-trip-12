import AbstractComponent from './abstract-component.js';

export const SortType = {
  EVENT: `event`,
  TIME: `time-down`,
  PRICE: `price-down`,
};

export default class Sorting extends AbstractComponent {
  constructor() {
    super();

    this._currenSortType = SortType.EVENT;
  }

  sortTypeChangeHandler(handler) {
    this.getElement().addEventListener(`change`, (evt) => {
      evt.preventDefault();

      if (evt.target.tagName !== `INPUT`) {
        return;
      }

      const sortType = evt.target.dataset.sortType;

      if (this._currenSortType === sortType) {
        return;
      }

      this._currenSortType = sortType;

      handler(this._currenSortType);

    });

  }

  getTemplate() {

    return `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
          <span class="trip-sort__item  trip-sort__item--day">Day</span>

          <div class="trip-sort__item  trip-sort__item--event">
            <input id="sort-event" data-sort-type="${SortType.EVENT}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-event" checked>
            <label class="trip-sort__btn" for="sort-event">Event</label>
          </div>

          <div class="trip-sort__item  trip-sort__item--time">
            <input id="sort-time" data-sort-type="${SortType.TIME}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-time">
            <label class="trip-sort__btn" for="sort-time">
              Time
              <svg class="trip-sort__direction-icon" width="8" height="10" viewBox="0 0 8 10">
                <path d="M2.888 4.852V9.694H5.588V4.852L7.91 5.068L4.238 0.00999987L0.548 5.068L2.888 4.852Z"/>
              </svg>
            </label>
          </div>

        <div class="trip-sort__item  trip-sort__item--price">
          <input id="sort-price" data-sort-type="${SortType.PRICE}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-price">
          <label class="trip-sort__btn" for="sort-price">
            Price
            <svg class="trip-sort__direction-icon" width="8" height="10" viewBox="0 0 8 10">
              <path d="M2.888 4.852V9.694H5.588V4.852L7.91 5.068L4.238 0.00999987L0.548 5.068L2.888 4.852Z"/>
            </svg>
          </label>
        </div>

        <span class="trip-sort__item  trip-sort__item--offers">Offers</span>
      </form>`;
  }

}
