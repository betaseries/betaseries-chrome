menu = 
	show: -> $('.action').show()
	hide: -> $('.action').hide()
	hideStatus: -> $('#status').hide()
	hideMenu: -> $('#menu').hide()

class Controller
	
	# Objet "vue" courant
	currentView: null

	# Lancer l'affichage d'une vue
	load: (view, params...) ->
		# infos de la vue
		o = new window['View_' + view]
		
		# initialisation de la vue
		if o.init? then o.init.apply @, params

		# réaffichage de la vue ?
		sameView = @currentView? and o.id is @currentView.id
		
		# mémorisation de la vue
		@currentView = o;
		
		# affichage de la vue (cache)
		@display() if !sameView
		
		# mise à jour des données
		if o.update?
			# on montre le bouton #sync
			$('#sync').show()	
		
			# heure actuelle à la seconde près
			time = (new Date().getDate()) + '.' + (new Date().getFullYear())
			
			views = DB.get 'views', {}
			outdated = if views[o.id]? then views[o.id].time isnt time else true
			force = if views[o.id]? then views[o.id].force else true
			
			# on lance la requête de mise à jour ssi ça doit l'être
			@update() if (outdated or force)
		
		# on cache le bouton #sync
		else
			$('#sync').hide()

	# Mettre à jour les données de la vue courante
	update: ->
		# infos de la vue
		o = @currentView
		
		# paramètres
		params = o.params || ''
		
		if o.url?
			ajax.post o.url, params, 
				(data) =>
					# réception des données
					cache = data.root[o.root]
					
					# Mise à jour du cache
					Cache.maintenance data.root.code

					# infos de la vue
					time = (new Date().getDate()) + '.' + (new Date().getFullYear())
					views = DB.get 'views', {}
					views[o.id] = 
						time: time
						force: false
					DB.set 'views', views
						
					# mise à jour du cache
					o.update(cache)
					
					# affichage de la vue courante (cache)
					@display()
		
		# requête qui ne requiert pas l'API BetaSeries
		# la requête devra gérer elle-même le BS.display()
		else
			o.update()

	# Afficher la vue courante avec les données en cache
	display: ->
		# infos de la vue
		o = @currentView
		
		# TODO mise à jour de l'historique
		if bgPage.logged()
			Historic.save()
		
		# affichage de la vue (cache)
		$('#page').html ''
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

	# Réactualise la vue courante
	refresh: ->
		Fx.toUpdate @currentView.id
		args = @currentView.id.split '.'
		@load.apply @, args


class View
	
	id: null
	name: null
	url: null
	params: null
	root: null

BS = 
	
	#
	'''showsDisplay: (url) ->
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
				
				output += Content.episode e, s.title, hidden, start
			
			output += '</div></div>'
			
			return output'''

