###*
 * myEpisodes data
###
class myEpisodes extends View

  constructor: (db, params, callback) ->
    super(db, params, callback)
    @store = '/episodes/list'
    @bs = 'episodesList'

  ###*
   * Update data
   * @param  {Object} data 
  ###
  update: (data) ->
    login = @db.get('session').login

    # getting show list
    shows = @db.get("member.#{login}.shows", [])

    # Unseen episodes
    unseen = 0

    for s of data
      showData = data[s]

      show = _.findWhere(shows, {
        "id": showData.id
      })

      if show
        show.archived = false
      else
        show = _.pick(showData, ['id', 'thetvdb_id', 'title', 'remaining'])

        show = _.extend(show, {
          "archived": false,
          "hidden": false,
        })

        shows.push(show)

      # getting episodes list
      episodes = @db.get("show.#{showData.id}.episodes", [])

      for e of showData.unseen
        episodeData = showData.unseen[e]

        episode = _.findWhere(episodes, {
          "id": episodeData.id
        })

        if episode
          episode = _.extend(episode, episodeData)
        else
          episode = episodeData
          episodes.push(episode)

        # counting unseen episodes
        unseen++

      # saving episodes list
      @db.set("show.#{showData.id}.episodes", episodes)

    # saving shows list
    @db.set("member.#{login}.shows", shows)

    #Badge.set('total_episodes', unseen)

  ###*
   * Prepare data
  ###
  fetch: ->
    login = @db.get('session').login

    # getting shows list
    showsData = @db.get("member.#{login}.shows", [])

    # filtering where episodes remaining and show not archived
    shows = _.filter(showsData, (show) ->
      show.remaining > 0 and not(show.archived)
    )

    for i of shows
      show = shows[i]

      # extra fields
      show.visibleIcon = (show.hidden) ? 'img/arrow_right.gif' : 'img/arrow_down.gif'

      # getting last episodes
      episodes = @db.get("show.#{show.id}.episodes", [])

      show.episodes = _.last(episodes, show.remaining)

    @callback(shows)