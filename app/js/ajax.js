/**
 * Ajax class
 * @param {object} $http
 */
var Ajax = function($http) {
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
		v: '2.1',
		key: '6db16a6ffab9'
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
		.error(function(data){
			console.log(data);
		});
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
