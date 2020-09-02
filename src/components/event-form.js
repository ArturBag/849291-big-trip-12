import AbstractSmartComponent from './abstract-smart-component.js';
import {getPrefix, turnFirstLetterToCapital} from '../utils/common.js';
import {Mode as PointControllerMode} from '../controllers/point-controller.js';
import {OFFERS, DESTINATION_INFO, CITIES} from '../const.js';

import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import 'flatpickr/dist/themes/light.css';

const DefaultData = {
  deleteButtonText: `Delete`,
  cancelButtonText: `Cancel`,
  saveButtonText: `Save`,
};

const parseFormData = (formData, form, mode, id) => {

  const travelType = form.querySelector(`.event__type-toggle`).dataset.travelType;
  const city = formData.get(`event-destination`);
  const destinationName = city;
  const destinationDescription = form.querySelector(`.event__destination-description`).innerText;
  const destinationPicturesData = form.querySelectorAll(`.event__photo`);
  const pictures = Array.from(destinationPicturesData).map((it)=> {
    return {
      'src': it.src,
      'description': it.alt
    };
  });

  const price = parseInt(formData.get(`event-price`), 10);
  const startDate = flatpickr.parseDate(formData.get(`event-start-time`), `d/m/y H:i`);
  const endDate = flatpickr.parseDate(formData.get(`event-end-time`), `d/m/y H:i`);

  const chosedOffersForm = [...form.querySelectorAll(`.event__offer-checkbox:checked`)];
  const offersByType = OFFERS.filter((it)=> it.type === travelType.toLowerCase())[0][`offers`];
  let checkedOffers = [];


  if (chosedOffersForm.length === 0) {
    checkedOffers = [];
  } else {
    checkedOffers = offersByType.filter((offer) => chosedOffersForm.some((formOffer) => offer.title === formOffer.name));
  }

  let isFavorite = false;
  if (mode === PointControllerMode.ADDING) {
    isFavorite = false;
  } else {
    isFavorite = form.querySelector(`.event__favorite-checkbox`).checked;
  }

  return {
    id,
    travelType,
    city,
    destination: {
      name: destinationName,
      description: destinationDescription,
      pictures
    },
    price,
    startDate,
    endDate,
    isFavorite,
    includedOffers: checkedOffers
  };
};


export default class EventForm extends AbstractSmartComponent {
  constructor(route, mode) {
    super();

    this._routeData = route;
    this._mode = mode;

    this._id = route.id;
    this._travelType = route.travelType;
    this._prefix = getPrefix(this._travelType);
    this._icon = `img/icons/${this._travelType.toLowerCase()}.png`;
    this._city = route.city;
    this._isFavorite = route.isFavorite;
    this._price = route.price;
    this._includedOffers = route.includedOffers;

    this._externalData = DefaultData;

    this._iconForReset = `img/icons/${route.travelType.toLowerCase()}.png`;
    this._prefixForReset = getPrefix(route.travelType);

    this._isDestinationCityChosed = true;

    this._favoriteHandler = null;
    this._closeFormHandler = null;
    this._submitHandler = null;
    this._resetButtonClickHandler = null;

    this._subscribeOnEvents();

    this._flatpickrStart = null;
    this._flatpickrEnd = null;
    this._applyFlatpickr();
  }

  recoveryListeners() {
    this.setCloseFormHandler(this._closeFormHandler);
    this.setFavoritesHandler(this._favoriteHandler);
    this.setSubmitHandler(this._submitHandler);
    this.setResetButtonClickHandler(this._resetButtonClickHandler);

    this._subscribeOnEvents();
  }

  removeFlatpickr() {
    if (this._flatpickrStart && this._flatpickrEnd) {
      this._flatpickrStart.destroy();
      this._flatpickrEnd.destroy();
      this._flatpickrStart = null;
      this._flatpickrEnd = null;
    }
  }

  removeElement() {
    this.removeFlatpickr();
    super.removeElement();
  }

  rerender() {
    super.rerender();
    this._applyFlatpickr();
  }

  getData() {
    const form = this.getElement();
    const formData = new FormData(form);
    return parseFormData(formData, form, this._mode, this._id);
  }

  disableFormData() {
    const form = this.getElement();
    Array.from(form).forEach((it)=> it.setAttribute(`disabled`, `disabled`));
  }

  reset() {
    this._travelType = this._routeData.travelType;
    this._prefix = this._prefixForReset;
    this._icon = this._iconForReset;
    this._city = this._routeData.city;
    this._price = this._routeData.price;
    this._isFavorite = this._routeData.isFavorite;

    this.rerender();
  }

  setData(data) {
    this._externalData = Object.assign({}, DefaultData, data);
    this.rerender();
  }

