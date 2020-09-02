export default class Point {
  constructor(data) {
    this.id = data[`id`];
    this.travelType = data[`type`];
    this.city = data[`destination`][`name`];
    this.destination = {
      description: data[`destination`][`description`],
      name: data[`destination`][`name`],
      pictures: data[`destination`][`pictures`]
    };
    this.price = data[`base_price`];
    this.startDate = new Date(data[`date_from`]);
    this.endDate = new Date(data[`date_to`]);
    this.isFavorite = Boolean(data[`is_favorite`]);
    this.includedOffers = data[`offers`];
  }

  static toRAW(clientData) {

    return {
      "id": clientData.id.toString(),
      "type": clientData.travelType.toLowerCase(),
      "destination": clientData.destination,
      "base_price": clientData.price,
      "date_from": new Date(clientData.startDate).toISOString(),
      "date_to": new Date(clientData.endDate).toISOString(),
      "is_favorite": clientData.isFavorite,
      "offers": clientData.includedOffers
    };

  }


  static parsePoint(data) {
    return new Point(data);
  }


  static parsePoints(data) {
    return data.map((dataItem)=> Point.parsePoint(dataItem));
  }

}

