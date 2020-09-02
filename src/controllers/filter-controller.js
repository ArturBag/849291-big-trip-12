import FilterComponent from '../components/filters.js';
import {render, replace, RenderPosition} from '../utils/render.js';
import {filterTypes} from '../const.js';


export default class FilterController {
  constructor(container, pointsModel) {
    this._container = container;
    this._pointsModel = pointsModel;

    this._activeFilterType = filterTypes[`filter-everything`].name;
    this._filterComponent = null;

    this._onFilterChange = this._onFilterChange.bind(this);

  }

  render() {
    const container = this._container;
    const filters = Object.values(filterTypes).map((filterId) => {
      const id = `filter-${filterId.name.toLowerCase()}`;

      return {
        id,
        name: filterId.name,
        checked: filterId.name === this._activeFilterType
      };
    });

    const oldComponent = this._filterComponent;

    this._filterComponent = new FilterComponent(filters);

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
