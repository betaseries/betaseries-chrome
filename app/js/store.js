/**
 * STORE
 */

var db = {};

db.store = function(name) {
  store._data = db.get(name, {});
  return store;
};

/**
 * Get a value from localStorage
 * @param  {[type]} field [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
db.get = function(field, value) {
  var item = localStorage.getItem(field);
  if (item) {
    return JSON.parse(item);
  } else {
    return value;
  }
};

/**
 * Set a value into localStorage
 * @param {[type]} field [description]
 * @param {[type]} value [description]
 */
db.set = function(field, value) {
  value = JSON.stringify(value);
  localStorage.setItem(field, value);
};

/**
 * Remove a value from localStorage
 * @param  {[type]} field [description]
 * @return {[type]}       [description]
 */
db.remove = function(field) {
  localStorage.removeItem(field);
};

/**
 * STORE
 */

var store = function(name) {
  this._name = name;
  this._data = db.get(name, []);
};

/**
 * Get data from a store
 * @param  {[type]} filter [description]
 * @return {[type]}        [description]
 */
store.prototype.get = function(filter) {
  if (typeof filter === "number") {
    return this._data[filter];
  } else {
    return this._data;
  }
};

/**
 * Update one/many items from a store
 * @param  {[type]} items [description]
 * @return {[type]}       [description]
 */
store.prototype.update = function(items) {
  var i, j;
  for (i in items) {
    for (j in items[i]) {
      this._data[i][j] = items[i][j];
    }
  }
  this.__save();
};

/**
 * Remove an item from a store
 * Remove a store
 * @param  {[type]} filter [description]
 * @return {[type]}        [description]
 */
store.prototype.remove = function(filter) {
  if (typeof filter === "number") {
    delete this._data[filter];
    this.__save();
  } else {
    db.remove(this._name);
  }
};

/**
 * Save a store to localStorage
 * @return {[type]} [description]
 */
store.prototype.__save = function() {
  db.set(this._name, this._data);
};