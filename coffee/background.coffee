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
		@searchEpisodes()
		@searchNotifs() if DB.get('options').display_notifications_icon
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
				Badge.display()
		return true
	
	## Mise à jour du nombre d'épisodes total
	searchEpisodes: ->
		ajax.post '/members/episodes/all', '', 
			(data) ->
				episodes = data.root.episodes
				time = Math.floor (new Date().getTime() / 1000)
				last_checked = DB.get 'new_episodes_checked', null
				DB.set 'new_episodes_checked', date('Y.m.d')
				
				total_episodes = 0
				downloaded_episodes = 0
				new_episodes = 0
				
				for own i of episodes

					# si l'épisode n'est pas encore diffusé, ne pas le prendre
					continue if (time - episodes[i].date < 24 * 3600) 

					if (time - episodes[i].date < 2 * 24 * 3600) && (!last_checked || last_checked < date('Y.m.d'))
						new_episodes++
					if episodes[i].downloaded isnt "1"
						downloaded_episodes++

					total_episodes++

				Badge.set 'total_episodes', total_episodes
				Badge.set 'downloaded_episodes', downloaded_episodes
				Badge.set 'new_episodes', new_episodes if (!last_checked || last_checked < date('Y.m.d'))
			->
				Badge.display()
		return true

	## Mets à jour le badge et recalcule l'affichage
	set: (type, value) ->
		b = DB.get 'badge'
		b[type] = value
		DB.set 'badge', b
		@display()
		return true

	## Afficher les données du badge en cache
	display: ->
		options = DB.get('options')
		badgeNotificationType = options.badge_notification_type
		b = DB.get 'badge'
		if !logged()
			@render 'not_logged', '?'
			return true
		nbr = 0
		if b.total_episodes? && parseInt(b.total_episodes) > 0 && badgeNotificationType is 'watched'
			nbr += parseInt(b.total_episodes)
			@render('total_episodes', b.total_episodes)
		if b.downloaded_episodes? && parseInt(b.downloaded_episodes) > 0 && badgeNotificationType is 'downloaded'
			nbr += parseInt(b.downloaded_episodes)
			@render('downloaded_episodes', b.downloaded_episodes)
		if b.new_notifications? && parseInt(b.new_notifications) > 0
			nbr += parseInt(b.new_notifications)
			@render('new_notifications', b.new_notifications)
		if b.new_episodes? && parseInt(b.new_episodes) > 0
			nbr += parseInt(b.new_episodes)
			@render('new_episodes', b.new_episodes)
		if nbr is 0
			@render('empty', '')
		return true
	
	## Mettre à jour le badge
	render: (type, value) ->
		switch type
			when 'not_logged'
				bgColor = [200, 200, 200, 255]
			when 'total_episodes'
				bgColor = [50, 50, 200, 255]
			when 'downloaded_episodes'
				bgColor = [50, 200, 50, 255]
			when 'new_episodes'
				bgColor = [200, 50, 50, 255]
			when 'new_notifications'
				bgColor = [50, 200, 50, 255]
			when 'empty'
				bgColor = [200, 200, 200, 255]
		
		chrome.browserAction.setBadgeBackgroundColor {color: bgColor}	
		chrome.browserAction.setBadgeText {text: value.toString()}
		return true

## Retourne vrai si l'utilisateur est connecté, faux sinon
logged = -> DB.get('session', null)?

## Lancement de la mise à jour automatique
DB.init()
Badge.init()
Badge.autoUpdate()
