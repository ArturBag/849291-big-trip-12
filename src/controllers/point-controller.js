import EventForm from '../components/event-form.js';
import TripDay from '../components/trip-day.js';
import {render, replace, remove, RenderPosition} from '../utils/render.js';

const SHAKE_ANIMATION_TIMEOUT = 600;

export const Mode = {
  ADDING: `adding`,
  DEFAULT: `default`,
  EDIT: `edit`,
};

const startDate = ``;
const endDate = ``;

export const EmptyPoint = {
  id: -1,
  travelType: `Flight`,
  city: ``,
  destination: {
    name: ``,
    description: ``,
    pictures: []
  },
  price: 0,
  startDate,
  endDate,
  isFavorite: false,
  includedOffers: []
};


export default class PointController {
  constructor(container, onDataChange, onViewChange) {

    this._container = container;
    this._onDataChange = onDataChange;
    this._onViewChange = onViewChange;

    this._onEscKeyDown = this._onEscKeyDown.bind(this);

    this._tripDaysComponent = null;
    this._eventFormComponent = null;

    this._formAction = Mode.DEFAULT;

  }


  render(route, routeIndex, mode, pointsQty) {
    this._routeData = route;

    EmptyPoint.id = pointsQty;


    const oldPointComponent = this._tripDaysComponent;
    const oldPointEditComponent = this._eventFormComponent;
    this._mode = mode;

    this._tripDaysComponent = new TripDay(route, routeIndex);
    this._eventFormComponent = new EventForm(route, this._mode);

    this._tripDaysComponent.setClickHandler(() => {

      this._replacetripDaysToEventForm();
      this._eventFormComponent.reset();
      document.addEventListener(`keydown`, this._onEscKeyDown);

    });

    this._eventFormComponent.setFavoritesHandler((isFavorite)=>{

      const shouldRender = false;
      this._onDataChange(this, route, Object.assign({}, route, {isFavorite}), shouldRender);
    });


    this._eventFormComponent.setCloseFormHandler(()=>{
      this._replaceEventFormToTripDays();

    });

    this._eventFormComponent.setResetButtonClickHandler((formMode)=>{

      if (formMode === Mode.ADDING) {
        this.destroy();
        this._replaceEventFormToTripDays();
      }
      this._eventFormComponent.setData({
        deleteButtonText: `Deleting...`
      });
      this._eventFormComponent.disableFormData();
      this._onDataChange(this, route, null);
    });

    this._eventFormComponent.setSubmitHandler((evt)=>{
      evt.preventDefault();
      const data = this._eventFormComponent.getData();

      this._eventFormComponent.setData({
        saveButtonText: `Saving...`
      });

      this._eventFormComponent.disableFormData();
      const shouldRender = true;
      if (this._mode === Mode.ADDING) {
        this._formAction = Mode.ADDING;
        this._onDataChange(this, EmptyPoint, data);
      } else {
        this._formAction = Mode.EDIT;
        this._onDataChange(this, route, data, shouldRender);
      }
    });

    switch (this._mode) {

      case Mode.DEFAULT:
        if (oldPointComponent && oldPointEditComponent) {
          replace(this._tripDaysComponent, oldPointComponent);
          replace(this._eventFormComponent, oldPointEditComponent);

          if (this._formAction === Mode.ADDING) {

            render(this._container, this._tripDaysComponent.getElement(), RenderPosition.BEFOREEND);
            remove(this._eventFormComponent);
          } else {
            this._replaceEventFormToTripDays();
          }

        } else {
          render(this._container, this._tripDaysComponent.getElement(), RenderPosition.BEFOREEND);
        }
        break;
      case Mode.ADDING:
        if (oldPointComponent && oldPointEditComponent) {
          remove(oldPointComponent);
          remove(oldPointEditComponent);
        }
        document.addEventListener(`keydown`, this._onEscKeyDown);
        render(this._container, this._eventFormComponent.getElement(), RenderPosition.AFTERBEGIN);
        break;
    }


  }

  removeFlatpickr() {
    this._eventFormComponent.removeFlatpickr();
  }

  setDefaultView() {
    if (this._mode !== Mode.DEFAULT) {
      this._replaceEventFormToTripDays();
    } else {
      remove(this._eventFormComponent);
    }
  }

  _onEscKeyDown(evt) {
    const isEscKey = evt.key === `Escape` || evt.key === `Esc`;

    if (isEscKey) {
      if (this._mode === Mode.ADDING) {
        this._onDataChange(this, EmptyPoint, null);
      }

      this._replaceEventFormToTripDays();
      document.removeEventListener(`keydown`, this._onEscKeyDown);
    }
  }

  destroy() {
    remove(this._eventFormComponent);
    remove(this._tripDaysComponent);
    document.removeEventListener(`keydown`, this._onEscKeyDown);
  }

  _replacetripDaysToEventForm() {
    this._onViewChange();

    replace(this._eventFormComponent, this._tripDaysComponent);
    this._mode = Mode.EDIT;
  }

  _replaceEventFormToTripDays() {
    document.removeEventListener(`keydown`, this._onEscKeyDown);

    this._eventFormComponent.reset();
    this._eventFormComponent.removeFlatpickr();

    if (document.contains(this._eventFormComponent.getElement())) {
      replace(this._tripDaysComponent, this._eventFormComponent);
    }
    this._mode = Mode.DEFAULT;
  }

  shake() {

    this._eventFormComponent.getElement().style.animation = `shake ${SHAKE_ANIMATION_TIMEOUT / 1000}s`;

    setTimeout(()=>{
      this._eventFormComponent.getElement().style.animation = ``;

      this._eventFormComponent.setData({
        deleteButtonText: `Delete`,
        saveButtonText: `Save`
      });
    }, SHAKE_ANIMATION_TIMEOUT);


  }

  showStyledServerError() {
    this.shake();

    this._eventFormComponent.getElement().style.outline = `2px solid red`;

    setTimeout(()=>{
      this._eventFormComponent.getElement().style.outline = ``;
    }, SHAKE_ANIMATION_TIMEOUT);

  }

}

