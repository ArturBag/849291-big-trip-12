import AbstractComponent from './abstract-component.js';

export const MenuItem = {
  TABLE: `trip-tabs__table`,
  STATS: `trip-tabs__stats`
};

export default class Menu extends AbstractComponent {


  setActiveItem(menuItem) {
    document.querySelector(`.trip-tabs__btn--active`).classList.remove(`trip-tabs__btn--active`);
    const item = this.getElement().querySelector(`#${menuItem}`);
    if (item) {
      item.classList.add(`trip-tabs__btn--active`);
    }
  }

  setOnChange(handler) {
    const menuTabs = this.getElement().querySelectorAll(`.trip-tabs__btn`);

    menuTabs.forEach((tab)=>{

      tab.addEventListener(`click`, (evt) => {
        if (evt.target.tagName !== `A`) {
          return;
        }

        const menuItem = evt.target.id;

        handler(menuItem);
        this._setOnChangeHandler = handler;
      });

    });

  }

  getTemplate() {
    return `<nav class="trip-controls__trip-tabs  trip-tabs">
              <a class="trip-tabs__btn trip-tabs__btn--active" id="trip-tabs__table" href="#">Table</a>
              <a class="trip-tabs__btn" id="trip-tabs__stats" href="#">Stats</a>
            </nav>`;
  }


}
