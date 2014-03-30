###*
 * Popup controller
 * @param {[type]} $scope     [description]
 * @param {[type]} Betaseries [description]
###

HeaderCtrl = ($scope, Viewer) ->
  $scope.sync = ->
    Viewer.refresh()

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

MyEpisodesCtrl = ($scope, $location, Viewer, Betaseries) ->
  
  Viewer.load('my-episodes', {
    "subtitles": "all"
  }, (shows) ->
    $scope.shows = shows
    $('#about').height(200)
    $('.nano').nanoScroller({})
  )

  $scope.watched = (episode) ->
    Betaseries.episodesWatched({
      'type': 'post', 
      'id': episode.id
    }, ->
      # Actions to remove the episode from the list
    )

  $scope.go_comments = (episode) ->
    $location.path('/episodes/' + episode + '/comments');

###*
 * Episode - view
 * /episode/:id
###

EpisodeDisplayCtrl = ($scope, $routeParams, Viewer) ->
  Viewer.load('episode-display', {
    "id": $routeParams.episode, # required
  }, (episode) ->
    $scope.episode = episode
  )

###*
 * Episode comments - view
 * /episode/:id/comments
###

EpisodeCommentsCtrl = ($scope, $routeParams, Viewer) ->
  Viewer.load('episode-comments', {
    "type": "episode", # required
    "id": $routeParams.episode, # required
    "nbpp": 500,
    "since_id": null,
    "order": "asc"
  }, (comments) ->
    $scope.comments = comments
    console.log(comments)
  )