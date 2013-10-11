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
Betaseries.prototype.call = function(verb, path, params, callback) {
  self = this;

  // checks if data exists
  var data = this.db.store(path).get();

  // checks if data is reliable
  var outdated = this.db.outdated(path);

  // data is good & reliable
  if (!outdated && data) {

    calback(data);

  } else {
    this.Ajax[verb](path, params, function(data) {

      // format data (= reliable)
      data = self[name]();

      // save data
      this.db.store(path).set(data);

      callback(data);
    });
  }
};

/**
 * Alias of call get
 * @param  {[type]}   path     [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Betaseries.prototype.get = function(path, params, callback) {
  this.call("get", path, params, callback);
};

/**
 * My Episodes view
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Betaseries.prototype.myEpisodes = function(data) {

  // format data


  return data;
};