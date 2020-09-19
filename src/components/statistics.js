import AbstractSmartComponent from './abstract-smart-component.js';
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {getTimeDiffinHours} from '../utils/common.js';

const typeSymbols = new Map([
  [`taxi`, `🚕`],
  [`bus`, `🚌`],
  [`train`, `🚂`],
  [`ship`, `🛳`],
  [`transport`, `🚊`],
  [`drive`, `🚗`],
  [`flight`, `✈️`],
  [`check-in`, `🏨`],
  [`sightseeing`, `🏛`],
  [`restaurant`, `🍴`]
]);


export default class Statistics extends AbstractSmartComponent {
  constructor(pointsModel, pointsData) {
    super();

    this._pointsModel = pointsModel;
    this._pointsData = pointsData;

    this._showMoneyStatistics();
    this._showTransportStatistics();
    this._showTimeStatistics();
  }

  _showMoneyStatistics() {
    const moneyCtx = this.getElement().querySelector(`.statistics__chart--money`);
    const formatToMoney = (val) => `€ ${val}`;
    const moneyTitle = `money`;

    const moneyData = this._getData(this._pointsData);
    const moneyPrices = moneyData.map((it) => it.price);

    const pointTypes = moneyData.map((it) => `${typeSymbols.get(it.type.toLowerCase())} ${it.type.toUpperCase()}`);

    const moneyChartData = [moneyCtx, formatToMoney, moneyTitle, pointTypes, moneyPrices];

    this._displayStatistics(moneyChartData);

  }

  _showTransportStatistics() {
    const transportCtx = this.getElement().querySelector(`.statistics__chart--transport`);
    const formatToTransport = (val) => `${val}x`;
    const transportTitle = `transport`;
    const transportData = this._getData(this._pointsData);

    const pointTypes = transportData.map((it) => `${typeSymbols.get(it.type.toLowerCase())} ${it.type.toUpperCase()}`);

    const transportQty = transportData.map((it) => it.quantity);

    const transportChartData = [transportCtx, formatToTransport, transportTitle, pointTypes, transportQty];

    this._displayStatistics(transportChartData);

  }

  _showTimeStatistics() {
    const timeCtx = this.getElement().querySelector(`.statistics__chart--time`);
    const formatToTime = (val) => `${val}H`;
    const timeTitle = `time spent`;
    const timeData = this._getData(this._pointsData);

    const pointTypes = timeData.map((it) => `${typeSymbols.get(it.type.toLowerCase())} ${it.type.toUpperCase()}`);

    const hours = timeData.map((it) => it.hours);

    const timeChartData = [timeCtx, formatToTime, timeTitle, pointTypes, hours];

    this._displayStatistics(timeChartData);

  }

  _getData(points) {

    const typesSet = new Set();
    points.forEach((it) => typesSet.add(it.travelType));

    const typesData = Array.from(typesSet).map((elem) => {
      let repeatingTypesPrice = 0;
      let repeatedTypesQty = 0;
      let hoursForType = 0;

      points.forEach((it) => {

        const isRepeating = it.travelType === elem;

        if (isRepeating) {
          repeatingTypesPrice += it.price;
          repeatedTypesQty = repeatedTypesQty + 1;

          const startDate = it.startDate;
          const endDate = it.endDate;
          const durationInhours = getTimeDiffinHours(endDate - startDate);

          hoursForType += durationInhours;
        }

        return false;
      });

      return {
        type: elem,
        price: repeatingTypesPrice,
        quantity: repeatedTypesQty,
        hours: hoursForType
      };

    });

    return typesData;
  }

  _displayStatistics(chartData) {

    const [ctx, formatter, titleText, pointTypes, typesData] = chartData;

    const moneyDataSets = {
      data: typesData,
      backgroundColor: `rgb(255, 255, 255)`,
      borderWidth: 0,
      anchor: `start`

    };

    const chartOptions = {
      legend: {
        display: false,
      },
      tooltips: {
        enabled: false,
      },
      plugins: {
        datalabels: {
          font: {size: 13},
          color: `#000000`,
          anchor: `end`,
          align: `start`,
          formatter
        },

      },
      title: {
        display: true,
        text: titleText.toUpperCase(),
        fontColor: `#000000`,
        fontSize: 23,
        position: `left`
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: `#000000`,
            padding: 5,
            fontSize: 13,
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          barThickness: 44,
        }],
        xAxes: [{
          ticks: {
            display: false,
            beginAtZero: true,
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          minBarLength: 50
        }]
      }
    };

    return new Chart(ctx, {
      type: `horizontalBar`,
      data: {
        labels: pointTypes,
        datasets: [moneyDataSets]
      },
      plugins: [ChartDataLabels],
      options: chartOptions
    });


  }

  getTemplate() {

    return `<section class="statistics">
    <h2 class="visually-hidden">Trip statistics</h2>

    <div class="statistics__item statistics__item--money">
      <canvas class="statistics__chart  statistics__chart--money" width="900"></canvas>
    </div>

    <div class="statistics__item statistics__item--transport">
      <canvas class="statistics__chart  statistics__chart--transport" width="900"></canvas>
    </div>

    <div class="statistics__item statistics__item--time-spend">
      <canvas class="statistics__chart  statistics__chart--time" width="900"></canvas>
    </div>
  </section>`;
  }


}

