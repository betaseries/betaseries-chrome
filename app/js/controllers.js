'use strict';

/* Controllers */

function ConnectionCtrl($scope) {
	$scope.login = 'Pseudo';
	$scope.password = 'Mot de passe';
	$scope.sign_in = 'Se connecter';
	$scope.sign_up = "S'inscrire";
} 

function ShowsCtrl($scope, $http){
	/*var config = {
		method: 'GET',
		url: 'http://api.betaseries.com/shows/display',
		params: {
			v: '2.0',
			key: '6db16a6ffab9',
			id: 1
		}

	}

	$http(config).success(function(data){
		$scope.name = data['show'].title;
	});*/

	$scope.name = 'TEST';
};

//ShowsCtrl.$inject = ['$scope', '$http'];

function ShowCtrl($scope, $routeParams) {
	$scope.showId = $routeParams.showId;
}

//ShowCtrl.$inject = ['$scope', '$routeParams'];