# Vue: Episode
class View_Episode extends View

	init: (url, season, episode, global) =>
		@id = 'Episode.' + url + '.' + season + '.' + episode + '.' + global
		@url = '/shows/episodes/' + url
		@params = '&season=' + season + '&episode=' + episode
		@episodes = DB.get 'show.' + url + '.episodes'
		@show = url
		@global = global
	
	name: 'showsEpisode'
	root: 'seasons'
	
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
		output += '<div class="fleft200"><a href="" url="' + @show + '" class="showtitle display_show">' + e.show + '</a></div>'
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

		if e.description?
			output += '<div class="title2">' + __('synopsis') + '</div>'
			output += '<div style="text-align: justify; margin-right: 5px;">' + e.description + '</div>'
			#output += ' <br /><i>' + date('D d F', e.date) + '</i>'
		
		if e.subs? and Object.keys(e.subs).length > 0
			output += '<div class="title2">' + __('subtitles') + '</div>'
			nbr_subs = 0
			for n of e.subs
				sub = e.subs[n]
				output += '[' + sub.quality + '] ' + sub.language + ' <a href="" class="subs" title="' + sub.file + '" link="' + sub.url + '">' + Fx.subLast(sub.file, 20) + '</a> (' + sub.source + ')<br />'
				nbr_subs++
		
		output += '<div class="title2">' + __('actions') + '</div>'
		
		# Voir les commentaires
		output += '<a href="" url="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" class="link display_comments">'
		output += '<span class="imgSyncNo"></span>' + __('see_comments', e.comments) + '</a>'
		
		# Marquer comme récupéré ou pas
		dl = if e.downloaded then 'mark_as_not_dl' else 'mark_as_dl'
		output += '<a href="" show="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" class="link downloaded">'
		output += '<span class="imgSyncOff"></span>' + __(dl) + '</a>'
		
		return output
	
	#
	'''planningMember: (login) ->
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
			nbrEpisodes = 0
			
			data = DB.get 'member.' + @login + '.planning', null
			return Fx.needUpdate() if !data
			
			for e of data
				today = Math.floor new Date().getTime() / 1000
				todayWeek = parseFloat date('W', today)
				actualWeek = parseFloat date('W', data[e].date)
				diffWeek = actualWeek - todayWeek
				plot = if data[e].date < today then "tick" else "empty"
				if diffWeek < -2 or diffWeek > 2
					continue
				if actualWeek isnt week
					week = actualWeek
					if diffWeek < -1 
						w = __('weeks_ago', [Math.abs diffWeek])
						hidden = true
					else if diffWeek is -1
						w = __('last_week')
						hidden = true
					else if diffWeek is 0
						w = __('this_week')
						hidden = false
					else if diffWeek is 1
						w = __('next_week')
					else if diffWeek > 1
						w = __('next_weeks', [diffWeek])
						hidden = false
					if nbrEpisodes > 0
						output += '</div>'
					visibleIcon = if hidden then '../img/arrow_right.gif' else '../img/arrow_down.gif'
					titleIcon = if hidden then __('maximise') else __('minimise')
					hidden = if hidden then ' hidden' else ''
					output += '<div class="week' + hidden + '">'
					output += '<div class="title"> ' 
					output += '<img src="' + visibleIcon + '" class="toggleWeek" title="' + titleIcon + '" />'
					output += w + '</div>'
			
				output += '<div class="episode ' + date('D', data[e].date).toLowerCase() + hidden + '">'
				
				output += '<div class="td wrapper-seen">'
				output += '<img src="../img/' + plot + '.png" width="11" />'
				output += '</div>'

				output += '<div class="td wrapper-title" style="width: 186px;">'
				output += '<span class="num">' + Fx.displayNumber(data[e].number) + '</span> '
				output += '<a href="" url="' + data[e].url + '" season="' + data[e].season + '" episode="' + data[e].episode + '" global="' + data[e].global + '" title="' + data[e].show + '" class="epLink display_episode">'
				output += data[e].show + '</a>'
				output += '</div>'
				
				output += '<div class="td wrapper-date">'
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
				if show.archive is '1'
					output += '<img src="../img/folder_off.png" class="icon-3" /> '
				else
					output += '<img src="../img/folder.png" class="icon-3" /> '
				output += '<a href="" url="' + show.url + '" class="epLink display_show">' + show.title + '</a>'
				output += '</div>'
			return output'''
			
