#
# Classe Database
#
#
DB =

	#
	# Initialise la BD
	# 
	init: ->
		badge = 
			value: 0
			type: 'membersEpisodes'
		
		options = 
			nbr_episodes_per_serie: 5
			badge_notification_type: 'watched'
			dl_srt_language: 'VF'
			display_global: false
			enable_ratings: false
			max_height: 200
			display_mean_note: true
			display_copy_episode: false
			display_notifications_icon: true
			mark_notifs_episode_as_seen: true
			menu_order: [
				{name: 'MemberTimeline', 		img_path: '../img/timeline.png',								visible: true}, 
				{name: 'MemberPlanning', 		img_path: '../img/planning.png',								visible: true}, 
				{name: 'MyEpisodes', 			img_path: '../img/episodes.png',								visible: true}, 
				{name: 'MemberShows', 			img_path: '../img/episodes.png',								visible: true}, 
				{name: 'Member', 				img_path: '../img/infos.png', img_style: 'margin-right: 9px;', 	visible: true}, 
				{name: 'MemberNotifications', 	img_path: '../img/notifications2.png',							visible: true}, 
				{name: 'ShowSearch', 			img_path: '../img/search.png',									visible: true}, 
				{name: 'MemberSearch', 			img_path: '../img/search.png',									visible: true}, 
				{name: 'Blog', 					img_path: '../img/blog.png',									visible: true}, 
				{name: 'Options', 				img_path: '../img/options.png',									visible: true}, 
				{name: 'Logout', 				img_path: '../img/close.png',									visible: true},
			]

		@set 'badge', badge, true
		@set 'historic', [], false
		@set 'options', options, true
		@set 'views', {}, true

		Fx.verifyOptions options
		
		version = @get 'version', null
		if version is null then @set 'version', Fx.getVersion(), true
		
	# 
	# Getter - Obtenir la valeur d'un champ de la BD
	#
	# field			<string>	Chemin + nom du champ
	# defaultValue	<object>	Valeur par défaut si champ non trouvé (optionnel)
	#
	get: (field, defaultValue) ->
		if localStorage[field]? and localStorage[field] isnt 'undefined'
		then JSON.parse localStorage[field] 
		else defaultValue

	#
	# Retourne la BD
	# 
	getAll: ->
		return localStorage
	
	#
	#  Setter - Renseigner un champ de la BD
	#
	# field	<string>	Chemin + nom du champ
	# value	<object>	Valeur à attribuer au champ
	# init	<boolean>	Ne renseigne le champ seulement s'il n'existe pas (optionnel)
	#
	set: (field, value, init) ->
		if !init or (init and !localStorage[field])
			localStorage[field] = JSON.stringify value

	#
	# Retourne la taille d'un élément en BD
	#
	# key <string>		Nom du champ (optionnel) 
	size: (key) ->
		if key?
			return Math.floor JSON.stringify(localStorage[key]).length
		else
			return Math.floor JSON.stringify(localStorage).length
	
	#
	# Supprimer un champ de la DB
	#
	# field	<string>	Chemin + nom du champ
	#
	remove: (field) ->
		localStorage.removeItem field
	
	#
	# Supprimer TOUS les champs de la BD
	#
	removeAll: ->
		localStorage.clear()
