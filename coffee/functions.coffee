## Internationalisation
__ = (msgname, placeholders) -> 
	if msgname then chrome.i18n.getMessage msgname, placeholders

#
# Objet Fx (Functions)
#
Fx = 
	
	# Ouvrir un onglet
	openTab: (url, active) ->
		active ?= false
		chrome.tabs.create {"url": url, "active": active}
		return false
	
	# Concaténe les nouvelles notifications avec les anciennes et ne garde que les 20 premières
	concatNotifications: (old_notifs, new_notifs) ->
		res = old_notifs.concat new_notifs
		res = res.slice 0, 20
		return res

	# Opérations suppl. quand on récupère les notifications
	formatNotifications: (notifs) ->
		res = []
		for i, j of notifs
			j.seen = j.type is 'episode' && DB.get('options').mark_notifs_episode_as_seen
			res.push j
		return res

	# Trie les notifications par date décroissante
	sortNotifications: (notifs) ->
		notifs.sort (a, b) ->
			if a.date < b.date
				return -1
			if a.date > b.date
				return 1
			return 0

	# Retourne le nbre de notifications non vues
	checkNotifications: ->
		login = DB.get('session').login
		notifs = DB.get 'member.' + login + '.notifs', []
		time = Math.floor (new Date().getTime() / 1000)
		nbr = 0
		for i in notifs
			if time > i.date && !i.seen
				nbr++
		return nbr

	# Repère les options non définies et les initialise
	verifyOptions: (opt) ->
		options = DB.get('options')
		res = []
		for i, j of options
			res.push i
		for i, j of opt
			if !(i of options)
				options[i] = opt[i]
		DB.set 'options', options
	
	# Retourne les n premiers caractères d'une chaîne
	subFirst: (str, nbr) ->
		strLength = str.length
		strSub = str.substring 0, nbr
		strSub += '..' if strSub.length < strLength 
		return strSub
	
	# Retourne les n derniers caractères d'une chaîne
	subLast: (str, nbr) ->
		strLength = str.length;
		strSub = str.substring strLength, Math.max 0, strLength-nbr
		strSub = '..' + strSub if strSub.length < strLength
		return strSub
		
	# Met à jour la hauteur du popup
	updateHeight: (top) ->
		top ?= false
		setTimeout (
			-> 
				maxHeight = DB.get('options').max_height
				#h = $('#page').height() + 14
				#h = if h > maxHeight then maxHeight else h
				$('#about').height maxHeight
				params = if top then {scroll:'top'} else {}
				$('.nano').nanoScroller(params)
		), 500
		
	# Force la mise à jour du cache d'une vue
	toUpdate: (view) ->
		views = DB.get 'views'
		if views[view]?
			views[view].force = true
			DB.set 'views', views
	
	# Retourne la version actuelle de l'extension
	getVersion: ->
		return chrome.app.getDetails().version
		
	# Retourne le format SXXEYY d'un épisode
	getNumber: (season, episode) ->
		number = 'S'
		number += '0' if season <= 9
		number += season
		number += 'E'
		number += '0' if episode <= 9
		number += episode
		return number
	
	# Retourne le format XXxYY d'un épisode
	displayNumber: (number) ->
		res = ''
		res += number[1] if number[1] isnt '0'
		res += number[2]
		res += 'x'
		res += number[4]
		res += number[5]
		return res

	# Retourne la note moyenne d'un épisode avec un code couleur
	displayNote: (note) ->
		n = if note then Math.round(note * 10) / 10 else 0
		color = 'green'
		color = 'orange' if n < 4
		color = 'red' if n < 3
		n = '' if n is 0
		res = '<span class="note ' + color + '">' + n + '</span>'
		return res

	# Retourne la saison et le numéro d'un épisode
	splitNumber: (number) ->
		season = ''
		season += number[1] if number[1] isnt '0'
		season += number[2]
		episode = ''
		episode += number[4] if number[4] isnt '0'
		episode += number[5]
		season: season
		episode: episode
			
	# TODO Texte pour indiquer qu'il faut mettre à jour le cache de la vue
	needUpdate: ->
		if $('#sync img').attr 'src' isnt '../img/sync.gif'
			BS.refresh()
		return __('no_data_found')
	 	
	# Vérifie s'il y a une nouvelle version
	checkVersion: ->
		version = DB.get 'version', 0
		currVersion = Fx.getVersion()
		newVersion = version isnt currVersion
		$('#versionLink').text Fx.getVersion()
		if (newVersion) 
			DB.set 'version', currVersion
			$('#message').html(__('new_version')).show()
			# Déconnexion forcée
			@logout() if version <= '1.0.0'

	# Afficher un message
	message: (content) -> 
		$('#message .content').html content
		$('#message').slideDown()
		@highlight $('#message')

	# Surligner un div
	highlight: (selector) ->
		bgColor = selector.css('background-color')
		selector.animate({backgroundColor: '#FAFA97'}, 500)
		selector.animate({backgroundColor: bgColor}, 500)

	# Retourne vrai si l'utilisateur est connecté, faux sinon
	logged: -> DB.get('session', null)?

	# Se déconnecter
	logout: ->
		ajax.post '/members/destroy', ''
		DB.restart()
		Badge.init()
		BS.load 'Connection'
