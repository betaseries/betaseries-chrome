/**
 * Betaseries class
 * @param {Object} Ajax
 * @param {Object} db
 */
var Betaseries = function(Ajax, db) {
  this.Ajax = Ajax;
  this.db = db;
  this.force = false;
};

/**
 * Display OR update a view
 */
Betaseries.prototype.call = function() {
  var that = this;

  var view = this.view;

  // get the check
  var checks = this.db.get('checks', {});

  // Today's date
  var today = new Date().toDateString();

  // reliable if data checked today
  var reliable = _.has(checks, view.store) && checks[view.store] === today;

  // reliable & NOT force
  if (reliable && !this.force) {

    if (view.fetch) {
      view.fetch();
    }

  } else {
    this.force = false;

    this.Ajax[view.type](view.path, view.params, function(data) {

      // store checked
      checks[view.store] = today;
      that.db.set('checks', checks);

      var data = data[view.node];

      if (view.update) {
        view.update(data);
      }

      if (view.fetch) {
        view.fetch();
      }

    });
  }
};

/**
 * Load a view
 * @param  {String}   view
 * @param  {Object}   params
 * @param  {Function} callback
 */
Betaseries.prototype.load = function(view, params, callback) {
  this.view = new window[view](this.db, params, callback);
  this.call();
};

/**
 * Refresh a view
 */
Betaseries.prototype.refresh = function() {
  this.force = true;
  this.call();
};

/**
 * Save view data in store
 * @param  {Object} data
 */
Betaseries.prototype.save = function(data) {
  // get the store
  var store = this.db.store(this.path);
  store.set(data);
};