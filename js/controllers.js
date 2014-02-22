'use strict';

/**
 * Popup controller
 * @param {[type]} $scope     [description]
 * @param {[type]} Betaseries [description]
 */

function HeaderCtrl($scope, Betaseries) {
  $scope.sync = function() {
    Betaseries.refresh();
  };
}

/**
 * Connection - view
 * @param {[type]} $scope    [description]
 * @param {[type]} $location [description]
 * @param {[type]} Ajax      [description]
 * @param {[type]} db        [description]
 */

function ConnectionCtrl($scope, $location, Ajax, db) {
  $scope.lbl_login = 'Pseudo';
  $scope.lbl_password = 'Mot de passe';
  $scope.lbl_sign_in = 'Se connecter';
  $scope.lbl_sign_up = "S'inscrire";

  $('#about').height(200);
  $('.nano').nanoScroller({});

  $scope.sign_in = function() {
    var params = {
      "login": $scope.login,
      "password": $.md5($scope.password)
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

function MyEpisodesCtrl($scope, $location, Betaseries) {
  Betaseries.load('myEpisodes', {
    "subtitles": "all"
  }, function(shows) {
    $scope.shows = shows;
    $('#about').height(200);
    $('.nano').nanoScroller({});
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

  $scope.go_comments = function(episode) {
    $location.path('/episodes/' + episode + '/comments');
  }
}

/**
 * Episode comments - view
 * /episode/:id/comments
 */

function EpisodeCommentsCtrl($scope, $routeParams, Betaseries) {
  Betaseries.load('episodeComments', {
    "type": "episode", // required
    "id": $routeParams.episode, // required
    "nbpp": 500,
    "since_id": null,
    "order": "asc"
  }, function(comments) {
    $scope.comments = comments;
    console.log(comments);
  });
}