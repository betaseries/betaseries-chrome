'use strict';

/* App module */

angular.module('betaseries', []).
	config(['$routeProvider', function($routeProvider) {
		
		var defaultRoute = (false) ? "/my-episodes" : "/connection";

		$routeProvider.
			when('/connection', {templateUrl: '../partials/connection.html', controller: ConnectionCtrl}).
			//when('/registration', {templateUrl: '../partials/shows.html', controller: RegistrationCtrl}).
			//when('/my-episodes', {templateUrl: '../partials/shows.html', controller: MyEpisodesCtrl}).
			//when('/planning', {templateUrl: '../partials/shows.html', controller: PlanningCtrl}).
			otherwise({redirectTo: defaultRoute});
	}]);