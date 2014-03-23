###*
 * episode data
###
class episode extends View

  constructor: (db, params, callback) ->
    super(db, params, callback)

    @path = '/episodes/display'
    @store = "episode.#{params.id}"
    @node = 'episode'

  ###*
   * Update data
   * @type {Object}
  ###
  update: (data) ->
    @db.set(@store, data)

  ###*
   * Prepare data
  ###
  fetch: ->
    episode = @db.get(@store, {})
    @callback(episode)