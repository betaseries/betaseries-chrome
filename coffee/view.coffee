###*
 * View class
###
class View
    
  constructor: (@db, @params, @callback) ->
    @type = 'get';
    @path = '';
    @store = '';
    @node = '';