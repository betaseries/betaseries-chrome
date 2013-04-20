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