  _applyFlatpickr() {
    this.removeFlatpickr();

    const self = this;
    const startDateElement = this.getElement().querySelector(`#event-start-time-1`);
    const endDateElement = this.getElement().querySelector(`#event-end-time-1`);
    this._flatpickrStart = flatpickr(startDateElement, {
      allowInput: true,
      enableTime: true,
      dateFormat: `d/m/y H:i`,
      defaultDate: this._routeData.startDate || `today`,
      minDate: this._routeData.startDate || `today`,
      onChange(selectedDates) {
        if (self._flatpickrEnd.config._minDate < selectedDates[0]) {
          self._flatpickrEnd.setDate(selectedDates[0], false, `d/m/y H:i`);
        }
        self._flatpickrEnd.set(`minDate`, selectedDates[0]);
      }
    });

    this._flatpickrEnd = flatpickr(endDateElement, {
      allowInput: true,
      enableTime: true,
      dateFormat: `d/m/y H:i`,
      defaultDate: this._routeData.endDate || `today`,
      minDate: this._routeData.endDate || `today`,
      onChange(selectedDates) {
        self._flatpickrStart.set(`maxDate`, selectedDates[0]);
      },
    });
  }

  setFavoritesHandler(handler) {
    if (this._mode === PointControllerMode.ADDING) {
      return;
    }

    this.getElement().querySelector(`.event__favorite-btn`)
      .addEventListener(`click`, () => {
        this._isFavorite = !this._isFavorite;
        handler(this._isFavorite);
      });
    this._favoriteHandler = handler;
  }

  setResetButtonClickHandler(handler) {
    this.getElement().querySelector(`.event__reset-btn`)
      .addEventListener(`click`, ()=>{
        handler(this._mode);
      });

    this._resetButtonClickHandler = handler;
  }

  setCloseFormHandler(handler) {
    if (this._mode === PointControllerMode.ADDING) {
      return;
    }
    this.getElement().querySelector(`.event__rollup-btn`)
      .addEventListener(`click`, handler);
    this._closeFormHandler = handler;
  }

  setSubmitHandler(handler) {
    this.getElement().addEventListener(`submit`, handler);
    this._submitHandler = handler;
  }


  _subscribeOnEvents() {
    const eventTypes = this.getElement().querySelectorAll(`.event__type-item`);
    const cityInput = this.getElement().querySelector(`.event__input--destination`);
    const price = this.getElement().querySelector(`#event-price-1`);
    const submitBtn = this.getElement().querySelector(`.event__save-btn`);
    if (this._isDestinationCityChosed && this._price) {
      submitBtn.removeAttribute(`disabled`);
    } else {
      submitBtn.setAttribute(`disabled`, ``);
    }

    eventTypes.forEach((it) => {
      it.addEventListener(`change`, () => {
        const chosedEventTypeValue = it.querySelector(`input`).value;

        this._travelType = turnFirstLetterToCapital(chosedEventTypeValue).trim();

        this.rerender();

      });

    });

    cityInput.addEventListener(`change`, (evt) => {

      this._city = evt.target.value;
      if (this._city) {
        this._isDestinationCityChosed = true;
      }
      this.rerender();

    });

    price.addEventListener(`change`, (evt)=>{
      this._price = parseInt(evt.target.value, 10);
      this.rerender();
    });


  }

