##
 # Background.js
 # Gestion du badge
 # 
badge = 
	
	## Initialise le badge
	init: ->
		chrome.browserAction.setBadgeText {text: "?"}
		chrome.browserAction.setBadgeBackgroundColor {color: [200, 200, 200, 255]}
	
	## Mets à jour le badge (notifications, puis épisodes)
	 # TODO ajouter le async
	update: ->
		# Nombre de notifications
		ajax.post '/members/notifications', '&summary=yes', 
			(data) ->
				notifs = data.root.notifications
				j = notifs.total
				DB.set 'badge',
					value: j
					type: 'membersNotifications'
				if j > 0
					badge.display j, 'membersNotifications'
				else
					# Nombre d'épisodes non vus
					ajax.post '/members/episodes/all', '', 
						(data) ->
							episodes = data.root.episodes
							j = 0;
							for own i of episodes
								badgeNotificationType = DB.get('options').badge_notification_type;
								j++ if badgeNotificationType is 'watched'
								j++ if badgeNotificationType is 'downloaded' and episodes[i].downloaded isnt "1"
							DB.set 'badge',
								value: j
								type: 'membersEpisodes'
							badge.display j, 'membersEpisodes'
						->
							value = DB.get('badge').value
							type = DB.get('badge').type
							badge.display value, type
			->
				value = DB.get('badge').value
				type = DB.get('badge').type
				badge.display value, type
	
	##
	updateCache: ->
		# affichage des épisodes non vus
		n = 0
		for i, episodes of localStorage
			if i.indexOf('episodes.') is 0
				for j, episode of JSON.parse episodes
					n++ if episode.seen
		badge.display n, 'membersEpisodes'
		
		# TODO affichage des notifications	
	
	##
	display: (value, type) ->
		if value is '0'
			chrome.browserAction.setBadgeText {text: ""}
		else
			colors =
				membersNotifications: [200, 50, 50, 255]
				membersEpisodes: [50, 50, 200, 255]
			chrome.browserAction.setBadgeBackgroundColor {color: colors[type]}	
			chrome.browserAction.setBadgeText {text: '' + value}

	## Lance la mise à jour automatique du badge
	 # Mise à jour toutes les heures
	autoUpdate: ->
		if connected()
			@update()
			setTimeout @update, 1000 * 3600

## Retourne vrai si l'utilisateur est connecté, faux sinon
connected = -> DB.get('session', null)?

## INIT
DB.init()
badge.init()
badge.autoUpdate()
