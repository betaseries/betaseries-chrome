class View_MyEpisodes
	
	init: (lang = 'all') =>
		@id = 'MyEpisodes.' + lang
		@url = '/members/episodes/' + lang
		@name = 'MyEpisodes'
		@root = 'episodes'
		@login = DB.get('session')?.login
	
	update: (data) ->
		shows = DB.get 'member.' + @login + '.shows', {}
		memberEpisodes = {}
		time = Math.floor (new Date().getTime() / 1000)
		
		j = 0
		for d, e of data
			
			# si l'épisode n'est pas encore diffusé, ne pas le prendre
			#continue if (time - e.date < 1 * 24 * 3600) 
			
			# cache des infos de la *série*
			if e.url of shows
				# cas où on enlève une série des archives depuis le site
				shows[e.url].archive = false
			else
				shows[e.url] =
					url: e.url
					title: e.show
					archive: false
					hidden: false
			
			# cache des infos de *épisode*
			showEpisodes = DB.get 'show.' + e.url + '.episodes', {}
			showEpisodes[e.global] =
				comments: e.comments
				date: e.date
				episode: e.episode
				global: e.global
				number: e.number
				season: e.season
				title: e.title
				show: e.show
				url: e.url
				subs: e.subs
				note: e.note.mean
			if e.downloaded isnt '-1'
				showEpisodes[e.global].downloaded = e.downloaded is '1'
			DB.set 'show.' + e.url + '.episodes', showEpisodes
			
			# cache des épisodes déjà vus
			if e.url of memberEpisodes
				today = Math.floor new Date().getTime() / 1000
				memberEpisodes[e.url].nbr_total++ if e.date <= today
			else
				memberEpisodes[e.url] = 
					start: e.global
					nbr_total: 1

			j++
		
		DB.set 'member.' + @login + '.shows', shows
		DB.set 'member.' + @login + '.episodes', memberEpisodes
		Badge.set 'total_episodes', j
	
	content: ->
		# récupération des épisodes non vus (cache)
		data = DB.get 'member.' + @login + '.episodes', null
		return Fx.needUpdate() if !data
		
		shows = DB.get 'member.' + @login + '.shows', null
		return Fx.needUpdate() if !shows

		# mise à jour des notifications
		if Fx.logged()
			if DB.get('options').display_notifications_icon
				nbr = Fx.checkNotifications()
				$('.notif').html(nbr).show() if nbr > 0
			else
				$('#notifications').hide()	

		# Mise à jour des notifications new_episodes
		Badge.set 'new_episodes', 0
		DB.set 'new_episodes_checked', date('Y.m.d')
			
		# SHOWS
		output = '<div id="shows">'
		
		for i, j of data
			# récupération des infos sur la *série*
			s = shows[i]

			# SHOW
			output += '<div id="' + i + '" class="show">'
			
			# construction du bloc *série*
			output += Content.show s, j.nbr_total
			
			# construction des blocs *episode*
			nbr_episodes_per_serie = DB.get('options').nbr_episodes_per_serie
			showEpisodes = DB.get('show.' + i + '.episodes')
			global = j.start
			while (global of showEpisodes and global - j.start < nbr_episodes_per_serie)
				e = showEpisodes[global]
				today = Math.floor new Date().getTime() / 1000
				global++
				output += Content.episode(e, s.title, s.hidden) if e.date <= today
			
			output += '</div>'
		
		###
		output += '<div id="noEpisodes">'
		output += __('no_episodes_to_see') 
		output += '<br /><br /><a href="#" onclick="BS.load(\'searchForm\').display(); return false;">'
		output += '<img src="../img/film_add.png" class="icon2" />' + __('add_a_show') + '</a>'
		output += '</div>'
		###
		
		output += '</div>'
		
		return output

	listen: ->

		# Open episode view
		$('.display_episode').click ->
			event.preventDefault()
			url = $(@).attr 'url'
			season = $(@).attr 'season'
			episode = $(@).attr 'episode'
			global = $(@).attr 'global'
			app.view.load 'Episode', url, season, episode, global

		# Open episode
		$('.display_comments').click ->
			event.preventDefault()
			url = $(@).attr 'url'
			season = $(@).attr 'season'
			episode = $(@).attr 'episode'
			global = $(@).attr 'global'
			app.view.load 'EpisodeComments', url, season, episode, global