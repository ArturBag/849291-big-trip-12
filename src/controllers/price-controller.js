import PriceComponent from '../components/price.js';
import {render, replace, RenderPosition} from '../utils/render.js';


export default class PriceController {
  constructor(container, pointsModel) {
    this._container = container;
    this._pointsModel = pointsModel;

    this._priceComponent = null;
    this._onDataChange = this._onDataChange.bind(this);

    this._pointsModel.setDataChangeHandler(this._onDataChange);
  }

  render() {

    const container = this._container;
    const pointsData = this._pointsModel.getPoints();

    let totalPrice = 0;

    pointsData.forEach((point) => {
      const checkedOffers = point.includedOffers;
      let totalOffersPrice = 0;

      if (checkedOffers.length === 0) {
        totalOffersPrice += 0;
      } else {
        checkedOffers.forEach((offer)=> {

          totalOffersPrice += offer.price;

        });
      }

      totalPrice += parseInt(point.price, 10) + parseInt(totalOffersPrice, 10);
    });


    const oldComponent = this._priceComponent;

    this._priceComponent = new PriceComponent(totalPrice);

    if (oldComponent) {
      replace(this._priceComponent, oldComponent);
    } else {
      render(container, this._priceComponent.getElement(), RenderPosition.BEFOREEND);
    }


  }

  _onDataChange() {
    this.render();
  }


}