  getTemplate() {


    if (this._mode === PointControllerMode.ADDING && this._city.length < 1) {
      this._isDestinationCityChosed = false;
    }

    const lowerCaseType = this._travelType.toLowerCase();

    this._prefix = getPrefix(this._travelType);
    this._icon = `img/icons/${lowerCaseType}.png`;
    const price = isNaN(this._price) ? 0 : this._price;

    const firstEmptyOption = `<option value="" "selected">.    .     .</option>`;

    const isFavoriteChecked = this._isFavorite ? `checked` : ``;

    const submitButtonText = this._externalData.saveButtonText;
    const resetButtonText = this._mode === PointControllerMode.ADDING ? this._externalData.cancelButtonText
      : this._externalData.deleteButtonText;
    const isCloseFormButtonDisplayed = this._mode === PointControllerMode.ADDING ? false : true;
    const isFavoriteButtonDisplayed = this._mode === PointControllerMode.ADDING ? false : true;

    const dataTravelTypeName = this._travelType;

    const city = this._city;

    const destinationData = DESTINATION_INFO.filter((it)=>it.name === city);

    let destinationDescription = ``;
    let destinationPictures = [];

    if (destinationData.length === 0) {
      destinationDescription = ``;
      destinationPictures = [];
    } else {
      destinationDescription = destinationData[0].description;
      destinationPictures = destinationData[0].pictures;

    }

    let imageTemplate = ``;
    let eventOffers = ``;

    const cityOptionsMarkup = CITIES.sort().map((cityName)=> {
      const isSelected = city === cityName ? `selected` : ``;

      return `<option value="${cityName}" ${isSelected}>${cityName}</option>`;
    });

    const allOffersByChosedType = OFFERS.filter((elem)=> elem.type === lowerCaseType)[0].offers;


    if (allOffersByChosedType.length < 1) {
      eventOffers = ``;
    } else {

      eventOffers = allOffersByChosedType.map((it) => {

        const id = it.title.split(/\s+/).join(`-`);
        const nameAttr = it.title;

        const isChecked = ()=> this._includedOffers.some((includedOffer)=>
          it.title === includedOffer.title
        ) ? `checked` : ``;


        return `<div class="event__offer-selector">
              <input class="event__offer-checkbox  visually-hidden" id="${id}" type="checkbox" name="${nameAttr}" ${isChecked()}>
              <label class="event__offer-label" for="${id}">
                <span class="event__offer-title">${it.title}</span>
                &plus;
                &euro;&nbsp;<span class="event__offer-price">${it.price}</span>
              </label>
            </div>`;
      }).join(` \n`);
    }

    const typeItemsTransfer = [`Taxi`, `Bus`, `Train`, `Ship`, `Transport`, `Drive`, `Flight`];
    const typeItemsActivity = [`Check-in`, `Sightseeing`, `Restaurant`];

    const createTypeMarkup = (type, eventType)=> {
      return (
        `<div class="event__type-item">
          <input id="event-type-${type.toLowerCase()}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type.toLowerCase()} ${type === eventType ? `checked` : ``}">
          <label class="event__type-label  event__type-label--${type.toLowerCase()}" for="event-type-${type.toLowerCase()}-1">${type}</label>
        </div>`
      );
    };

    const transferMarkup = typeItemsTransfer.map((it)=> createTypeMarkup(it, lowerCaseType)).join(`\n`);
    const activityMarkup = typeItemsActivity.map((it)=> createTypeMarkup(it, lowerCaseType)).join(`\n`);

    if (destinationPictures.length < 1) {
      imageTemplate = ``;
    } else {
      imageTemplate = destinationPictures.map((it) => {

        return `<img class="event__photo" src="${it.src}" alt="${it.description}">`;
      }).join(` \n`);
    }

    return `<form class="trip-events__item  event  event--edit" action="#" method="post">
    <header class="event__header">
    <div class="event__type-wrapper">
    <label class="event__type  event__type-btn" for="event-type-toggle-1">
      <span class="visually-hidden">Choose event type</span>
      <img class="event__type-icon" width="17" height="17" src="${this._icon}" alt="Event type icon">
    </label>
    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" data-travel-type="${dataTravelTypeName}" name="type-toggle" type="checkbox">

    <div class="event__type-list">
      <fieldset class="event__type-group">
        <legend class="visually-hidden">Transfer</legend>
        ${transferMarkup}
      </fieldset>

      <fieldset class="event__type-group">
        <legend class="visually-hidden">Activity</legend>
        ${activityMarkup}
      </fieldset>
    </div>
    </div>

    <div class="event__field-group  event__field-group--destination">
    <label class="event__label  event__type-output" for="event-destination-1">
    ${turnFirstLetterToCapital(this._travelType)} ${this._prefix}
    </label>

    <select class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${city}" list="destination-list-1">
      <datalist id="destination-list-1">
        ${firstEmptyOption}
        ${cityOptionsMarkup}
      </datalist>
    </select>
    </div>

    <div class="event__field-group  event__field-group--time">
    <label class="visually-hidden" for="event-start-time-1">
      From
    </label>
    <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${this._firstDateValue}">
    &mdash;
    <label class="visually-hidden" for="event-end-time-1">
      To
    </label>
    <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${this._lastDateValue}">
    </div>

    <div class="event__field-group  event__field-group--price">
    <label class="event__label" for="event-price-1">
      <span class="visually-hidden">Price</span>
      &euro;
    </label>
    <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${price}">
    </div>

    <button class="event__save-btn  btn  btn--blue" type="submit">${submitButtonText}</button>
    <button class="event__reset-btn" type="reset">${resetButtonText}</button>
    ${isFavoriteButtonDisplayed ?
    `<input id="event-favorite-1" class="event__favorite-checkbox  visually-hidden" type="checkbox" name="event-favorite" ${isFavoriteChecked}>
    <label class="event__favorite-btn" for="event-favorite-1">
      <span class="visually-hidden">Add to favorite</span>
      <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
        <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
      </svg>
    </label>`
    : ``}

      ${isCloseFormButtonDisplayed ?
    `<button class="event__rollup-btn" type="button">
    <span class="visually-hidden">Open event</span>
  </button>`
    : ``}
    </header>
    ${this._isDestinationCityChosed ?
    `<section class="event__details">
    ${eventOffers.length > 0 ?
    `<section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">${eventOffers}</div>
    </section>`
    :
    ``}
      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${destinationDescription}</p>
        <div class="event__photos-container">
          <div class="event__photos-tape">${imageTemplate}</div>
        </div>
      </section>
    </section>`
    : ``}
    </form>`;

  }
}
