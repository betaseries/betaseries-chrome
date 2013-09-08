'use strict';

/* App module */

angular.module('betaseries', []).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/shows', {templateUrl: '../partials/shows.html', controller: ShowsCtrl}).
			when('/shows/:showId', {templateUrl: '../partials/show.html', controller: ShowCtrl}).
			otherwise({redirectTo: '/shows'});
	}]);