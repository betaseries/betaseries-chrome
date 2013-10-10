/**
 * STORE
 */

var db = {};

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
 * Register a collection
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
db.registerCollections = function(fields) {
  var forbidden = ["get", "set", "remove"];
  for (i in fields) {
    if (!in_array(fields[i], forbidden)) {
      db[fields[i]] = new collection(fields[i]);
    }
  }
};

/**
 * COLLECTION
 */

var collection = function(name) {
  this._field = name;
  this._data = db.get(name, []);
};

/**
 * Insert an item into a collection
 * @param  {[type]} item [description]
 * @return {[type]}      [description]
 */
collection.prototype.insert = function(item) {
  this._data.push(item);
  db.set(this._field, this._data);
};

/**
 * Find sthg in a collection
 * @param  {object} collection [description]
 * @param  {object} filters    [description]
 * @return {array}            [description]
 */
collection.prototype.find = function(filters) {
  var collection = this._data,
    results = this._data,
    i, j, set, filter, arrFilters, newFilters;

  // browse the collection
  if (filters) {
    results = [];
    for (i in collection) {
      set = collection[i];
      // test the filters
      arrFilters = [];
      for (j in filters) {
        filter = {};
        filter[j] = filters[j];
        arrFilters.push(filter);
      }
      newFilters = {
        $and: arrFilters
      };
      if (this._test(set, newFilters)) {
        results.push(set);
      }
    };
  }

  return results;
};

/**
 * Remove all data of the collection
 * @return {[type]} [description]
 */
collection.prototype.remove = function() {
  this._data = [];
  db.remove(this._field);
};

/**
 * Test a filter
 * @param  {object} filter [description]
 * @return {boolean}        [description]
 */
collection.prototype._test = function(set, filter) {
  var res = false,
    i, j, k;
  for (i in filter) {
    if (i === '$and') {
      res = true;
      for (k in filter[i]) {
        if (!this._test(set, filter[i][k])) {
          res = false;
          break;
        }
      }
    } else if (i === '$or') {
      res = false;
      for (k in filter[i]) {
        if (this._test(set, filter[i][k])) {
          res = true;
          break;
        }
      }
    } else if (typeof filter[i] === 'object') {
      for (j in filter[i]) {
        if (j === '$in' && in_array(set[i], filter[i][j])) {
          res = true;
        } else if (j === '$nin' && !in_array(set[i], filter[i][j])) {
          res = true;
        } else if (j === '$lt' && set[i] < filter[i][j]) {
          res = true;
        } else if (j === '$lte' && set[i] <= filter[i][j]) {
          res = true;
        } else if (j === '$gt' && set[i] > filter[i][j]) {
          res = true;
        } else if (j === '$gte' && set[i] >= filter[i][j]) {
          res = true;
        } else if (j === '$ne' && set[i] !== filter[i][j]) {
          res = true;
        }
      }
      // equality
    } else if (set[i] === filter[i]) {
      res = true;
    }
  }
  return res;
};

/**
 * FUNCTIONS
 */

function in_array(needle, haystack, argStrict) {
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: vlado houba
  // +   input by: Billy
  // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
  // *     example 1: in_array('van', ['Kevin', 'van', 'Zonneveld']);
  // *     returns 1: true
  // *     example 2: in_array('vlado', {0: 'Kevin', vlado: 'van', 1: 'Zonneveld'});
  // *     returns 2: false
  // *     example 3: in_array(1, ['1', '2', '3']);
  // *     returns 3: true
  // *     example 3: in_array(1, ['1', '2', '3'], false);
  // *     returns 3: true
  // *     example 4: in_array(1, ['1', '2', '3'], true);
  // *     returns 4: false
  var key = '',
    strict = !! argStrict;

  if (strict) {
    for (key in haystack) {
      if (haystack[key] === needle) {
        return true;
      }
    }
  } else {
    for (key in haystack) {
      if (haystack[key] == needle) {
        return true;
      }
    }
  }

  return false;
}

// BOOTSTRAP - List of collections
db.registerCollections(['shows']);