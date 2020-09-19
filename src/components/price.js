import AbstractComponent from './abstract-component.js';


export default class Price extends AbstractComponent {
  constructor(totalPrice) {
    super();

    this._totalPrice = totalPrice;
  }


  getTemplate() {

    return `<p class="trip-info__cost">
                Total: €&nbsp;<span class="trip-info__cost-value">${this._totalPrice}</span>
            </p>`;

  }

}
