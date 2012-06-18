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

	## Réinitialise le cache (sans déconnexion)
	remove: ->
		list = ['options', 'version', 'session', 'badge', 'historic']
		for i, j of localStorage
			if i not in list
				DB.remove i
