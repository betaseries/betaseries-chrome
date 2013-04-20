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

	listen: ->

		# Open connection view
		$('.display_connection').on 'click', ->
			event.preventDefault()
			app.view.load 'Connection'

		# register
		$('#register').on 'submit', ->
			login = $('#login').val()
			password = $('#password').val()
			repassword = $('#repassword').val()
			mail = $('#mail').val()
			inputs = $(this).find('input').attr {disabled: 'disabled'}
			params = "&login=" + login + "&password=" + password + "&mail=" + mail
			pass = true
			if password isnt repassword
				pass = false
				message '<img src="../img/inaccurate.png" /> ' + __("password_not_matching")
			if login.length > 24
				pass = false
				message '<img src="../img/inaccurate.png" /> ' + __("long_login")
			if pass
				ajax.post "/members/signup", params, 
					(data) ->
						if data.root.errors.error
							err = data.root.errors.error
							#console.log "error code : " + err.code
							message '<img src="../img/inaccurate.png" /> ' + __('err' + err.code)
							$('#password').attr 'value', ''
							$('#repassword').attr 'value', ''
							inputs.removeAttr 'disabled'
						else
							BS.load 'Connection'
							$('#login').val login
							$('#password').val password
							$('#connect').trigger 'submit'
					->
						$('#password').attr 'value', ''
						$('#repassword').attr 'value', ''
						inputs.removeAttr 'disabled'
			else
				$('#password').attr 'value', ''
				$('#repassword').attr 'value', ''
				inputs.removeAttr 'disabled'
			
			return false
