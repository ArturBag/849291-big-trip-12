import AbstractComponent from './abstract-component.js';


export default class Price extends AbstractComponent {
  constructor(prcieData) {
    super();

    this._prcieData = prcieData;
  }


  getTemplate() {

    return `<p class="trip-info__cost">
                Total: €&nbsp;<span class="trip-info__cost-value">${this._prcieData}</span>
            </p>`;

  }

}
