##
 # Classe Cache
 #
 #
Cache =

	## force à mettre à jour le cache de la vue
	force: (view) ->
		views = DB.get 'views', {}
		if views[view]?
			views[view].force = true
			DB.set 'views', views
	
	getSize: ->
		count = 0
		list = ['options', 'version', 'session', 'badge', 'historic']
		for i, j of localStorage
			if i not in list
				count += Fx.getCacheSize i
		return count

	## Exécute la maintenance qui consiste à vider le cache
	maintenance: ->
		time = Math.floor (new Date().getTime() / 1000)
		cache = DB.get 'cache', time
		if time - cache > 7 * 24 * 3600
			@remove()
			message '<img src="../img/inaccurate.png" /> Le cache de l\'extension a été vidé.'

	## Réinitialise le cache (sans déconnexion)
	remove: ->
		todelete = []
		for i, j of localStorage
				
			if i.indexOf('badge') isnt 0 && i.indexOf('historic') isnt 0 && i.indexOf('member' + DB.get('session').login + '.notifs') isnt 0 && i.indexOf('options') isnt 0 && i.indexOf('session') isnt 0 && i.indexOf('version') isnt 0
				
				todelete.push i

		for i in todelete
			DB.remove i
			#console.log i

		return true
