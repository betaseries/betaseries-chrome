##
 # Classe Database
 #
 #
DB =

	init: ->
		# OPTIONS
		@set 'options.badge_notification_type', 'watched', true
		@set 'options.dl_srt_language', 'VF', true
		@set 'options.nbr_episodes_per_serie', 5, true
		@set 'options.display_global', 'false', true
		@set 'options.enable_ratings', 'true', true
		
		# BADGE
		@set 'badge.value', 0, true
		@set 'badge.type', 'membersEpisodes', true
		
		# Historique
		@set 'historic', '[]', false
		
		# Séries minimisées (vue des épisodes non vus)
		@set 'hidden_shows', '[]', true
		
		# Episodes supplémentaires affichés (vue des épisodes non vus)
		@set 'extra_episodes', '[]', true
	
	## Getter - Obtenir la valeur d'un champ de la BD
	 #
	 # field			<string>	Chemin + nom du champ
	 # defaultValue		<object>	Valeur par défaut si champ non trouvé (optionnel)
	 # parse			<boolean>	Indique si utiliser JSON.parse() ou pas
	 #
	get: (field, defaultValue = undefined) ->
		if localStorage[field]? then localStorage[field] else defaultValue
	
	##
	 # Setter - Renseigner un champ de le BD
	 #
	 # field	<string>	Chemin + nom du champ
	 # value	<object>	Valeur à attribuer au champ
	 # init		<boolean>	Ne renseigne le champ seulement s'il n'existe pas (initialisation)
	 #
	set: (field, value, init) ->
		if !init or (init and !localStorage[field])
			localStorage[field] = value
	
	##
	 # Supprimer un champ de la DB
	 #
	 # field	<string>	Chemin + nom du champ
	 #
	remove: (field) ->
		localStorage.removeItem field
	
	##
	 # Supprimer TOUS les champs de la BD
	 #
	removeAll: ->
		localStorage.clear()
