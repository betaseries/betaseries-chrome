/**
 * Store class
 */

function Store() {};

/**
 * Find sthg in a collection
 * @param  {object} collection [description]
 * @param  {object} filters    [description]
 * @return {array}            [description]
 */
Store.prototype.find = function(collection, filters) {
  var collection = this.get(collection),
    results = collection,
    i, j, set;

  // browse the collection
  results = [];
  for (i in collection) {
    set = collection[i]
    // browse the filters 
    for (j in filters) {
      filter = filters[j];
      if (this._test(filters[j])) {
        results.push(set);
      }
    };
  };

  return results;
};

/**
 * Test a filter
 * @param  {object} filter [description]
 * @return {boolean}        [description]
 */
Store.prototype._test = function(filter) {
  var res = false,
    i, j, k;
  for (i in filter) {
    if (i === '$and') {
      res = true;
      for (k in filter) {
        if (this._test(filter[k])) {
          res = false;
          break;
        }
      }
    } else if (i === '$or') {
      res = false;
      for (k in filter) {
        if (this._test(filter[k])) {
          res = true;
          break;
        }
      }
    } else if (typeof filter === 'object') {
      for (j in filter) {
        if (j === '$in' && $.inArray(i, filter[j])) {
          res = true;
        }
        if (j === '$nin' && !$.inArray(i, filter[j])) {
          res = true;
        }
        if (j === '$lt' && i < filter[j]) {
          res = true;
        }
        if (j === '$lte' && i <= filter[j]) {
          res = true;
        }
        if (j === '$gt' && i > filter[j]) {
          res = true;
        }
        if (j === '$gte' && i >= filter[j]) {
          res = true;
        }
        if (j === '$ne' && i !== filter[j]) {
          res = true;
        }
      }
      // equality
    } else if (set[i] === filters[i]) {
      res = true;
    }
  }
  return res;
};