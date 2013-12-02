'use strict';

/* App module */

var app = angular.module('betaseriesApp', ['ngRoute'], function($compileProvider) {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
});

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

/**
 * Format a date
 */
app.filter('date', function() {
  return function(input) {
    return new Date(input).toLocaleString();
  }
});

/**
 * Format a date (localeDateString)
 */
app.filter('localeDateString', function() {
  return function(input) {
    return new Date(input).toLocaleDateString();
  }
});

/**
 * Format a note
 */
app.filter('note', function() {
  return function(input) {
    var n = input ? Math.round(input * 10) / 10 : 0;
    return n;
  }
});

/**
 * Return the background-color of a note
 */
app.filter('bgNote', function() {
  return function(input) {
    var n = input ? Math.round(input * 10) / 10 : 0;
    var color = 'green';
    if (n < 4) {
      color = 'orange';
    }
    if (n < 3) {
      color = 'red';
    }
    return color;
  }
});

/**
 * Return the background-color of a note
 */
app.filter('code', function() {
  return function(input) {
    var res;
    res = '';
    if (input[1] !== '0') {
      res += input[1];
    }
    res += input[2];
    res += 'x';
    res += input[4];
    res += input[5];
    return res;
  }
});

/**
 * Substring of a word
 */
app.filter('substr', function() {
  return function(input, length) {
    if (length > 0) {
      input = input.substr(0, length);
    } else {
      input = input.substr(length);
    }
    return input;
  }
});