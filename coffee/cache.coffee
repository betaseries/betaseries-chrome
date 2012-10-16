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
		todelete = []
		for i, j of localStorage
				
			if i.indexOf('badge') isnt 0 && i.indexOf('historic') isnt 0 && i.indexOf('member' + DB.get('session').login + '.notifs') isnt 0 && i.indexOf('options') isnt 0 && i.indexOf('session') isnt 0 && i.indexOf('version') isnt 0
				
				todelete.push i

		for i in todelete
			DB.remove i
			#console.log i

		return true