# Vue: Mes épisodes
class View_MyEpisodes extends View
	
	init: (lang = 'all') =>
		@id = 'MyEpisodes.' + lang
		@url = '/members/episodes/' + lang
	
	name: 'membersEpisodes',
	root: 'episodes'
	login: DB.get('session').login
	
	update: (data) ->
		shows = DB.get 'member.' + @login + '.shows', {}
		memberEpisodes = {}
		time = Math.floor (new Date().getTime() / 1000)
		
		j = 0
		for d, e of data
			
			# si l'épisode n'est pas encore diffusé, ne pas le prendre
			continue if (time - e.date < 24 * 3600) 
			
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
				note: e.note.mean
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
		bgPage.Badge.set 'total_episodes', j
	
	content: ->
		# récupération des épisodes non vus (cache)
		data = DB.get 'member.' + @login + '.episodes', null
		return Fx.needUpdate() if !data
		
		shows = DB.get 'member.' + @login + '.shows', null
		return Fx.needUpdate() if !shows

		# mise à jour des notifications
		if bgPage.logged()
			if DB.get('options').display_notifications_icon
				nbr = Fx.checkNotifications()
				$('.notif').html(nbr).show() if nbr > 0
			else
				$('#notifications').hide()	

		# Mise à jour des notifications new_episodes
		bgPage.Badge.set 'new_episodes', 0
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
	
	#
	'''membersNotifications: () ->
		id: 'membersNotifications'
		name: 'membersNotifications'
		url: '/members/notifications'
		root: 'notifications'
		login: DB.get('session').login
		update: (data) ->
			old_notifs = DB.get 'member.' + @login + '.notifs', []
			new_notifs = Fx.formatNotifications data
			n = Fx.concatNotifications old_notifs, new_notifs
			n = Fx.sortNotifications n
			DB.set 'member.' + @login + '.notifs', n
			bgPage.Badge.set 'notifs', 0
		content: ->
			output = ''
			nbrNotifications = 0
			currDate = ''
			
			data = DB.get 'member.' + @login + '.notifs', null
			return Fx.needUpdate() if !data
			
			time = Math.floor (new Date().getTime() / 1000)
			for n in data
				continue if time < n.date
				newDate = date('D d F', n.date)
				if newDate isnt currDate
					currDate = newDate
					output += '<div class="showtitle">' + currDate + '</div>'
				output += '<div class="event ' + date('D', n.date).toLowerCase() + '">'
				output += '<span class="new">' + __('new') + '</span> ' if !n.seen
				output += n.html
				output += '</div>'
				data[n].seen = true
				nbrNotifications++	

			# on marque les notifications comme lus
			DB.set 'member.' + @login + '.notifs', data
			$('.notif').html(0).hide()
			
			output += __('no_notifications') if nbrNotifications is 0
			return output'''
	
# Vue: EpisodeComments
class View_EpisodeComments extends View

	init: (url, season, episode, global) =>
		@id = 'EpisodeComments.' + url + '.' + season + '.' + episode + '.' + global
		@url = '/comments/episode/' + url
		@params = '&season=' + season + '&episode=' + episode
		@show = url
		@season = season
		@episode = episode
		@global = global
	
	name: 'EpisodeComments'
	root: 'comments'
	
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
			output += '<small>#' + data[n].inner_id + '</small> '
			output += '<small>en réponse à #' + data[n].in_reply_to + '</small> ' if data[n].in_reply_to isnt '0'
			output += '<a href="" id="addInReplyTo" commentId="' + data[n].inner_id + '">répondre</a><br />'
			output += data[n].text
			output += '</div>'
			i++

		output += '<div class="postComment">'
		output += 	'<form method="post" id="postComment">'
		output += 		'<input type="hidden" id="show" value="' + @show + '" />'
		output += 		'<input type="hidden" id="season" value="' + @season + '" />'
		output += 		'<input type="hidden" id="episode" value="' + @episode + '" />'
		output += 		'<input type="hidden" id="inReplyTo" value="0" />'
		output += 		'<textarea name="comment" placeholder="Votre commentaire.."></textarea>'
		output += 		'<input type="submit" name="submit" value="Poster">'
		output += 		'<div id="inReplyToText" style="display:none;">En réponse à #<span id="inReplyToId"></span> '
		output += 			'(<a href="" id="removeInReplyTo">enlever</a>)</div>'
		output += 	'</form>'
		output += 	'<div class="clear"></div>
				   </div>'
		
		output += __('no_comments') if i is 1
		return output
	
	#
	'''timelineFriends: ->
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
					output += '<div class="title">' + time + '</div>'
				
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
			output += '	<a href="" class="display_registration">' + __('sign_up') + '</a></div>'
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
			output += '	<a href="#" class="display_connection">' + __('sign_in') + '</a></div>'
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
				
				link = '<a href="#" link="' + article.link + '" class="display_postblog">(' + __('read_article') + ')</a>'
				output += '<div>' + article.description.replace(/<a(.*)a>/, link) + '</div>'
				
				output += '<div style="height:11px;"></div>'
						
			return output'''
			
# Menu	
class View_Menu extends View
	id: 'menu'
	name: 'menu'
	content: ->
		output = ''

		menu_order = DB.get('options').menu_order
			
		for m in menu_order
			continue if !m.visible
			style = ''
			style = 'style="' + m.img_style + '" ' if m.img_style?
			output += '<a href="" id="menu-' + m.name + '" class="menulink">'
			output += '<img src="' + m.img_path + '" ' + style + '/>'
			output += __('menu_' + m.name) + '</a>'
		
		return output
		
	#
'''	logout: ->
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
		return false'''