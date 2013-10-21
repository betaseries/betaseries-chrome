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
  var store = this.db.store(this.path);

  // checks if data exists
  var data = store.get();

  // checks if data is reliable
  var reliable = store.isReliable();

  // data is good & reliable
  if (reliable && data) {

    this.callback(data);

  } else {
    this.Ajax[this.verb](this.path, this.params, function(data) {

      // format data for storing
      var data = data[self.key];

      // save data
      store.set(self.path, data);

      self.callback(data);
    });
  }
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
  this.key = "shows";
  this.verb = "get";
  this.params = params;
  this.callback = callback;
  this.call();
};