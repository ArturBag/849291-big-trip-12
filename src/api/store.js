export default class Store {
  constructor(key, storage) {
    this._storeKey = key;
    this._storage = storage;
  }

  getItems() {
    try {
      return JSON.parse(this._storage.getItem(this._storeKey)) || {};
    } catch (err) {
      return {};
    }

  }

  setItems(key, value) {

    const store = this.getItems();

    this._storage.setItem(
        this._storeKey,
        JSON.stringify(
            Object.assign({}, store, {
              [key]: value
            })
        )
    );
  }


  setItem(key, value) {

    const index = parseInt(key, 10);

    const store = this.getItems();
    store.points = Object.assign({}, store.points, {
      [index]: value
    });

    this._storage.setItem(
        this._storeKey,
        JSON.stringify(store)

    );

  }


  // правильный код. не удалять
  removeItem(key) {

    const store = this.getItems();

    delete store.points[key];

    this._storage.setItem(
        this._storeKey,
        JSON.stringify(store)
    );
  }

}
