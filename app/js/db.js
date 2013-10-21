/**
 * STORE
 */

var db = function() {};

/**
 * Create/Get a store from localStorage
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
db.prototype.store = function(name) {
  return new store(this, name);
};

/**
 * Get a value from localStorage
 * @param  {[type]} field [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
db.prototype.get = function(field, value) {
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
db.prototype.set = function(field, value) {
  value = JSON.stringify(value);
  localStorage.setItem(field, value);
};

/**
 * Remove a value from localStorage
 * @param  {[type]} field [description]
 * @return {[type]}       [description]
 */
db.prototype.remove = function(field) {
  localStorage.removeItem(field);
};

/**
 * STORE
 */

var store = function(db, name) {
  this.db = db;
  this._name = name;
  this._data = this.db.get(name, []);
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
 * Set data store (with timestamp)
 * @param {[type]} value [description]
 */
store.prototype.set = function(value) {
  var d = new Date();

  this.db.set(this._name, value);
  this.db.set(this._name + "-timestamp", d.toDateString());
};

/**
 * Returns if data is not oudated
 * @return {boolean}
 */
store.prototype.isReliable = function() {
  var d = new Date();
  return (this.db.get(this._name + '-timestamp') == d.toDateString());
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
    this.db.remove(this._name);
  }
};

/**
 * Save a store to localStorage
 * @return {[type]} [description]
 */
store.prototype.__save = function() {
  this.db.set(this._name, this._data);
};