'use strict';

/* App module */

var app = angular.module('betaseriesApp', ['ngRoute']);

app.service('db', db);
app.factory('Auth', function(db) {
  return new Auth(db);
});
app.factory('Ajax', function(Auth, $http) {
  return new Ajax(Auth, $http);
});
app.factory('Betaseries', function(Ajax, db) {
  return new Betaseries(Ajax, db);
});

app.config(['$routeProvider',
  function($routeProvider) {

    $routeProvider.
    when('/connection', {
      templateUrl: 'partials/connection.html',
      controller: ConnectionCtrl,
      token: false
    }).
    //when('/registration', {templateUrl: '../partials/shows.html', controller: RegistrationCtrl}).
    when('/my-episodes', {
      templateUrl: 'partials/my-episodes.html',
      controller: MyEpisodesCtrl,
      token: true
    }).
    //when('/planning', {templateUrl: '../partials/shows.html', controller: PlanningCtrl}).
    otherwise({
      redirectTo: '/error'
    });
  }
]);

app.run(function($rootScope, $location, Auth) {

  var defaultPath = Auth.isLogged() ? '/my-episodes' : '/connection';
  $location.path(defaultPath);

  $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute) {
    // if route requires auth and user is not logged in
    if (currRoute.token && !Auth.isLogged()) {
      $location.path('/connection');
    }
  });
});