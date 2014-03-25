###*
 * Betaseries class
###
class Betaseries

  constructor: (@Ajax) ->
  
  episodesList: (params, fn) ->
    params = _.extend(params,
        'subtitles': 'all'
      )
    @Ajax.get('/episodes/list', params, (data) ->
        fn(data.shows)
      )

  episodesWatched: (params, fn) ->
    switch params.type
      when 'post'
        @Ajax.post('/episodes/watched', (params, data) ->
          fn(data)
        )
      when 'delete'
        @Ajax.delete('/episodes/watched', (params, data) ->
          fn(data)
        )