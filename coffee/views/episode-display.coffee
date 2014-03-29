###*
 * episode data
###
class episodeDisplay extends View

  constructor: (db, params, callback) ->
    super(db, params, callback)
    @store = "episode.#{params.id}"
    @bs = 'episodesDisplay'

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