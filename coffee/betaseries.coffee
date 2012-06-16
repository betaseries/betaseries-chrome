menu = 
	show: -> $('.action').show()
	hide: -> $('.action').hide()
	hideStatus: -> $('#status').hide()
	hideMenu: -> $('#menu').hide()

BS = 
	
	## Vue courante
	currentView: null
	
	## Lancer l'affichage d'une vue
	load: ->
		
		# arguments
		args = Array.prototype.slice.call arguments
		
		# infos de la vue
		o = BS[arguments[0]].apply(args.shift(), args)
		
		# réaffichage de la vue ?
		sameView = @currentView? and o.id is @currentView.id
		
		# mémorisation de la vue
		@currentView = o;
		
		# affichage de la vue (cache)
		BS.display() if !sameView
		
		# mise à jour des données
		if o.update?
			# on montre le bouton #sync
			$('#sync').show()	
		
			# heure actuelle à la seconde près
			time = (new Date().getDate()) + '.' + (new Date().getFullYear())
			
			views = DB.get 'views'
			outdated = if views[o.id]? then views[o.id].time isnt time else true
			force = if views[o.id]? then views[o.id].force else true
			
			# on lance la requête de mise à jour ssi ça doit l'être
			BS.update() if (outdated or force)
		
		# on cache le bouton #sync
		else
			$('#sync').hide()	
	
	## Mettre à jour les données de la vue courante	
	update: ->
		# infos de la vue
		o = @currentView
		
		# paramètres
		params = o.params || ''
		
		if o.url?
			ajax.post o.url, params, 
				(data) ->
					# réception des données
					cache = data.root[o.root]
					
					# infos de la vue
					time = (new Date().getDate()) + '.' + (new Date().getFullYear())
					views = DB.get 'views'
					views[o.id] = 
						time: time
						force: false
					DB.set 'views', views
						
					# mise à jour du cache
					o.update(cache)
					
					# affichage de la vue courante (cache)
					BS.display()
		
		# requête qui ne requiert pas l'API BetaSeries
		# la requête devra gérer elle-même le BS.display()
		else
			o.update()
		
	## Afficher la vue courante avec les données en cache		
	display: ->
		# infos de la vue
		o = @currentView
		
		# mise à jour de l'historique
		Historic.save()
		
		# affichage de la vue (cache)
		document.getElementById('page').innerHTML = ''
		$('#page').html o.content() if o.content
		
		# Post affichage
		#if o.after?
		#	$(document).ready ->
		#		o.after()
		
		# Titre et classe
		$('#title').text __('title_' + o.name)
		$('#page').removeClass().addClass o.name
		
		# Hauteur du popup
		Fx.updateHeight()
			
	## Réactualise la vue courante
	refresh: ->
		Fx.toUpdate @currentView.id
		args = @currentView.id.split '.'
		BS.load.apply BS, args
	
	#
	showsDisplay: (url) ->
		id: 'showsDisplay.' + url
		name: 'showsDisplay'
		url: '/shows/display/' + url
		root: 'show'
		login: DB.get('session').login
		show: url
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
			output += '<a href="" class="link" onclick="BS.load(\'showsEpisodes\', \'' + data.url + '\'); return false;"><span class="imgSyncNo"></span>Voir les épisodes</a>'
			if data.is_in_account and data.archive
				output += '<a href="#' + data.url + '" id="showsUnarchive" class="link">' + '<span class="imgSyncOff"></span>' + __('show_unarchive') + '</a>'
			else if data.is_in_account and !data.archive
				output += '<a href="#' + data.url + '" id="showsArchive" class="link">' + '<span class="imgSyncOff"></span>' + __('show_archive') + '</a>'
			if data.is_in_account
				output += '<a href="#' + data.url + '" id="showsRemove" class="link">' + '<span class="imgSyncOff"></span>' + __('show_remove') + '</a>'
			else
				output += '<a href="#' + data.url + '" id="showsAdd" class="link">' + '<span class="imgSyncOff"></span>' + __('show_add') + '</a>'
			
			return output
	
	#
	showsEpisodes: (url) ->
		id: 'showsEpisodes.' + url
		name: 'showsEpisodes'
		url: '/shows/episodes/' + url
		params: '&summary=1&hide_notes=1'
		root: 'seasons'
		login: DB.get('session').login
		episodes: DB.get 'show.' + url + '.episodes'
		show: url
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
				
				output += Content.episode2 e, hidden, start
			
			output += '</div></div>'
			
			return output
	#
	showsEpisode: (url, season, episode, global) ->
		id: 'showsEpisode.' + url + '.' + season + '.' + episode + '.' + global
		name: 'showsEpisode'
		url: '/shows/episodes/' + url
		params: '&season=' + season + '&episode=' + episode
		root: 'seasons'
		episodes: DB.get 'show.' + url + '.episodes'
		show: url
		global: global
		update: (data) ->
			e = data['0']['episodes']['0']
			eps = if @episodes? then @episodes else {}
			ep = if @global of eps then eps[@global] else {}
			ep.comments = e.comments if e.comments?
			ep.date = e.date if e.date?
			ep.description = e.description if e.description?
			ep.downloaded = e.downloaded if e.downloaded?
			ep.episode = e.episode if e.episode?
			ep.global = e.global if e.global?
			ep.number = e.number if e.number?
			ep.screen = e.screen if e.screen?
			ep.show = e.show if e.show?
			ep.subs = e.subs if e.subs?
			ep.title = e.title if e.title?
			ep.url = @show
			eps[@global] = ep
			DB.set 'show.' + @show + '.episodes', eps
			@episodes = eps
		content: ->
			return Fx.needUpdate() if !@episodes?[@global]?
			
			e = @episodes[@global]
			
			title = if DB.get('options').display_global then '#' + e.global + ' ' + e.title else e.title
			
			output = '<div class="title">'
			output += '<div class="fleft200"><a href="" onclick="BS.load(\'showsDisplay\', \'' + @show + '\'); return false;" class="showtitle">' + e.show + '</a></div>'
			output += '<div class="fright200 aright">'
			if e.note?
				note = Math.floor e.note.mean
				for i in [1..note]
					output += '<img src="../img/star.gif" /> '
			output += '</div>'
			output += '<div class="clear"></div>'
			output += '</div>'

			output += '<div>'
			output += ' <div class="fleft200">'
			output += '  <span class="num">' + Fx.displayNumber(e.number) + '</span> ' + e.title
			output += ' </div>'
			if e.note?.mean? then output += ' <div class="fright200 aright">' + e.note.mean + '/5 (' + e.note.members + ')' + '</div>'
			output += ' <div class="clear"></div>'
			output += '</div>'

			if e.screen?
				output += '<div style="height: 70px; overflow: hidden; margin-top: 10px;"><img src="' + e.screen + '" style="width: 290px; margin-top: -15px;" /></div>'

			output += '<div class="title2">' + __('synopsis') + '</div>'
			output += '<div style="text-align: justify; margin-right: 5px;">' + e.description + '</div>'
			#output += ' <br /><i>' + date('D d F', e.date) + '</i>'
			
			output += '<div class="title2">' + __('subtitles') + '</div>'
			nbr_subs = 0
			for n of e.subs
				sub = e.subs[n]
				output += '[' + sub.quality + '] ' + sub.language + ' <a href="" class="subs" title="' + sub.file + '" link="' + sub.url + '">' + Fx.subLast(sub.file, 20) + '</a> (' + sub.source + ')<br />'
				nbr_subs++
			output += __('no_subs') if nbr_subs is 0
			
			output += '<div class="title2">' + __('actions') + '</div>'
			
			# Voir les commentaires
			output += '<a href="#" class="link" onclick="BS.load(\'commentsEpisode\', \'' + e.url + '\', \'' + e.season + '\', \'' + e.episode + '\', \'' + e.global + '\'); return false;">'
			output += '<span class="imgSyncNo"></span>' + __('see_comments', e.comments) + '</a>'
			
			# Marquer comme récupéré ou pas
			dl = if e.downloaded then 'mark_as_not_dl' else 'mark_as_dl'
			output += '<a href="#" class="link downloaded" show="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" onclick="return false;">'
			output += '<span class="imgSyncOff"></span>' + __(dl) + '</a>'
			
			return output
	
	#
	planningMember: (login) ->
		login ?= DB.get('session').login
		
		id: 'planningMember.' + login
		name: 'planningMember'
		url: '/planning/member/' + login
		params: "&view=unseen"
		root: 'planning'
		login: login
		update: (data) ->
			DB.set 'member.' + @login + '.planning', data
		content: ->	
			output = ''
			week = 100
			MAX_WEEKS = 2
			nbrEpisodes = 0
			
			data = DB.get 'member.' + @login + '.planning', null
			return Fx.needUpdate() if !data
			
			for e of data
				today = Math.floor new Date().getTime() / 1000
				todayWeek = parseFloat date('W', today)
				actualWeek = parseFloat date('W', data[e].date)
				diffWeek = actualWeek - todayWeek
				plot = if data[e].date < today then "orange" else "red"
				if actualWeek isnt week
					week = actualWeek
					hidden = ""
					if diffWeek < -1 
						w = __('weeks_ago', [Math.abs diffWeek])
					else if diffWeek is -1
						w = __('last_week')
					else if diffWeek is 0
						w = __('this_week')
					else if diffWeek is 1
						w = __('next_week')
					else if diffWeek > 1
						w = __('next_weeks', [diffWeek])
					if diffWeek < -2 or diffWeek > 2
						hidden = ' style="display:none"'
					if nbrEpisodes > 0
						output += '</div>'
					output += '<div class="week"' + hidden + '>'
					output += '<div class="title">' + w + '</div>'
			
				output += '<div class="episode ' + date('D', data[e].date).toLowerCase() + '">'
				
				output += '<div url="' + data[e].url + '" season="' + data[e].season + '" episode="' + data[e].episode + '" class="left">'
				output += '<img src="../img/empty.png" width="11" /> '
				output += '<span class="num">' + Fx.displayNumber(data[e].number) + '</span> '
				output += '<a href="#" onclick="BS.load(\'showsEpisode\', \'' + data[e].url + '\', \'' + data[e].season + '\', \'' + data[e].episode + '\', \'' + data[e].global + '\'); return false;" title="' + data[e].show + '" class="epLink">'
				output += data[e].show + '</a> '
				output += '</div>'
				
				output += '<div class="right">'
				output += '<span class="date">' + date('D d F', data[e].date) + '</span>'
				output += '</div>'
				
				output += '</div>'
				
				nbrEpisodes++
			return output
	
	#
	membersInfos: (login) ->
		login ?= DB.get('session').login
		
		id: 'membersInfos.' + login
		name: 'membersInfos'
		url: '/members/infos/' + login
		root: 'member'
		login: login
		update: (data) ->
			member = DB.get 'member.' + @login + '.infos', {}
			member.login = data.login
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
			output += '<div class="showtitle">' + data.login + '</div>'
			output += '<img src="../img/avatar.png" width="50" id="avatar" style="position:absolute; right:0;" />'
			output += '<div class="episode lun"><img src="../img/infos.png" class="icon"> ' + __('nbr_friends', [data.stats.friends]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/medal.png" class="icon"> ' + __('nbr_badges', [data.stats.badges]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/episodes.png" class="icon"> ' + __('nbr_shows', [data.stats.shows]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/report.png" class="icon"> ' + __('nbr_seasons', [data.stats.seasons]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/script.png" class="icon"> ' + __('nbr_episodes', [data.stats.episodes]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/location.png" class="icon">' + data.stats.progress + ' <small>(' + __('progress') + ')</small></div>'
			
			if data.is_in_account?
				output += '<div class="showtitle">' + __('actions') + '</div>'
				if !data.is_in_account
					output += '<div class="episode"><img src="../img/friend_add.png" id="friendshipimg" style="margin-bottom: -4px;" /> <a href="#" id="addfriend" login="' + data.login + '">' + __('add_to_friends', [data.login]) + '</a></div>'
				else
					output += '<div class="episode"><img src="../img/friend_remove.png" id="friendshipimg" style="margin-bottom: -4px;"  /> <a href="#" id="removefriend" login="' + data.login + '">' + __('remove_to_friends', [data.login]) + '</a></div>'
			
			return output
	
	membersShows: (login) ->
		login ?= DB.get('session').login
		
		id: 'membersShows.' + login
		name: 'membersShows'
		url: '/members/infos/' + login
		root: 'member'
		login: login
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
				output += '<a href="" onclick="BS.load(\'showsDisplay\', \'' + show.url + '\'); return false;" class="epLink">' + show.title + '</a>'
				output += '</div>'
			return output
			
	#
	membersEpisodes: (lang) ->
		lang ?= 'all'
		
		id: 'membersEpisodes.' + lang
		name: 'membersEpisodes',
		url: '/members/episodes/' + lang
		root: 'episodes'
		login: DB.get('session').login
		update: (data) ->
			shows = DB.get 'member.' + @login + '.shows', {}
			memberEpisodes = {}
				
			for d, e of data
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
					downloaded: e.downloaded is '1'
					episode: e.episode
					global: e.global
					number: e.number
					season: e.season
					title: e.title
					show: e.show
					url: e.url
					subs: e.subs
				DB.set 'show.' + e.url + '.episodes', showEpisodes
				
				# cache des épisodes déjà vus
				if e.url of memberEpisodes
					today = Math.floor new Date().getTime() / 1000
					memberEpisodes[e.url].nbr_total++ if e.date <= today
				else
					memberEpisodes[e.url] = 
						start: e.global
						nbr_total: 1
			
			DB.set 'member.' + @login + '.shows', shows
			DB.set 'member.' + @login + '.episodes', memberEpisodes
			bgPage.Badge.updateCache()
		content: ->
			# récupération des épisodes non vus (cache)
			data = DB.get 'member.' + @login + '.episodes', null
			return Fx.needUpdate() if !data
			
			shows = DB.get 'member.' + @login + '.shows', null
			return Fx.needUpdate() if !shows
				
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
					output += Content.episode(e, s) if e.date <= today
				
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
	
	#
	membersNotifications: () ->
		id: 'membersNotifications'
		name: 'membersNotifications'
		url: '/members/notifications'
		root: 'notifications'
		login: DB.get('session').login
		update: (tab1) ->
			tab2 = DB.get 'member.' + @login + '.notifs', {}
			notifications = Fx.concat tab1, tab2
			DB.set 'member.' + @login + '.notifs', notifications
		content: ->
			output = ''
			nbrNotifications = 0
			time = ''
			
			data = DB.get 'member.' + @login + '.notifs', null
			return Fx.needUpdate() if !data
			
			for n of data
				new_date = date('D d F', data[n].date)
				if new_date isnt time
					time = new_date
					output += '<div class="showtitle">' + time + '</div>'
				output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">'
				output += data[n].html
				output += '</div>'
				nbrNotifications++	
			
			bgPage.Badge.update()
			output += __('no_notifications') if nbrNotifications is 0
			return output
	
	## Section "commentaires d'un épisode"
	commentsEpisode: (url, season, episode, global) ->
		id: 'commentsEpisode.' + url + '.' + season + '.' + episode + '.' + global
		name: 'commentsEpisode'
		url: '/comments/episode/' + url
		params: '&season=' + season + '&episode=' + episode
		root: 'comments'
		show: url
		global: global
		update: (data) ->
			comments = DB.get 'show.' + @show + '.' + @global + '.comments', {}
			
			# récupération de commentaires en cache
			nbrComments = comments.length
			
			# mise à jour du cache
			for i, comment of data
				if i < nbrComments
					continue
				else
					comments[i] = comment
			
			# mise à jour du cache
			DB.set 'show.' + @show + '.' + @global + '.comments', comments
		content: ->
			i = 1
			time = ''
			show = ''
			output = '<div class="showtitle">' + show + '</div>';
			
			data = DB.get 'show.' + @show + '.' + @global + '.comments', null
			return Fx.needUpdate() if !data
			
			for n of data
				new_date = date('D d F', data[n].date)
				if new_date isnt time
					time = new_date
					output += '<div class="showtitle">' + time + '</div>'
				
				output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">'
				output += '<b>' + date('H:i', data[n].date) + '</b> '
				output += '<span class="login">' + data[n].login + '</span> '
				output += '<small>#' + i + '</small><br />'
				output += data[n].text
				output += '</div>'
				i++
			
			output += __('no_comments') if i is 1
			return output
	
	#
	timelineFriends: ->
		id: 'timelineFriends'
		name: 'timelineFriends'
		url: '/timeline/friends'
		params: '&number=10'
		root: 'timeline'
		login: DB.get('session').login
		update: (data) ->
			DB.set 'member.' + @login + '.timeline', data
		content: ->
			output = ''
			time = ''
			
			data = DB.get 'member.' + @login + '.timeline', null
			return Fx.needUpdate() if !data
			
			for n of data
				new_date = date('D d F', data[n].date)
				if new_date isnt time
					time = new_date
					output += '<div class="showtitle">' + time + '</div>'
				
				output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">'
				output += '<b>' + date('H:i', data[n].date) + '</b> '
				output += '<span class="login">' + data[n].login + '</span> ' + data[n].html
				output += '</div>'
			return output
	
	#
	connection: ->
		id: 'connection'
		name: 'connection'
		content: ->
			menu.hide()
			output = '<div style="height:10px;"></div>';
			output += '<form id="connect">'
			output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>'
			output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>'
			output += '</table>'
			output += '<div class="valid"><input type="submit" value="' + __('sign_in') + '"> ou '
			output += '	<a href="#" onclick="BS.load(\'registration\'); return false;">' + __('sign_up') + '</a></div>'
			output += '</form>'
			return output
	
	#
	registration: ->
		id: 'registration'
		name: 'registration'
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
			output += '	<a href="#" onclick="BS.load(\'connection\'); return false;">' + __('sign_in') + '</a></div>'
			output += '</form>'
			return output
	
	#
	searchShow: ->
		id: 'searchShow'
		name: 'searchShow'
		content: ->
			output = '<div style="height:10px;"></div>';
			output += '<form id="searchForShow">'
			output += '<input type="text" name="terms" id="terms" /> '
			output += '<input type="submit" value="chercher" />'
			output += '</form>'
			output += '<div id="results"></div>'
			setTimeout (() -> $('#terms').focus()), 100
			return output
			
	#
	searchMember: ->
		id: 'searchMember'
		name: 'searchMember'
		content: ->
			output = '<div style="height:10px;"></div>';
			output += '<form id="searchForMember">'
			output += '<input type="text" name="terms" id="terms" /> '
			output += '<input type="submit" value="chercher" />'
			output += '</form>'
			output += '<div id="results"></div>'
			setTimeout (() -> $('#terms').focus()), 100
			return output
	
	#
	blog: ->
		id: 'blog'
		name: 'blog'
		update: ->
			$.ajax
				type: 'GET'
				url: 'https://www.betaseries.com/blog/feed/'
				dataType: 'xml'
				async: false
				success: (data) ->
					items = $(data).find 'item'
					blog = []
					for i in [0..(Math.min 10, items.length)]
						item = $(items[i])
						article = {}
						article.title = item.find('title').text()
						article.description = item.find('description').text()
						article.link = item.find('link').text()
						blog.push article
					# on met à jour le cache
					DB.set 'blog', blog
					# on mets à jour l'affichage
					BS.display()
		content: ->
			output = ''
			
			data = DB.get 'blog', null
			return Fx.needUpdate() if !data
			
			for article, i in data
				title = article.title.substring 0, 40
				title += '..' if article.title.length > 40
				
				output += '<div class="showtitle">' + title
				#output += ' <span class="date">'+date('D d F', data[n].date)+'</span>';
				output += '</div>'
				
				link = '<a href="#" onclick="Fx.openTab(\'' + article.link + '\');">(' + __('read_article') + ')</a>'
				output += '<div>' + article.description.replace(/<a(.*)a>/, link) + '</div>'
				
				output += '<div style="height:11px;"></div>'
						
			return output
			
	#
	cache: ->
		id: 'cache'
		name: 'cache'
		content: ->
			output = ''
			
			output += '<div class="showtitle">Total</div>'
			output += '<div class="episode">'
			output += ' <div class="left">Taille du cache</div>'
			output += ' <div class="right">' + Fx.getCacheFormat(Fx.getCacheSize())  + '</div>'
			output += ' <div class="clear"></div>'
			output += '</div>'
			
			privates = [
				'badge'
				'historic'
				'length'
				'options'
				'session'
				'views'
			]
			
			data = []
			output += '<div class="showtitle">Détail</div>'
			for i, size of localStorage
				if !(i in privates) 
					data.push [i, Fx.getCacheSize(i)]
			
			#console.log data
			data.sort((a, b) ->	b[1] - a[1])
			#console.log data
			
			for d, i in data
				output += '<div class="episode">'
				output += ' <div class="left">' + d[0] + '</div>'
				output += ' <div class="right">' + Fx.getCacheFormat(d[1]) + '</div>'
				output += ' <div class="clear"></div>'
				output += '</div>'
			
			return output
			
	##	
	menu: ->
		id: 'menu'
		name: 'menu'
		content: ->
			output = ''
			
			output += '<a href="" onclick="BS.load(\'timelineFriends\'); return false;">'
			output += '<img src="../img/timeline.png" id="timeline" class="action" style="margin-bottom:-3px;" />'
			output += __('menu_timelineFriends') + '</a>'
			
			output += '<a href="" onclick="BS.load(\'planningMember\', \'' + DB.get('session').login + '\'); return false;">'
			output += '<img src="../img/planning.png" id="planning" class="action" style="margin-bottom:-3px;" />'
			output += __('menu_planningMember') + '</a>'
			
			output += '<a href="" onclick="BS.load(\'membersEpisodes\'); return false;">'
			output += '<img src="../img/episodes.png" id="episodes" class="action" style="margin-bottom:-3px;" />'
			output += __('menu_membersEpisodes') + '</a>'
			
			output += '<a href="" onclick="BS.load(\'membersShows\', \'' + DB.get('session').login + '\'); return false;">'
			output += '<img src="../img/episodes.png" id="shows" class="action" style="margin-bottom:-3px;" />'
			output += __('menu_membersShows') + '</a>'
			
			output += '<a href="" onclick="BS.load(\'membersInfos\', \'' + DB.get('session').login + '\'); return false;">'
			output += '<img src="../img/infos.png" id="infos" class="action" style="margin-bottom:-3px; margin-right: 9px;" />'
			output += __('menu_membersInfos') + '</a>'
			
			output += '<a href="" onclick="BS.load(\'membersNotifications\'); return false;">'
			output += '<img src="../img/notifications.png" id="notifications" class="action" style="margin-bottom:-3px;" />'
			output += __('menu_membersNotifications') + '</a>'
			
			output += '<a href="" onclick="BS.load(\'searchShow\'); return false;">'
			output += '<img src="../img/search.png" id="search" class="action" style="margin-bottom:-3px;" />'
			output += __('menu_searchShow') + '</a>'
			
			output += '<a href="" onclick="BS.load(\'searchMember\'); return false;">'
			output += '<img src="../img/search.png" id="search" class="action" style="margin-bottom:-3px;" />'
			output += __('menu_searchMember') + '</a>'
			
			output += '<a href="" onclick="BS.load(\'blog\'); return false;">'
			output += '<img src="../img/blog.png" id="blog" class="action" style="margin-bottom:-3px;" />'
			output += __('menu_blog') + '</a>'
			
			output += '<a href="" onclick="BS.load(\'cache\'); return false;">'
			output += '<img src="../img/cache.png" id="cache" class="action" style="margin-bottom:-3px;" />'
			output += __('menu_cache') + '</a>'
			
			output += '<a href="" onclick="Fx.openTab(chrome.extension.getURL(\'../html/options.html\'), true); return false;">'
			output += '<img src="../img/options.png" id="options" class="options" style="margin-bottom:-3px;" />'
			output += __('menu_options') + '</a>'
			
			output += '<a href="" onclick="BS.logout(); return false;">'
			output += '<img src="../img/close.png" id="logout" class="action" style="margin-bottom:-3px;" />'
			output += __('menu_logout') + '</a>'
			
			return output
		
	#
	logout: ->
		ajax.post '/members/destroy', '',
			->
				DB.removeAll()
				DB.init()
				bgPage.Badge.init()
				BS.load('connection')
			->
				DB.removeAll()
				DB.init()
				bgPage.Badge.init()
				BS.load('connection')
		return false