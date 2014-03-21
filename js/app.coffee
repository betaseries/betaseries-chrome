'use strict';

### App module ###

app = angular.module('betaseries-chrome', ['ngRoute'])

app.service 'db', db
app.factory 'Auth', (db) -> new Auth(db)
app.factory 'Ajax', (Auth, $http) -> new Ajax(Auth, $http)
app.factory 'Betaseries', (Ajax, db) -> new Betaseries(Ajax, db)

app.config ['$routeProvider', ($routeProvider) ->
    $routeProvider.
      when('/connection', {
        templateUrl: 'partials/connection.html',
        controller: ConnectionCtrl,
        token: false
      }).
      when('/my-episodes', {
        templateUrl: 'partials/my-episodes.html',
        controller: MyEpisodesCtrl,
        token: true
      }).
      when('/episodes/:episode/comments', {
        templateUrl: 'partials/episode-comments.html',
        controller: EpisodeCommentsCtrl,
        token: false
      }).
      otherwise({
        redirectTo: '/error'
      })
]

app.run ($rootScope, $location, Auth) ->

  defaultPath = Auth.isLogged() ? '/my-episodes' : '/connection'
  $location.path(defaultPath)

  $rootScope.$on '$routeChangeStart', (event, currRoute, prevRoute) ->
    # if route requires auth and user is not logged in
    if currRoute.token and !Auth.isLogged()
      $location.path('/connection')