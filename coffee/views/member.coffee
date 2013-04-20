class View_Member

	init: (login) =>
		login ?= DB.get('session')?.login
		@id = 'Member.' + login
		@url = '/members/infos/' + login
		@login = login
		@name = 'Member'
		@root = 'member'
	
	update: (data) ->
		member = DB.get 'member.' + @login + '.infos', {}
		member.login = data.login
		member.is_in_account = data.is_in_account
		member.avatar = data.avatar
		member.stats = data.stats
		DB.set 'member.' + @login + '.infos', member
	
	content: ->
		data = DB.get 'member.' + @login + '.infos', null
		return Fx.needUpdate() if !data
		
		if data.avatar? and data.avatar isnt ''
			avatar = new Image
			avatar.src = data.avatar
			avatar.onload = ->
				$('#avatar').attr 'src', data.avatar
		
		output = ''
		output += '<div class="title">' + data.login + '</div>'
		output += '<img src="../img/avatar.png" width="50" id="avatar" style="position:absolute; right:0;" />'
		output += '<div class="episode lun"><img src="../img/infos.png" class="icon"> ' + __('nbr_friends', [data.stats.friends]) + ' </div>'
		output += '<div class="episode lun"><img src="../img/medal.png" class="icon"> ' + __('nbr_badges', [data.stats.badges]) + ' </div>'
		output += '<div class="episode lun"><img src="../img/episodes.png" class="icon"> ' + __('nbr_shows', [data.stats.shows]) + ' </div>'
		output += '<div class="episode lun"><img src="../img/report.png" class="icon"> ' + __('nbr_seasons', [data.stats.seasons]) + ' </div>'
		output += '<div class="episode lun"><img src="../img/script.png" class="icon"> ' + __('nbr_episodes', [data.stats.episodes]) + ' </div>'
		output += '<div class="episode lun"><img src="../img/location.png" class="icon">' + data.stats.progress + ' <small>(' + __('progress') + ')</small></div>'
		
		if data.is_in_account?
			output += '<div class="title2">' + __('actions') + '</div>'
			if data.is_in_account
				output += '<a href="#' + data.login + '" id="friendsRemove" class="link">' + '<span class="imgSyncOff"></span>' + __('remove_to_friends', [data.login]) + '</a>'
			else
				output += '<a href="#' + data.login + '" id="friendsAdd" class="link">' + '<span class="imgSyncOff"></span>' + __('add_to_friends', [data.login]) + '</a>'
		
		return output