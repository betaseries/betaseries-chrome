# Actions du menu
menu = 
	show: -> $('.action').show()
	hide: -> $('.action').hide()
	hideStatus: -> $('#status').hide()
	hideMenu: -> $('#menu').hide()

# Modèle Controller
class Controller
	
	# Vue courante
	currentView: null

	# Démarrer l'affichage du popup
	start: ->
		# init localStorage
		DB.init()
			
		# Récupération du numéro de version
		Fx.checkVersion()

		# Page d'accueil
		if Fx.logged() then BS.load("MyEpisodes") else BS.load("Connection")

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
					Cache.remove data.root.code

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
		
		# mise à jour de l'historique
		Historic.save()
		
		# affichage de la vue (cache)
		$('#page').html ''
		$('#page').html o.content() if o.content
		
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

# Modèle Vue
class View
	
	id: null
	name: null
	url: null
	params: null
	root: null

	
# Vue: ShowEpisodes
class View_ShowEpisodes extends View

	init: (url) =>
		@id = 'ShowEpisodes.' + url
		@url = '/shows/episodes/' + url
		@episodes = DB.get 'show.' + url + '.episodes'
		@show = url
	
	name: 'ShowEpisodes'
	params: '&summary=1&hide_notes=1'
	root: 'seasons'
	login: DB.get('session')?.login
	
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
	
# Vue: MemberPlanning
class View_MemberPlanning extends View

	init: (login) =>
		login ?= DB.get('session')?.login
		@id = 'MemberPlanning.' + login
		@url = '/planning/member/' + login
		@login = login
	
	name: 'MemberPlanning'
	params: "&view=unseen"
	root: 'planning'
	
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
	
# Vue: Member
class View_Member extends View

	init: (login) =>
		login ?= DB.get('session')?.login
		@id = 'Member.' + login
		@url = '/members/infos/' + login
		@login = login
	
	name: 'Member'
	root: 'member'
	
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

# Vue: MemberShows
class View_MemberShows extends View

	init: (login) =>
		login ?= DB.get('session')?.login
		@id = 'MemberShows.' + login
		@url = '/members/infos/' + login
		@login = login
	
	name: 'MemberShows'
	root: 'member'
	
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
	
# Vue: MemberNotifications
class View_MemberNotifications extends View

	id: 'MemberNotifications'
	name: 'MemberNotifications'
	url: '/members/notifications'
	root: 'notifications'
	login: DB.get('session')?.login
	
	update: (data) ->
		old_notifs = DB.get 'member.' + @login + '.notifs', []
		new_notifs = Fx.formatNotifications data
		n = Fx.concatNotifications old_notifs, new_notifs
		n = Fx.sortNotifications n
		DB.set 'member.' + @login + '.notifs', n
	
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
			n.seen = true
			nbrNotifications++	

		# on marque les notifications comme lus
		DB.set 'member.' + @login + '.notifs', data
		$('.notif').html(0).hide()
		Badge.set 'new_notifications', 0
	
		output += __('no_notifications') if nbrNotifications is 0
		return output
	
# Vue: MemberTimeline
class View_MemberTimeline extends View

	id: 'MemberTimeline'
	name: 'MemberTimeline'
	url: '/timeline/friends'
	params: '&number=10'
	root: 'timeline'
	login: DB.get('session')?.login
	
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
	
# Vue: Connection
class View_Connection extends View
	
	id: 'Connection'
	name: 'Connection'
	
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

# Vue: Registration
class View_Registration extends View
	
	id: 'Registration'
	name: 'Registration'
	
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

# Vue: ShowSearch
class View_Search extends View
	
	id: 'Search'
	name: 'Search'
	
	content: ->
		output = '<div style="height:10px;"></div>';
		output += '<form id="search">'
		output += '<input type="text" name="terms" id="terms" /> '
		output += '<input type="submit" value="chercher" />'
		output += '</form>'
		output += '<div id="suggests_shows"></div>'
		output += '<div id="suggests_members"></div>'
		output += '<div id="results_shows"></div>'
		output += '<div id="results_members"></div>'
		setTimeout (() -> $('#terms').focus()), 100
		return output

# Vue: Blog
class View_Blog extends View
	
	id: 'Blog'
	name: 'Blog'
	
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
					
		return output
