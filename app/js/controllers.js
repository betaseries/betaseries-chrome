'use strict';

/* Controllers */

function HeaderCtrl($scope, Betaseries) {
  $scope.refresh = function() {
    Betaseries.refresh();
  };
}

function ConnectionCtrl($scope, $location, Ajax, db) {
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
      db.set('session', {
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

function MyEpisodesCtrl($scope, Betaseries) {
  Betaseries.myEpisodes({}, function(data) {
    $scope.shows = data;
    console.log(data);
  });

  $scope.watched = function(show, episode) {
    var shows = $scope.shows;
    var found = false,
      i = 0;
    while (!found) {
      if (show.unseen[i].title == episode.title) {
        found = true;
      } else {
        i++;
      }
    }
    var length = show.unseen.length;
    show.remaining = length - 1;
    show.unseen = show.unseen.slice(i + 1, length);
    var found = false,
      i = 0;
    while (!found) {
      if (shows[i].title == show.title) {
        found = true;
      } else {
        i++;
      }
    }
    if (show.unseen.length > 0) {
      shows[i] = show;
      Betaseries.save(shows);
    } else {
      delete show[i];
    }
  }
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