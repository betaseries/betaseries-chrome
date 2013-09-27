'use strict';

/* Controllers */

function ConnectionCtrl($scope, $location, Ajax, Database) {
  $scope.lbl_login = 'Pseudo';
  $scope.lbl_password = 'Mot de passe';
  $scope.lbl_sign_in = 'Se connecter';
  $scope.lbl_sign_up = "S'inscrire";

  $scope.sign_in = function() {
    var params = {
      "login": $scope.login,
      "password": md5($scope.password)
    };

    Ajax.post('/members/auth', params, function(data) {
      Database.set('session', {
        "login": data.user.login,
        "token": data.token
      });
      $location.path('/my-episodes');
    });
  };
}

/**
 * My episodes - view
 * @param {object} $scope
 */

function MyEpisodesCtrl($scope, Ajax) {
  Ajax.get('/episodes/list', {}, function(data) {
    console.log(data);
  });
}

function ShowsCtrl($scope, $http) {
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