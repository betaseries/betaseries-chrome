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
	# - Si type == episode, décalage de 24h
	# - Ajout de seen = false
	formatNotifications: (notifs) ->
		res = []
		for i, j of notifs
			if j.type is 'episode'
				j.date += 34*3600
			j.seen = false
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
		res = '#'
		res += number[1] if number[1] isnt '0'
		res += number[2]
		res += number[4]
		res += number[5]
		return res

	##
	displayNote: (note) ->
		n = Math.round(note * 10) / 10
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
	getCacheSize: (key) ->
		if key?
			size = Math.floor JSON.stringify(localStorage[key]).length
		else
			size = Math.floor JSON.stringify(localStorage).length
		return size	
	
	##
	getCacheFormat: (size) ->
		if size < 1000
			return size + ' o'
		else if size < 1000*1000
			return (Math.floor(size /100) /10) + ' Ko'
		else
			return (Math.floor(size /1000) /1000) + ' Mo'
			
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
			session = DB.get 'session', null
			if session
				BS.logout()
		
