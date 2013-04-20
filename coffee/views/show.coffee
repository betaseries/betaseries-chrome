class View_Show

	init: (url) =>
		@id = 'Show.' + url
		@url = '/shows/display/' + url
		@show = url
		@name = 'Show'
		@root = 'show'
		@login = DB.get('session')?.login
	
	update: (data) ->
		data.is_in_account = data.is_in_account is "1"
		data.archive = data.archive is "1"
		DB.set 'show.' + @show, data
	
	content: ->
		data = DB.get 'show.' + @show, null
		return Fx.needUpdate() if !data
		
		output = '<div class="title">'
		output += '<div class="fleft200">' + data.title + '</div>'
		output += '<div class="fright200 aright">'
		if data.note?
			note = Math.floor data.note.mean
			for i in [1..note]
				output += '<img src="../img/star.gif" /> '
		output += '</div>'
		output += '<div class="clear"></div>'
		output += '</div>'

		output += '<div>'
		output += '<div class="fleft200">'
		genres = []
		genres.push v for k,v of data.genres
		output += genres.join(', ') + ' | '
		output += __(data.status.toLowerCase()) if data.status?
		output += '</div>'
		output += '<div class="fright200 aright">'
		if data.note?.mean? then output += data.note.mean + '/5 (' + data.note.members + ')'
		output += '</div>'
		output += '</div>'
			
		if data.banner?
			output += '<img src="' + data.banner + '" width="290" height="70" alt="banner" style="margin-top: 10px;" />'
		
		if data.description?
			output += '<div class="title2">' + __('synopsis') + '</div>'
			output += '<div style="margin-right:5px; text-align:justify;">' + data.description + '</div>'
		
		output += '<div class="title2">' + __('actions') + '</div>'
		output += '<a href="" class="link display_episodes" url="' + data.url + '"><span class="imgSyncNo"></span>Voir les épisodes</a>'
		if data.is_in_account and data.archive
			output += '<a href="#' + data.url + '" id="showsUnarchive" class="link">' + '<span class="imgSyncOff"></span>' + __('show_unarchive') + '</a>'
		else if data.is_in_account and !data.archive
			output += '<a href="#' + data.url + '" id="showsArchive" class="link">' + '<span class="imgSyncOff"></span>' + __('show_archive') + '</a>'
		if data.is_in_account
			output += '<a href="#' + data.url + '" id="showsRemove" class="link">' + '<span class="imgSyncOff"></span>' + __('show_remove') + '</a>'
		else
			output += '<a href="#' + data.url + '" id="showsAdd" class="link">' + '<span class="imgSyncOff"></span>' + __('show_add') + '</a>'
		
		return output