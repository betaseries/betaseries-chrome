#
# Objet Cache
#
Cache =

	# Force à mettre à jour le cache de la vue courante
	force: (view) ->
		view = view.toLowerCase()
		views = DB.get 'views', {}
		if views[view]?
			views[view].force = true
			DB.set 'views', views
	
	# Retourne la taille totale des données temporaires en cache
	getSize: ->
		count = 0
		list = ['options', 'version', 'session', 'badge', 'historic']
		storage = DB.getAll()
		for i, j of storage
			if i not in list
				count += DB.size i
		return count

	# Supprime les données temporaires en cache
	remove: ->
		time = Math.floor (new Date().getTime() / 1000)
		cache = DB.get 'cache', time
		if time - cache > 1 * 24 * 3600
			
			todelete = []
			storage = DB.getAll()
			for i, j of storage
			
				if i.indexOf('badge') isnt 0 && i.indexOf('historic') isnt 0 && i.indexOf('member' + DB.get('session').login + '.notifs') isnt 0 && i.indexOf('options') isnt 0 && i.indexOf('session') isnt 0 && i.indexOf('version') isnt 0 && i.indexOf('new_episodes_checked') isnt 0
					todelete.push i

			for i in todelete
				DB.remove i

			message '<img src="../img/inaccurate.png" /> Le cache de l\'extension a été vidé.'
