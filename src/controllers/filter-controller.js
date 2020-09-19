import FilterComponent from '../components/filters.js';
import {getPointsByFilter} from '../utils/filter.js';
import {render, replace, RenderPosition} from '../utils/render.js';
import {filterTypes} from '../const.js';


export default class FilterController {
  constructor(container) {
    this._container = container;

    this._activeFilterType = filterTypes[`filter-everything`].name;
    this._filterComponent = null;

    this._onFilterChange = this._onFilterChange.bind(this);

  }

  render(pointsModel) {

    this._pointsModel = pointsModel;
    const points = this._pointsModel.getPointsAll();
    const container = this._container;
    const filters = Object.values(filterTypes).map((filterType) => {
      const id = `filter-${filterType.name.toLowerCase()}`;

      return {
        id,
        name: filterType.name,
        disabled: points.length ? getPointsByFilter(points, filterType.name).length === 0 : false,
        checked: filterType.name === this._activeFilterType
      };
    });

    const oldComponent = this._filterComponent;

    this._filterComponent = new FilterComponent(filters, this._pointsModel);

    this._filterComponent.setFilterChangeHandler(this._onFilterChange);
    if (oldComponent) {
      replace(this._filterComponent, oldComponent);
    } else {
      render(container, this._filterComponent.getElement(), RenderPosition.AFTEREND);
    }

  }

  _onFilterChange(evt) {

    const filterId = evt.target.id;

    this._pointsModel.setFilter(filterId);
    this._activeFilterType = filterTypes[filterId].name;

  }

}
