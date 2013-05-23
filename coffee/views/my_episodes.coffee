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

		# Episode HOVER
		$('.MyEpisodes').on 'mouseenter', '.episode', ->
			$(@).find('.watched').attr('src', '../img/arrow_right.png').css('opacity', 0.5)
		$('.MyEpisodes').on 'mouseleave', '.episode', ->
			start = parseInt $(this).closest('.show').attr 'start'
			e = $(this).closest('.episode')

			if (e.attr('global') < start)
				e.find('.watched').attr('src', '../img/tick.png').css('opacity', 0.5)
			else
				e.find('.watched').attr('src', '../img/empty.png')

		# Mark one or more episodes as seen
		$('.MyEpisodes').on 'click', '.watched', -> 
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest('.episode')
			season = e.attr 'season'
			episode = e.attr 'episode'
			login = DB.get('session').login
			enable_ratings = DB.get('options').enable_ratings

			# Cache : mise à jour du dernier épisode marqué comme vu
			es = DB.get 'member.' + login + '.episodes'
			es[show].start = "" + (parseInt(e.attr 'global') + 1)
			
			# On cache les div
			nbr = 0
			while e.hasClass 'episode'
				nbr++
			
				if enable_ratings
					# on enlève la possibilité de re-marquer comme vu (alors que c'est en cours)
					$(e).css 'background-color', '#f5f5f5'
					$(e).find('.watched').removeClass 'watched'
					
					# affichage des étoiles
					$(e).find('.wrapper-comments').hide()
					$(e).find('.wrapper-recover').hide()
					$(e).find('.wrapper-subtitles').hide()
					$(e).find('.wrapper-rate').css 'display', 'inline-block'
				else
					Fx.clean e
				
				# sélection de l'épisode précédent	
				e = e.prev()
			
			# Cache : mise à jour du nbr d'épisodes restants
			es[show].nbr_total -= nbr
			if es[show].nbr_total is 0
				delete es[show]
			
			# Requête
			params = "&season=" + season + "&episode=" + episode
			ajax.post "/members/watched/" + show, params, 
				->
					DB.set 'member.' + login + '.episodes', es
					Cache.force 'MemberTimeline'
					badge_notification_type = DB.get('options').badge_notification_type
					if badge_notification_type is 'watched'
						total_episodes = DB.get('badge').total_episodes
						Badge.set 'total_episodes', total_episodes - nbr
				-> 
					registerAction "/members/watched/" + show, params
		$('.MyEpisodes').on 'mouseenter', '.watched', ->
			e = $(this).closest('.episode')
			while e.hasClass 'episode'
				e.find('.watched').css 'opacity', 1
				e = e.prev()
		$('.MyEpisodes').on 'mouseleave', '.watched', ->
			e = $(this).closest('.episode')
			while e.hasClass 'episode'
				e.find('.watched').css 'opacity', 0.5
				e = e.prev()

		# Rate an episode
		$('.MyEpisodes').on 'mouseenter', '.star', ->
			nodeStar = $(this)
			while nodeStar.hasClass 'star'
				nodeStar.attr 'src', '../img/star.gif'
				nodeStar = nodeStar.prev()
		$('.MyEpisodes').on 'mouseleave', '.star', ->
			nodeStar = $(this)
			while nodeStar.hasClass 'star'
				nodeStar.attr 'src', '../img/star_off.gif'
				nodeStar = nodeStar.prev()
		$('.MyEpisodes').on 'click', '.star', ->
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest '.episode'
			Fx.clean e
			
			# On marque comme vu EN notant
			season = e.attr 'season'
			episode = e.attr 'episode'
			rate = $(this).attr('id').substring 4
			params = "&season=" + season + "&episode=" + episode + "&note=" + rate
			ajax.post "/members/note/" + show, params, 
				-> 
					Cache.force 'MemberTimeline'
				->
					registerAction "/members/watched/" + show, params
			
		# Do not rate an episode
		$('.MyEpisodes').on 'click', '.close_stars', ->
			e = $(this).closest '.episode'
			Fx.clean e

		# Mark an episode as recover or not
		$('.MyEpisodes').on 'click', '.downloaded', ->
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest('.episode')
			season = e.attr 'season'
			episode = e.attr 'episode'
			global = e.attr 'global'
			
			# mise à jour du cache
			es = DB.get 'show.' + show + '.episodes'
			downloaded = es[global].downloaded
			es[global].downloaded = !downloaded
			DB.set 'show.' + show + '.episodes', es
			
			# modification de l'icône
			if downloaded
				$(this).attr 'src', '../img/folder_off.png'
			else 
				$(this).attr 'src', '../img/folder.png'
			
			# envoi de la requête
			params = "&season=" + season + "&episode=" + episode
			ajax.post "/members/downloaded/" + show, params, 
				-> 
					badge_notification_type = DB.get('options').badge_notification_type
					if badge_notification_type is 'downloaded'
						downloaded_episodes = DB.get('badge').downloaded_episodes
						if es[global].downloaded
							downloaded_episodes--
						else
							downloaded_episodes++
						Badge.set 'downloaded_episodes', downloaded_episodes
				-> registerAction "/members/downloaded/" + show, params

		# Copy the title episode to the clipboard
		$('.MyEpisodes').on 'click', '.copy_episode', ->
			event.preventDefault()
			sanbox = $(@).find('textarea')
			sanbox.show()
			sanbox.select()
			document.execCommand('copy')
			sanbox.hide()
			Fx.message __('copied_to_clipboard')
			$(@).focus()

		# Open serie view
		$('.MyEpisodes').on 'click', '.display_show', ->
			event.preventDefault()
			url = $(@).attr 'url'
			app.view.load 'Show', url

		# Open episode view
		$('.MyEpisodes').on 'click', '.display_episode', ->
			event.preventDefault()
			url = $(@).attr 'url'
			season = $(@).attr 'season'
			episode = $(@).attr 'episode'
			global = $(@).attr 'global'
			app.view.load 'Episode', url, season, episode, global

		# Open serie episodes view
		$('.MyEpisodes').on 'click', '.display_episodes', ->
			event.preventDefault()
			url = $(@).attr 'url'
			app.view.load 'ShowEpisodes', url

		# Open episode comments
		$('.MyEpisodes').on 'click', '.display_comments', ->
			event.preventDefault()
			url = $(@).attr 'url'
			season = $(@).attr 'season'
			episode = $(@).attr 'episode'
			global = $(@).attr 'global'
			app.view.load 'EpisodeComments', url, season, episode, global

		# Show/hide a serie
		$('.MyEpisodes').on 'click', '.toggleShow', ->
			show = $(@).closest('.show')
			showName = $(show).attr 'id'
			login = DB.get('session').login
			shows = DB.get 'member.' + login + '.shows'
			hidden = shows[showName].hidden
			shows[showName].hidden = !hidden
			DB.set 'member.' + login + '.shows', shows
				
			$(show).find('.episode').slideToggle()
			
			if shows[showName].hidden
				$(@).attr 'src', '../img/arrow_right.gif'
			else
				$(@).attr 'src', '../img/arrow_down.gif'
			
			Fx.updateHeight()

		# Download episode subtitle
		$('.MyEpisodes').on 'click', '.subs', -> 
			Fx.openTab $(this).attr 'link'
			return false
