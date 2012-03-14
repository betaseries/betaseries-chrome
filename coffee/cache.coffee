##
 # Classe Cache
 #
 #
Cache =

	## Supprime une vue de cache (plus subtil que DB.remove)
	remove: (view) ->
		views_to_remove = DB.get 'views_to_remove'
		for viewid, viewclass of views_to_remove
			if !(viewclass in @views)
				continue
			if viewclass is 'commentsEpisode'
				#commentsEpisode.castle.75
				#comments.castle.75
				args = viewid.split '.'
				DB.remove 'comments.' + args[1] + '.' + args[2]
				delete views_to_remove[viewid]
		DB.set 'views_to_remove', views_to_remove
