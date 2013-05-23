class View_Connection
	
	init: =>
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

	listen: ->

		# Open registration view
		$('.Connection').on 'click', '.display_registration', ->
			event.preventDefault()
			app.view.load 'Registration'

		# connect
		$('.Connection').on 'submit', '#connect', ->
			login = $('#login').val()
			password = md5 $('#password').val()
			inputs = $(this).find('input').attr {disabled: 'disabled'}
			params = "&login=" + login + "&password=" + password
			ajax.post "/members/auth", params, 
				(data) ->
					if data.root.member?
						$('#message').slideUp()
						$('#connect').remove()
						token = data.root.member.token
						DB.set 'session', 
							login: login
							token: data.root.member.token
						menu.show()
						$('#back').hide()
						app.view.load 'MyEpisodes'
					else
						$('#password').attr 'value', ''
						message '<img src="../img/inaccurate.png" /> ' + __('wrong_login_or_password')
						inputs.removeAttr 'disabled'
				->
					$('#password').attr 'value', ''
					inputs.removeAttr 'disabled'
					
			return false
