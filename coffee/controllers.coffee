###*
 * Popup controller
 * @param {[type]} $scope     [description]
 * @param {[type]} Betaseries [description]
###

HeaderCtrl = ($scope, Betaseries) ->
  $scope.sync = ->
    Betaseries.refresh()

###*
 * Connection - view
 * @param {object} $scope    
 * @param {object} $location 
 * @param {Ajax} Ajax      
 * @param {db} db        
###

ConnectionCtrl = ($scope, $location, Ajax, db) ->
  $scope.lbl_login = 'Pseudo'
  $scope.lbl_password = 'Mot de passe'
  $scope.lbl_sign_in = 'Se connecter'
  $scope.lbl_sign_up = "S'inscrire"

  $('#about').height(200)
  $('.nano').nanoScroller({})

  $scope.sign_in = ->
    params = {
      "login": $scope.login,
      "password": $.md5($scope.password)
    }

    Ajax.post '/members/auth', params, (data) ->
      db.set 'session', {
        "login": data.user.login,
        "token": data.token
      }
      $location.path('/my-episodes')

###*
 * My episodes - view
 * @param {object} $scope
###

MyEpisodesCtrl = ($scope, $location, Betaseries) ->
  Betaseries.load('myEpisodes', {
    "subtitles": "all"
  }, (shows) ->
    $scope.shows = shows
    $('#about').height(200)
    $('.nano').nanoScroller({})
  )

  $scope.watched = (show, episode) ->
    shows = $scope.shows
    found = false
    i = 0
    while !found
      if show.unseen[i].title is episode.title
        found = true
      else
        i++
    length = show.unseen.length
    show.remaining = length - 1
    show.unseen = show.unseen.slice(i + 1, length)
    found = false
    i = 0
    while !found
      if shows[i].title is show.title
        found = true
      else
        i++
    if show.unseen.length > 0
      shows[i] = show
      Betaseries.save(shows)
    else
      delete show[i]

  $scope.go_comments = (episode) ->
    $location.path('/episodes/' + episode + '/comments');

###*
 * Episode - view
 * /episode/:id
###

EpisodeCtrl = ($scope, $routeParams, Betaseries) ->
  Betaseries.load('episode', {
    "id": $routeParams.episode, # required
  }, (episode) ->
    $scope.episode = episode
  )

###*
 * Episode comments - view
 * /episode/:id/comments
###

EpisodeCommentsCtrl = ($scope, $routeParams, Betaseries) ->
  Betaseries.load('episodeComments', {
    "type": "episode", # required
    "id": $routeParams.episode, # required
    "nbpp": 500,
    "since_id": null,
    "order": "asc"
  }, (comments) ->
    $scope.comments = comments
    console.log(comments)
  )