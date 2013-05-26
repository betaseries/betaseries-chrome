/**
 * View registration
 * @method View_Registration
 * @constructor
 */
var View_Registration = function() {};

/**
 * Initialize the view
 * @method init
 */
View_Registration.prototype.init = function() {
	this.id = 'Registration';
	this.name = 'Registration';
};

/**
 * Build HTML content
 * @method content
 * @return {string} HTML output
 */
View_Registration.prototype.content = function() {
	menu.hide();
	var output = '<div style="height:10px;"></div>';
	output += '<form id="register">';
	output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>';
	output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>';
	output += '<tr><td>' + __('repassword') + '</td><td><input type="password" name="repassword" id="repassword" /></td></tr>';
	output += '<tr><td>' + __('email') + '</td><td><input type="text" name="mail" id="mail" /></td></tr>';
	output += '</table>';
	output += '<div class="valid"><input type="submit" value="' + __('sign_up') + '"> ou ';
	output += '	<a href="#" class="display_connection">' + __('sign_in') + '</a></div>';
	output += '</form>';
	return output;
};

/**
 * Add listeners
 * @method listen
 */
View_Registration.prototype.listen = function() {
	$('.Registration').on('click', '.display_connection', function() {
		event.preventDefault();
		app.view.load('Connection');
	});

	$('.Registration').on('submit', '#register', function() {
		var login = $('#login').val();
		var password = $('#password').val();
		var repassword = $('#repassword').val();
		var mail = $('#mail').val();
		var inputs = $(this).find('input').attr({
			disabled: 'disabled'
		});
		var params = "&login=" + login + "&password=" + password + "&mail=" + mail;
		var pass = true;
		if (password !== repassword) {
			pass = false;
			message('<img src="../img/inaccurate.png" /> ' + __("password_not_matching"));
		}
		if (login.length > 24) {
			pass = false;
			message('<img src="../img/inaccurate.png" /> ' + __("long_login"));
		}
		if (pass) {
			ajax.post("/members/signup", params, function(data) {
				var err;

				if (data.root.errors.error) {
					err = data.root.errors.error;
					message('<img src="../img/inaccurate.png" /> ' + __('err' + err.code));
					$('#password').attr('value', '');
					$('#repassword').attr('value', '');
					inputs.removeAttr('disabled');
				} else {
					app.view.load('Connection');
					$('#login').val(login);
					$('#password').val(password);
					$('#connect').trigger('submit');
				}
			}, function() {
				$('#password').attr('value', '');
				$('#repassword').attr('value', '');
				inputs.removeAttr('disabled');
			});
		} else {
			$('#password').attr('value', '');
			$('#repassword').attr('value', '');
			inputs.removeAttr('disabled');
		}
		return false;
	});
};
