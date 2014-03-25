###*
 * Page class
 * @param {Object} Betaseries
 * @param {Object} db
###
class Page

  constructor: (@Betaseries, @db) ->
    @force = false

  ###*
   * Display OR update a view
  ###
  call: ->
    
    # get the check
    checks = @db.get('checks', {})

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

      @Betaseries[@view.bs] @view.params, (data) =>

        # store checked
        checks[@view.store] = today
        @db.set('checks', checks)

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