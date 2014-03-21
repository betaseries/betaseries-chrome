###*
 * episodeComments data
###
class episodeComments extends View

  constructor: (db, params, callback) ->
    super(db, params, callback)

    @path = '/comments/comments'
    @store = "/episodes/#{params.id}/comments"
    @node = 'comments'

  ###*
   * Update data
   * @type {Object}
  ###
  update: (data) ->
    @db.set("episode.#{@params.id}.comments", data)

  ###*
   * Prepare data
  ###
  fetch: ->
    comments = @db.get("episode.#{@params.id}.comments", [])
    @callback(comments)