/**
 * Betaseries class
 */
var Betaseries = function(Ajax, db) {
  this.Ajax = Ajax;
  this.db = db;
};

/**
 * Get a Betaseries method
 * @param  {[type]}   name     [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Betaseries.prototype.call = function() {
  var self = this;

  // get the store
  var store = this.db.store(this.store);

  // checks if data exists
  var data = store.get();

  // checks if data is reliable
  var reliable = store.isReliable();

  // data is good & reliable
  if (reliable && data && !this.force) {

    this.callback(data);

  } else {
    this.force = false;

    this.Ajax[this.verb](this.path, this.params, function(data) {

      // format data for storing
      var data = data[self.key];

      // save data
      self.save(data);

      self.callback(data);
    });
  }
};

/**
 * Force the refresh of the call
 */
Betaseries.prototype.refresh = function() {
  this.force = true;
  this.call();
};

/**
 * Save data result in store
 * @param  {object} data
 */
Betaseries.prototype.save = function(data) {
  // get the store
  var store = this.db.store(this.path);
  store.set(data);
};

/**
 * [myEpisodes description]
 * @param  {[type]}   path     [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Betaseries.prototype.myEpisodes = function(params, callback) {
  this.path = "/episodes/list";
  this.store = "/episodes/list";
  this.key = "shows";
  this.verb = "get";
  this.params = params;
  this.callback = callback;
  this.call();
};

/**
 * Episode comments - view
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Betaseries.prototype.episodeComments = function(params, callback) {
  this.path = "/comments/comments";
  this.store = "/episodes/" + params.id + "/comments";
  this.key = "comments";
  this.verb = "get";
  this.params = params;
  this.callback = callback;
  this.call();
};