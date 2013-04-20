class View_ShowEpisodes

	init: (url) =>
		@id = 'ShowEpisodes.' + url
		@url = '/shows/episodes/' + url
		@episodes = DB.get 'show.' + url + '.episodes'
		@show = url
		@name = 'ShowEpisodes'
		@params = '&summary=1&hide_notes=1'
		@root = 'seasons'
		@login = DB.get('session')?.login
	
	update: (data) ->
		shows = DB.get 'member.' + @login + '.shows', {}
		
		# cache des infos de la *série*
		if @show of shows
			# cas où on enlève une série des archives depuis le site
			shows[@show].archive = false
		else
			shows[@show] =
				url: @show
				#title: @show
				archive: false
				hidden: false

		# cache des infos de *épisode*
		showEpisodes = DB.get 'show.' + @show + '.episodes', {}
		for i, seasons of data
			for j, e of seasons.episodes
				n = Fx.splitNumber(e.number);
				showEpisodes[e.global] =
					comments: e.comments
					date: e.date
					downloaded: e.downloaded is '1'
					episode: n.episode
					global: e.global
					number: e.number
					season: n.season
					title: e.title
					show: @show
					url: @show
					#subs: e.subs
				if e.downloaded isnt '-1'
					showEpisodes[e.global].downloaded = e.downloaded is '1'
		
		DB.set 'show.' + @show + '.episodes', showEpisodes
		DB.set 'member.' + @login + '.shows', shows
	
	content: ->
		data = DB.get 'show.' + @show + '.episodes', null
		return Fx.needUpdate() if !data

		episodes = DB.get 'member.' + @login + '.episodes', null
		return Fx.needUpdate() if !episodes

		shows = DB.get 'member.' + @login + '.shows', null
		return Fx.needUpdate() if !shows

		# récupération des infos sur la *série*
		s = shows[@show]

		# on compte le nombre d'épisodes par saisons
		seasons = {}
		lastSeason = -1
		nbrEpisodes = 0
		for i, e of data
			nbrEpisodes++
			lastSeason = e.season
			if e.season of seasons
				seasons[e.season]++
			else
				seasons[e.season] = 1

		start = if @show of episodes then episodes[@show].start else nbrEpisodes
			
		# SEASONS
		output = '<div id="' + @show + '" class="show" start="' + start + '">'
		
		season = -1;
		for i, e of data
			hidden = e.season isnt lastSeason
			classHidden = if hidden then ' hidden' else ''
			
			if (e.season isnt season)
				# construction du bloc *season*
				output += '</div>' if season isnt -1
				output += '<div class="season' + classHidden + '" id="season' + e.season + '">'
				output += Content.season e.season, seasons[e.season], hidden
				season = e.season
			
			# construction des blocs *episode*
			
			output += Content.episode e, s.title, hidden, start
		
		output += '</div></div>'
		
		return output

	listen: ->

		# Mark on or more episodes as seen
		$('.watched').on 
			click: -> 
				s = $(this).closest '.show'
				show = s.attr 'id'
				start = parseInt s.attr 'start'
				
				e = $(this).closest '.episode'
				newStart = parseInt(e.attr('global')) + 1
				s.attr 'start', newStart
				season = e.attr 'season'
				episode = e.attr 'episode'

				# Cache : mise à jour du dernier épisode marqué comme vu
				login = DB.get('session').login
				es = DB.get 'member.' + login + '.episodes'
				if (not show in es) then es[show] = {}
				es[show].start = "" + newStart
				es[show].nbr_total += start - newStart
				if es[show].nbr_total is 0 then delete es[show]
				
				# Mise à jour des plots
				$('.show').find('.episode').each (i) -> 
					if $(@).attr('global') <= newStart - 1
						$(@).find('.watched').attr('src', '../img/tick.png').css('opacity', 0.5)
					else
						$(@).find('.watched').attr('src', '../img/empty.png')
				
				# Requête
				params = "&season=" + season + "&episode=" + episode
				ajax.post "/members/watched/" + show, params, 
					->
						DB.set 'member.' + login + '.episodes', es
						Cache.force 'MemberTimeline'
						badge_notification_type = DB.get('options').badge_notification_type
						if badge_notification_type is 'watched'
							Badge.searchEpisodes()
					-> 
						registerAction "/members/watched/" + show, params
				
			mouseenter: ->
				e = $(this).closest('.episode')
				e.find('.watched').attr('src', '../img/arrow_right.png').css('opacity', 1)
				
			mouseleave: ->
				start = parseInt $(this).closest('.show').attr 'start'
				e = $(this).closest('.episode')

				if (e.attr('global') < start)
					e.find('.watched').attr('src', '../img/tick.png').css('opacity', 0.5)
				else
					e.find('.watched').attr('src', '../img/empty.png')

		# Mark an episode as recover
		$('.downloaded').on 'click', ->
			event.preventDefault()
			
			show = $(@).attr 'show'
			season = $(@).attr 'season'
			episode = $(@).attr 'episode'
			global = $(@).attr 'global'
			
			# mise à jour du cache
			es = DB.get 'show.' + show + '.episodes'
			downloaded = es[global].downloaded
			es[global].downloaded = !downloaded
			DB.set 'show.' + show + '.episodes', es
			
			# modification de l'icône
			$(@).find('span').toggleClass 'imgSyncOff imgSyncOn'
			dl = if downloaded then 'mark_as_dl' else 'mark_as_not_dl'

			# envoi de la requête
			params = "&season=" + season + "&episode=" + episode
			ajax.post "/members/downloaded/" + show, params, 
				=>
					Cache.force 'MyEpisodes.all'
					badge_notification_type = DB.get('options').badge_notification_type
					if badge_notification_type is 'downloaded'
						Badge.searchEpisodes()
					$(@).html '<span class="imgSyncOff"></span>' + __(dl)
				-> 
					registerAction "/members/downloaded/" + show, params

		# Show/hide season
		$('.toggleSeason').on 'click', ->
			season = $(@).closest('.season')
			hidden = $(season).hasClass('hidden')
			$(season).toggleClass('hidden')
			$(season).find('.episode').slideToggle()
			
			if hidden
				$(@).attr 'src', '../img/arrow_down.gif'
			else
				$(@).attr 'src', '../img/arrow_right.gif'
			
			Fx.updateHeight()
