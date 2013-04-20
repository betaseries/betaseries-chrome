class View_Registration
	
	init: ->
		@id = 'Registration'
		@name = 'Registration'
	
	content: ->
		menu.hide()
		output = '<div style="height:10px;"></div>';
		output += '<form id="register">'
		output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>'
		output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>'
		output += '<tr><td>' + __('repassword') + '</td><td><input type="password" name="repassword" id="repassword" /></td></tr>'
		output += '<tr><td>' + __('email') + '</td><td><input type="text" name="mail" id="mail" /></td></tr>'
		output += '</table>'
		output += '<div class="valid"><input type="submit" value="' + __('sign_up') + '"> ou '
		output += '	<a href="#" class="display_connection">' + __('sign_in') + '</a></div>'
		output += '</form>'
		return output