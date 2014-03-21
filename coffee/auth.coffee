###*
 * Auth class
 * @param {object} Database
###
class Auth

    constructor: (@db) ->

    ###*
    * Returns true if the user is logged
    * @return {boolean}
    ###
    isLogged: -> @db.get('session')?

    ###*
    * Get token of current session
    * @return {string|undefined}
    ###
    getToken: ->
      session = @db.get('session')
      if session
        session.token;
      else
        undefined