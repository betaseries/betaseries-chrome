class View_Connection
	
	init: ->
		@id = 'Connection'
		@name = 'Connection'
	
	content: ->
		menu.hide()
		output = '<div style="height:10px;"></div>';
		output += '<form id="connect">'
		output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>'
		output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>'
		output += '</table>'
		output += '<div class="valid"><input type="submit" value="' + __('sign_in') + '"> ou '
		output += '	<a href="" class="display_registration">' + __('sign_up') + '</a></div>'
		output += '</form>'
		return output