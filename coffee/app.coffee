'use strict';

### App module ###

app = angular.module('betaseries-chrome', ['ngRoute'])

app.service 'db', db
app.factory 'Auth', (db) -> new Auth(db)
app.factory 'Ajax', (Auth, $http) -> new Ajax(Auth, $http)
app.factory 'Betaseries', (Ajax) -> new Betaseries(Ajax)
app.factory 'Viewer', (Betaseries, db) -> new Viewer(Betaseries, db)

app.config ['$routeProvider', '$compileProvider', ($routeProvider, $compileProvider) ->
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
      when('/episode/:episode/comments', {
        templateUrl: 'partials/episode-comments.html',
        controller: EpisodeCommentsCtrl,
        token: false
      }).
      when('/episode/:episode', {
        templateUrl: 'partials/episode-display.html',
        controller: EpisodeDisplayCtrl,
        token: false
      }).
      otherwise({
        redirectTo: '/error'
      })

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
]

app.run ($rootScope, $location, Auth) ->

  defaultPath = if Auth.isLogged() then '/my-episodes' else '/connection'
  $location.path(defaultPath)

  $rootScope.$on '$routeChangeStart', (event, currRoute, prevRoute) ->
    # if route requires auth and user is not logged in
    if currRoute.token and !Auth.isLogged()
      $location.path('/connection')