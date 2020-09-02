import AbstractComponent from './abstract-component.js';
import {getPrefix, getFormattedTime, getTimeDiff, turnFirstLetterToCapital} from '../utils/common.js';
import {OFFERS, MONTH_NAMES} from '../const.js';

const MAX_OFFERS_QTY_TO_SHOW = 3;

export default class TripDay extends AbstractComponent {
  constructor(route, routeIndex) {

    super();

    this._route = route;
    this._routeIndex = routeIndex;

    this._setClickHandler = null;

  }

  setClickHandler(handler) {
    this.getElement().querySelector(`.event__rollup-btn`).addEventListener(`click`, handler);
    this._setClickHandler = handler;
  }

  getTemplate() {

    const {travelType, city, price, date, startDate, endDate} = this._route;

    const type = turnFirstLetterToCapital(travelType);

    const icon = `img/icons/${travelType.toLowerCase()}.png`;
    const dayCounter = date ? this._routeIndex + 1 : 0;
    const prefix = getPrefix(travelType);

    const startTime = getFormattedTime(startDate);
    const endTime = getFormattedTime(endDate);

    const duration = getTimeDiff(endDate - startDate);
    const monthName = date ? MONTH_NAMES.get(date.month) : ``;

    const options = OFFERS.filter((it)=> it.type === travelType.toLowerCase())[0];

    let offers = [];
    let optionsInfo = ``;

    if (options.offers.length < 1) {
      offers = [];
    } else {

      offers = options.offers.length > 3 ?
        options.offers.slice(0, MAX_OFFERS_QTY_TO_SHOW) : options.offers;

      optionsInfo = offers.map((it) => {

        return `<li class="event__offer">
          <span class="event__offer-title">${it.title}</span>
          &plus;
          &euro;&nbsp;<span class="event__offer-price">${it.price}</span>
          </li>`;

      }).join(` \n`);
    }

    return `<li class="trip-days__item  day">
     <div class="day__info">
     ${date ?
    `<span class="day__counter">${dayCounter}</span>
      <time class="day__date" datetime="2019-03-18">${monthName} ${date.day}</time>` : ``
}
     </div>

      <ul class="trip-events__list">
        <li class="trip-events__item">
          <div class="event">
            <div class="event__type">
              <img class="event__type-icon" width="42" height="42" src="${icon}" alt="Event type icon">
            </div>
            <h3 class="event__title">${type} ${prefix} ${city}</h3>

            <div class="event__schedule">
              <p class="event__time">
                <time class="event__start-time" datetime="2019-03-18T10:30">${startTime}</time>
                &mdash;
                <time class="event__end-time" datetime="2019-03-18T11:00">${endTime}</time>
              </p>
              <p class="event__duration">${duration}</p>
            </div>

            <p class="event__price">
              &euro;&nbsp;<span class="event__price-value">${price}</span>
            </p>

            <h4 class="visually-hidden">Offers:</h4>
            <ul class="event__selected-offers">
              ${optionsInfo}
            </ul>

            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </div>
        </li>
        </ul>
       </li>`;

  }
}
