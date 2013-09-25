'use strict';

/* App module */

angular.module('betaseries', []).
	config(['$routeProvider', function($routeProvider){
		
		window.DB = new DB();
		
		var defaultRoute = (DB.get('session', null) != null) ? "/my-episodes" : "/connection";

		$routeProvider.
			when('/connection', {templateUrl: '../partials/connection.html', controller: ConnectionCtrl}).
			//when('/registration', {templateUrl: '../partials/shows.html', controller: RegistrationCtrl}).
			when('/my-episodes', {templateUrl: '../partials/my-episodes.html', controller: MyEpisodesCtrl}).
			//when('/planning', {templateUrl: '../partials/shows.html', controller: PlanningCtrl}).
			otherwise({redirectTo: defaultRoute});
	}]).
	run(function($http){
		window.Ajax = new Ajax($http);
	});