###*
 * Betaseries class
 * @param {Object} Ajax
 * @param {Object} db
###
class Betaseries

  constructor: (@Ajax, @db) ->
    @force = false

  ###*
   * Display OR update a view
  ###
  call: ->
    
    # get the check
    checks = this.db.get('checks', {})

    # Today's date
    today = new Date().toDateString()

    # reliable if data checked today
    reliable = _.has(checks, @view.store) and checks[@view.store] is today

    # reliable & NOT force
    if reliable and not(@force)

      if @view.fetch
        @view.fetch()

    else
      
      @force = false

      @Ajax[@view.type] @view.path, @view.params, (data) =>

        # store checked
        checks[@view.store] = today
        @db.set('checks', checks)

        data = data[@view.node]

        if @view.update
          @view.update(data)

        if @view.fetch
          @view.fetch()

  ###*
   * Load a view
   * @param  {String}   view
   * @param  {Object}   params
   * @param  {Function} callback
  ###
  load: (view, params, callback) ->
    @view = new window[view](@db, params, callback)
    @call()

  ###*
   * Refresh a view
  ###
  refresh: ->
    @force = true
    @call()

  ###*
   * Save view data in store
   * @param  {Object} data
  ###
  save: (data) ->
    # get the store
    store = @db.store(@path);
    store.set(data)