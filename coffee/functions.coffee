## Internationalisation
__ = (msgname, placeholders) -> 
	if msgname then chrome.i18n.getMessage msgname, placeholders

## Functions (Fx)
Fx = 
	
	##
	openTab: (url, active) ->
		active ?= false
		chrome.tabs.create {"url": url, "active": active}
		return false
	
	## Concaténe les nouvelles notifications avec les anciennes
	# et ne garde que les 20 premières
	concatNotifications: (old_notifs, new_notifs) ->
		res = old_notifs.concat new_notifs
		res = res.slice 0, 20
		return res

	## Opération suppl. quand on récupère les notifications
	# - Si type == episode, suppression
	# - Ajout de seen = false
	formatNotifications: (notifs) ->
		res = []
		for i, j of notifs
			if j.type is 'episode' && DB.get('options').mark_notifs_episode_as_seen
				j.seen = true
			res.push j
		return res

	## Trie les notifications par date décroissante
	sortNotifications: (notifs) ->
		notifs.sort (a, b) ->
			if a.date < b.date
				return -1
			if a.date > b.date
				return 1
			return 0

	## Retourne le nbre de notifications non vues
	checkNotifications: ->
		login = DB.get('session').login
		notifs = DB.get 'member.' + login + '.notifs', []
		time = Math.floor (new Date().getTime() / 1000)
		nbr = 0
		for i in notifs
			if time > i.date && !i.seen
				nbr++
		return nbr

	## Repère les options non définies et les initialise
	verifyOptions: (opt) ->
		options = DB.get('options')
		res = []
		for i, j of options
			res.push i
		for i, j of opt
			if !(i of options)
				options[i] = opt[i]
		DB.set 'options', options
	
	##
	subFirst: (str, nbr) ->
		strLength = str.length
		strSub = str.substring 0, nbr
		strSub += '..' if strSub.length < strLength 
		return strSub
	
	##
	subLast: (str, nbr) ->
		strLength = str.length;
		strSub = str.substring strLength, Math.max 0, strLength-nbr
		strSub = '..' + strSub if strSub.length < strLength
		return strSub
		
	##
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
		
	##
	toUpdate: (view) ->
		views = DB.get 'views'
		if views[view]?
			views[view].force = true
			DB.set 'views', views
	
	##
	getVersion: ->
		return chrome.app.getDetails().version
		
	##
	getNumber: (season, episode) ->
		number = 'S'
		number += '0' if season <= 9
		number += season
		number += 'E'
		number += '0' if episode <= 9
		number += episode
		return number
	
	##
	displayNumber: (number) ->
		res = ''
		res += number[1] if number[1] isnt '0'
		res += number[2]
		res += 'x'
		res += number[4]
		res += number[5]
		return res

	##
	displayNote: (note) ->
		n = if note then Math.round(note * 10) / 10 else 0
		color = 'green'
		color = 'orange' if n < 4
		color = 'red' if n < 2 
		n = '' if n is 0
		res = '<span class="note ' + color + '">' + n + '</span>'
		return res

	##
	splitNumber: (number) ->
		season = ''
		season += number[1] if number[1] isnt '0'
		season += number[2]
		episode = ''
		episode += number[4] if number[4] isnt '0'
		episode += number[5]
		season: season
		episode: episode
			
	##
	needUpdate: ->
	 	return __('no_data_found')
	 	
	##
	checkVersion: ->
		version = DB.get 'version', 0
		currVersion = Fx.getVersion()
		newVersion = version isnt currVersion
		$('#versionLink').text Fx.getVersion()
		if (newVersion) 
			DB.set 'version', currVersion
			$('#message').html(__('new_version')).show()
			# Déconnexion forcée
			BS.logout() if version <= '0.9.5'

	## Afficher un message
	message: (content) -> 
		$('#message .content').html content
		$('#message').slideDown()
		@highlight $('#message')

	# Surligner un div
	highlight: (selector) ->
		bgColor = selector.css('background-color')
		selector.animate({backgroundColor: '#FAFA97'}, 500)
		selector.animate({backgroundColor: bgColor}, 500)
		
