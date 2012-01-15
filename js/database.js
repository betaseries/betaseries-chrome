/**
 * Classe Database
 
 * @author Menencia
 */
var DB = {

	init: function(){
		// OPTIONS
		this.set('options.badge_notification_type', 'watched', true);
		this.set('options.dl_srt_language', 'VF', true);
		this.set('options.nbr_episodes_per_serie', 5, true);
		this.set('options.display_global', 'false', true);
		this.set('options.enable_ratings', 'true', true);
		
		// BADGE
		this.set('badge.value', 0, true);
		this.set('badge.type', 'membersEpisodes', true);
		
		// Historique
		this.set('historic', '[]');
		
		// Séries minimisées (vue des épisodes non vus)
		this.set('hidden_shows', '[]', true);
	},
	
	/**
	 * Getter - Obtenir la valeur d'un champ de la BD
	 *
	 * field			<string>	Chemin + nom du champ
	 * defaultValue		<object>	Valeur par défaut si champ non trouvé (optionnel)
	 * parse			<boolean>	Indique si utiliser JSON.parse() ou pas
	 *	
	 */
	get: function(field, defaultValue){
		if (!defaultValue && defaultValue!=0) 
			defaultValue = null;
		
		if(localStorage[field] !== undefined){
			defaultValue = localStorage[field];
		}
		
		return defaultValue;
	},
	
	/**
	 * Setter - Renseigner un champ de le BD
	 *
	 * field	<string>	Chemin + nom du champ
	 * value	<object>	Valeur à attribuer au champ
	 * init		<boolean>	Ne renseigne le champ seulement s'il n'existe pas (initialisation)
	 */
	set: function(field, value, init){
		if (!init) init = false;
		
		if (!init || (init && localStorage[field] === undefined)){
			localStorage[field] = value;
		}
	},
	
	/**
	 * Supprimer un champ de la DB
	 *
	 * field	<string>	Chemin + nom du champ
	 */
	remove: function(field){
		localStorage.removeItem(field);
	},
	
	/**
	 * Supprimer TOUS les champs de la BD
	 *
	 */
	removeAll: function(){
		localStorage.clear();
	}

};
