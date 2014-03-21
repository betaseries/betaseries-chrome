###*
 * Ajax class
 * @param {object} Auth
 * @param {object} $http
###
class Ajax

  constructor: (@Auth, @$http) ->

  ###*
   * Performs an ajax call
   * @param  {string} method
   * @param  {string} path
   * @param  {array} params
   * @param  {callback} success
  ###
  send: (method, path, params, success) ->
    defaultParams = {
      "v": '2.2',
      "key": '6db16a6ffab9',
      "token": @Auth.getToken()
    }

    params = _.extend(params, defaultParams)

    config = {
      "method": method,
      "url": 'http://api.betaseries.com' + path,
      "params": params
    }

    @$http(config)
      .success((data) -> success(data))
      .error((data) -> console.log(data))

  ###*
   * Shortcut ro perform a GET ajax call
   * @param  {string} path
   * @param  {array} params
   * @param  {success} success
  ###
  get: (path, params, success) ->
    @send('GET', path, params, success)

  ###*
   * Shortcut ro perform a POST ajax call
   * @param  {string} path
   * @param  {array} params
   * @param  {success} success
  ###
  post: (path, params, success) ->
    @send('POST', path, params, success)