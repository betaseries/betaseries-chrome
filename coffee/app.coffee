'use strict';

### App module ###

app = angular.module('betaseries-chrome', ['ngRoute'])

app.service 'db', db
app.factory 'Auth', (db) -> new Auth(db)
app.factory 'Ajax', (Auth, $http) -> new Ajax(Auth, $http)
app.factory 'Betaseries', (Ajax) -> new Betaseries(Ajax)
app.factory 'Page', (Betaseries, db) -> new Page(Betaseries, db)

app.config ['$routeProvider', '$compileProvider', ($routeProvider, $compileProvider) ->
    $routeProvider.
      when('/connection', {
        templateUrl: 'partials/connection.html',
        controller: ConnectionCtrl,
        token: false
      }).
      when('/my-episodes', {
        templateUrl: 'partials/episodes-list.html',
        controller: EpisodesListCtrl,
        token: true
      }).
      when('/episodes/:episode/comments', {
        templateUrl: 'partials/comments-comments.html',
        controller: CommentsCommentsCtrl,
        token: false
      }).
      when('/episodes/:episode', {
        templateUrl: 'partials/episodes-display.html',
        controller: EpisodesDisplayCtrl,
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