##
 # Background.js
 # Gestion du badge
 # 
Badge = 
	
	## Initialisation
	init: ->
		chrome.browserAction.setBadgeText {text: "?"}
		chrome.browserAction.setBadgeBackgroundColor {color: [200, 200, 200, 255]}
		return true

	## Mise à jour automatique
	 # (toutes les heures)
	autoUpdate: ->
		if logged()
			@update()
			setTimeout @update, 1000 * 3600
			return true

	## Processus de mise à jour
	update: ->
		return if !logged()
		@searchNotifs()
		@searchEpisodes()
		return true

	## Recherche de nouvelles notifications
	searchNotifs: ->
		ajax.post '/members/notifications', '', 
			(data) ->
				login = DB.get('session').login
				old_notifs = DB.get 'member.' + login + '.notifs', []
				new_notifs = Fx.formatNotifications data.root.notifications
				n = Fx.concatNotifications old_notifs, new_notifs
				n = Fx.sortNotifications n
				DB.set 'member.' + login + '.notifs', n
				nbr = Fx.checkNotifications()
				Badge.set 'notifs', nbr
			->
				Badge.cache()
		return true
	
	## Mise à jour du nombre d'épisodes total
	searchEpisodes: ->
		ajax.post '/members/episodes/all', '', 
			(data) ->
				episodes = data.root.episodes
				time = Math.floor (new Date().getTime() / 1000)
				j = 0;
				for own i of episodes

					# si l'épisode n'est pas encore diffusé, ne pas le prendre
					continue if (time - episodes[i].date < 24 * 3600) 

					badgeNotificationType = DB.get('options').badge_notification_type;
					j++ if badgeNotificationType is 'watched'
					j++ if badgeNotificationType is 'downloaded' and episodes[i].downloaded isnt "1"

				Badge.set 'episodes', j
			->
				Badge.cache()
		return true

	## Mets à jour le badge et recalcule l'affichage
	set: (type, value) ->
		b = DB.get 'badge'
		b[type] = value
		DB.set 'badge', b
		@cache()
		return true

	## Afficher les données du badge en cache
	cache: ->
		b = DB.get 'badge'
		@display(b.episodes, 'episodes') if b.episodes?
		@display(b.notifs, 'notifs') if b.notifs? && b.notifs > 0
		return true
	
	## Mettre à jour le badge
	display: (value, type) ->
		value = parseInt value
		if value is 0
			chrome.browserAction.setBadgeText {text: ''}
		else
			colors =
				notifs: [200, 50, 50, 255]
				episodes: [50, 50, 200, 255]
			chrome.browserAction.setBadgeBackgroundColor {color: colors[type]}	
			chrome.browserAction.setBadgeText {text: value.toString()}
		return true

## Retourne vrai si l'utilisateur est connecté, faux sinon
logged = -> DB.get('session', null)?

## Lancement de la mise à jour automatique
DB.init()
Badge.init()
Badge.autoUpdate()
