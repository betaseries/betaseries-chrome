/**
 * View connexion
 * @class View_Connection
 * @constructor
 */
var View_Connection = function() {};

/**
 * Initialize the view
 * @method init
 */
View_Connection.prototype.init = function() {
	this.id = 'Connection';
	this.name = 'Connection';
};

/**
 * Build HTML output
 * @method content
 * @return {string} HTML output
 */
View_Connection.prototype.content = function() {
	menu.hide();
	var output = '<div style="height:10px;"></div>';
	output += '<form id="connect">';
	output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>';
	output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>';
	output += '</table>';
	output += '<div class="valid"><input type="submit" value="' + __('sign_in') + '"> ou ';
	output += '	<a href="" class="display_registration">' + __('sign_up') + '</a></div>';
	output += '</form>';
	return output;
};

/**
 * Add listeners
 * @method listen
 */
View_Connection.prototype.listen = function() {
	$('.Connection').on('click', '.display_registration', function() {
		event.preventDefault();
		app.view.load('Registration');
	});

	$('.Connection').on('submit', '#connect', function() {
		var login = $('#login').val();
		var password = md5($('#password').val());
		var inputs = $(this).find('input').attr({
			disabled: 'disabled'
		});
		var params = "&login=" + login + "&password=" + password;

		ajax.post("/members/auth", params, function(data) {
			var token;

			if (data.root.member) {
				$('#message').slideUp();
				$('#connect').remove();
				token = data.root.member.token;
				DB.set('session', {
					login: login,
					token: data.root.member.token
				});
				menu.show();
				$('#back').hide();
				app.view.load('MyEpisodes');
			} else {
				$('#password').attr('value', '');
				message('<img src="../img/inaccurate.png" /> ' + __('wrong_login_or_password'));
				inputs.removeAttr('disabled');
			}
		}, function() {
			$('#password').attr('value', '');
			inputs.removeAttr('disabled');
		});

		return false;
	});
};