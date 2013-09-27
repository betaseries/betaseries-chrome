/**
 * Ajax class
 * @param {object} Auth
 * @param {object} $http
 */
var Ajax = function(Auth, $http) {
  this.Auth = Auth;
  this.$http = $http;
};

/**
 * Performs an ajax call
 * @param  {string} method
 * @param  {string} path
 * @param  {array} params
 * @param  {callback} success
 */
Ajax.prototype.send = function(method, path, params, success) {
  var defaultParams = {
    "v": '2.1',
    "key": '6db16a6ffab9',
    "token": this.Auth.getToken()
  };

  params = angular.extend(params, defaultParams);

  var config = {
    "method": method,
    "url": 'http://api.betaseries.com' + path,
    "params": params
  };

  this.$http(config)
    .success(function(data) {
      success(data);
    })
    .error(function(data) {
      console.log(data);
    });
};

/**
 * Shortcut ro perform a GET ajax call
 * @param  {string} path
 * @param  {array} params
 * @param  {success} success
 */
Ajax.prototype.get = function(path, params, success) {
  this.send('GET', path, params, success);
};

/**
 * Shortcut ro perform a POST ajax call
 * @param  {string} path
 * @param  {array} params
 * @param  {success} success
 */
Ajax.prototype.post = function(path, params, success) {
  this.send('POST', path, params, success);
};