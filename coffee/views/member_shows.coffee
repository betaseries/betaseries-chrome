class View_MemberShows

	init: (login) =>
		login ?= DB.get('session')?.login
		@id = 'MemberShows.' + login
		@url = '/members/infos/' + login
		@login = login
		@name = 'MemberShows'
		@root = 'member'
	
	update: (data) ->
		shows = DB.get 'member.' + @login + '.shows', {}
		for i, s of data.shows
			if s.url of shows
				# cas où on enlève une série des archives depuis le site
				shows[s.url].archive = s.archive
			else
				shows[s.url] =
					url: s.url
					title: s.title
					archive: s.archive
					hidden: false
		DB.set 'member.' + @login + '.shows', shows
	
	content: ->
		data = DB.get 'member.' + @login + '.shows', null
		return Fx.needUpdate() if !data
		
		output = ''
		for i, show of data
			output += '<div class="episode" id="' + show.url + '">'
			if show.archive is '1'
				output += '<img src="../img/folder_off.png" class="icon-3" /> '
			else
				output += '<img src="../img/folder.png" class="icon-3" /> '
			output += '<a href="" url="' + show.url + '" class="epLink display_show">' + show.title + '</a>'
			output += '</div>'
		return output

	listen: ->

		# Archive a serie
		$('#showsArchive').on 'click', ->
			show = $(@).attr('href').substring 1

			$(@).find('span').toggleClass 'imgSyncOff imgSyncOn'
			
			ajax.post "/shows/archive/" + show, "", 
				=>
					Cache.force 'MyEpisodes.all'
					Cache.force 'Member.' + DB.get('session').login
					Badge.searchEpisodes()
					$(@).html '<span class="imgSyncOff"></span>' + __('show_unarchive')
					$(@).attr 'id', 'showsUnarchive'
				-> registerAction "/shows/archive/" + show, ""
			
			return false
		
		# Un-archive a serie
		$('#showsUnarchive').on 'click', ->
			show = $(this).attr('href').substring 1
			
			$(this).find('span').toggleClass 'imgSyncOff imgSyncOn'
			
			ajax.post "/shows/unarchive/" + show, "", 
				=>
					Cache.force 'MyEpisodes.all'
					Cache.force 'Member.' + DB.get('session').login
					Badge.searchEpisodes()
					$(this).html '<span class="imgSyncOff"></span>' + __('show_archive')
					$(this).attr 'id', 'showsArchive'
				-> registerAction "/shows/unarchive/" + show, ""
			
			return false
