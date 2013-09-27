'use strict';

/* App module */

var app = angular.module('betaseriesApp', []);

app.service('DB', DB);
app.factory('Ajax', function($http) {
	return new Ajax($http);
});
app.factory('Auth', function(DB) {
	return new Auth(DB);
});
app.factory('Betaseries', function(Ajax) {
	return new Betaseries(Ajax);
});

app.config(['$routeProvider', function($routeProvider){
	
	$routeProvider.
		when('/connection', {templateUrl: '../partials/connection.html', controller: ConnectionCtrl, token: false}).
		//when('/registration', {templateUrl: '../partials/shows.html', controller: RegistrationCtrl}).
		when('/my-episodes', {templateUrl: '../partials/my-episodes.html', controller: MyEpisodesCtrl, token: true}).
		//when('/planning', {templateUrl: '../partials/shows.html', controller: PlanningCtrl}).
		otherwise({redirectTo: '/connection'});
}]);

app.run(function ($rootScope, $location, Auth) {

	$rootScope.$on('$routeChangeStart', function (event, currRoute, prevRoute) {
		// if route requires auth and user is not logged in
		if (currRoute.token && !Auth.isLogged()) {
			$location.path('/connection');
		}
	});
});