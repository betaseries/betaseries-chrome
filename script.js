$(document).ready(function(){

	var bgPage = chrome.extension.getBackgroundPage();
	
	/**
	 * Envoie des données en GET vers un des WS de Bétaséries
	 * 
	 * @param category 		Un des WS de Bétaséries
	 * @param params 		Arguments supplémentaires à envoyer
	 * @return callback		Fonction de retour
	 */
	var sendAjax = function(category, params, successCallback, errorCallback) {
		$.ajax({
			type: "POST",
			url: bgPage.url_api+category+".json",
			data: "key="+bgPage.key+params,
			dataType: "json",
			success: successCallback,
			error: function(){
				message('<img src="img/inaccurate.png" /> Mode offline!');
				errorCallback();
			}
		});
	};
	
	/**
	 * Marquer un ou des épisodes comme vu(s)
	 */
	$('.watched').livequery('click', function() { 
		var node = $(this).parent().parent();
		var season = node.attr('season');
		var number = node.attr('number');
		var show = node.parent().attr('id');
		var params = "&token="+localStorage.token+"&season="+season+"&episode="+number;
		
		// On cache les div
		while(node.hasClass('episode')){
			node.slideToggle();
			node = node.prev();
		}
		
		// On lance la requête en fond
		sendAjax("/members/watched/"+show, params, 
			function () {updateEpisodes()},
			function () {registerAction("/members/watched/"+show, params)}
		);
		return false;
	});
	
	/**
	 * HOVER - Marquer un ou des épisodes comme vu(s)
	 */
	$('.watched').livequery(function(){ 
		$(this).hover(function() { 
				$(this).css('cursor','pointer');
				$(this).attr('src', 'img/plot_green.gif');
				var node = $(this).parent().parent().prev();
				while(node.hasClass('episode')){
					node.find('.watched').attr('src', 'img/plot_green.gif');
					node = node.prev();
				}
			}, function() { 
				$(this).css('cursor','auto');
				$(this).attr('src', 'img/plot_red.gif');
				var node = $(this).parent().parent().prev();
				while(node.hasClass('episode')){
					node.find('.watched').attr('src', 'img/plot_red.gif');
					node = node.prev();
				}
			}
		); 
	}, function() { 
		$(this).unbind('mouseover').unbind('mouseout'); 
	});
	
	/**
	 * Marquer un épisode comme téléchargé ou pas
	 */
	$('.downloaded').livequery('click', function() { 
		var node = $(this).parent().parent();
		var season = node.attr('season');
		var number = node.attr('number');
		var show = node.parent().attr('id');
		var params = "&token="+localStorage.token+"&season="+season+"&episode="+number;
		
		// On rend tout de suite visible le changement
		if ($(this).attr('src') == 'img/folder.png') $(this).attr('src', 'img/folder_add.png');
		else $(this).attr('src', 'img/folder.png');
		
		sendAjax("/members/downloaded/"+show, params, 
			function () {updateEpisodes()},
			function () {registerAction("/members/downloaded/"+show, params)}
		);
		return false;
	});
	
	/**
	 * HOVER - Marquer un épisode comme téléchargé ou pas
	 */
	$('.downloaded').livequery(function(){ 
		$(this).hover(function() { 
				$(this).css('cursor','pointer');
				if ($(this).attr('src') == 'img/folder_add.png') $(this).attr('src', 'img/folder_add.png');
				if ($(this).attr('src') == 'img/folder.png') $(this).attr('src', 'img/folder_delete.png');
			}, function() { 
				$(this).css('cursor','auto');
				if ($(this).attr('src') == 'img/folder_add.png') $(this).attr('src', 'img/folder_add.png');
				if ($(this).attr('src') == 'img/folder_delete.png') $(this).attr('src', 'img/folder.png');
			}
		); 
	}, function() { 
		$(this).unbind('mouseover').unbind('mouseout'); 
	});
	
	/**
	 * Télécharger les sous-titres d'un épisodes
	 */
	$('.subs').livequery('click', function() {
		openTab($(this).attr('link'), false);
		return false;
	});
	
	var registerAction = function(category, params){
		console.log("action: "+category+params);
	};
	
	/**
	 * Ouvrir un onglet
	 */
	var openTab = function(url, selected) {
		chrome.tabs.create({"url": url, "selected": selected});
	};
	
	/**
	 * Montrer ou cacher les épisodes en trop
	 */
	$('.showEpisodes').livequery('click', function() { 
		var hiddens = $(this).parent().parent().find('div.hidden');
		hiddens.slideToggle();
		return false;
	});
	
	/**
	 * Mettre à jour le planning
	 */
	var updatePlanning = function(){
		$(".action").css('opacity', '0.5');
		$("#menu_planning").css('opacity', '1.0');
		var params = "&token="+localStorage.token+"&view=unseen";
		sendAjax("/planning/member/"+localStorage.login, params, 
			function(data) {
				localStorage.planning = JSON.stringify(data.root.planning);
				displayPlanning();
			},
			function() {
				displayPlanning();
			}
		);
	};
	
	/**
	 * Affiche le planning
	 */
	var displayPlanning = function(){
		var planning = JSON.parse(localStorage.planning);
		var output = "";
		var week = 100;
		var MAX_WEEKS = 2;
		var nbrEpisodes = 0;
		for (var e in planning){
			var today = Math.floor(new Date().getTime() /1000);
			actualWeek = Math.ceil((planning[e].date - today)/(3600*24*7));
			if (actualWeek != week){
				week = actualWeek;
				var w, hidden;
				if (week < -1) w = 'Il y a '+week+' semaines';
				else if (week == -1) w = 'La semaine dernière';
				else if (week == 0) w = 'Cette semaine';
				else if (week == 1) w = 'La semaine prochaine';
				else if (week > 1) w = 'Dans '+week+' semaines';
				if (week<-2 || week>2) hidden = ' style="display:none"';
				if (nbrEpisodes > 0) output += '</div>';
				output += '<div class="week"'+hidden+'>';
				output += '<div class="title">'+w+'</div>';
			}
		
			output += '<div class="episode">';
			
			output += '<div class="left">';
			output += '<span class="date">'+date('D d F', planning[e].date)+'</span> ';
			output += planning[e].show+' <span class="num">['+planning[e].number+']</span>';
			output += '</div>';
			
			output += '<div class="right">-';
			output += '</div>';
			
			output += '</div>';
			
			nbrEpisodes++;
		}
		hide_contents();
		$('#planning').show().html(output);
	};
	
	/**
	 * Mettre à jour les épisodes non vus
	 */
	var updateEpisodes = function(){
		$(".action").css('opacity', '0.5');
		$("#menu_episodes").css('opacity', '1.0');
		var params = "&token="+localStorage.token;
		sendAjax("/members/episodes/all", params, 
			function(data) {
				console.log('episodes online');
				localStorage.episodes = JSON.stringify(data.root.episodes);
				displayEpisodes();
			},
			function() {
				console.log('episodes offline');
				displayEpisodes();
			}
		);
	};
	
	var displayEpisodes = function(){
		var episodes = JSON.parse(localStorage.episodes);
		var show = "";
		var output = "";
		var nbrEpisodes = 0;
		var posEpisode = 1;
		var MAX_EPISODES = 5;
		for (var n in episodes) {
			// Titre de la série
			if (episodes[n].show != show) {
				// Episodes cachés
				var remain = posEpisode-MAX_EPISODES-1;
				if (remain > 0) {
					var texte1;
					if (remain == 1) texte1 = "Montrer/cacher l'épisode suivant";
					else if (remain > 1) texte1 = "Montrer/cacher les "+(posEpisode-MAX_EPISODES-1)+" épisodes suivants";
					output += '<div class="linkHidden"><img src="img/downarrow.gif" class="showEpisodes" title="'+texte1+'" /> '+texte1+'</div>';
				}
			
				if (nbrEpisodes>0) output += '</div>';
				output += '<div class="show" id="'+episodes[n].url+'">';
				output += '<div class="title">'+episodes[n].show+'</div>';
				
				show = episodes[n].show;
				posEpisode = 1;
			}
					
			// Ajout d'une ligne épisode
			var episode = episodes[n].episode;
			var season = parseFloat(""+episode[1]+episode[2]);
			var number = parseFloat(""+episode[4]+episode[5]);
				
			// Nouvel épisode
			var date = Math.floor(new Date().getTime() /1000);
			var jours = Math.floor(date/(24*3600));
			var date_0 = (24*3600)*jours-3600;
			var newShow = (episodes[n].date >= date_0);
			var classes = "";
			var hidden = "";
			if (newShow) classes = " new_show";
			if (posEpisode > MAX_EPISODES) {
				classes += ' hidden';
				hidden = ' style="display: none;"';
			}
			output += '<div class="episode'+classes+'"'+hidden+' season="'+season+'" number="'+number+'">';
				
			// Titre de l'épisode
			var texte2;
			if (posEpisode==1) texte2 = "Marquer comme vu cet épisode!";
			else if (posEpisode>1) texte2 = "Marquer comme vu ces épisodes!";
			output += '<div class="left">';
			output += '<img src="img/plot_red.gif" class="watched" title="'+texte2+'" /> <span class="num">['+episodes[n].episode+']</span> '+episodes[n].title+' ';
			if (newShow) output += '<span class="new">NEW!</span>';
			output += '</div>';
					
			// Actions
			var subs = episodes[n].subs;
			var nbSubs = 0; 
			var url = "";
			var quality = -1;
			for (var sub in subs) {
				if (subs[sub]['language'] == "VF" && subs[sub]['quality'] > quality) { 
					quality = subs[sub]['quality'];
					url = subs[sub]['url'];
				}
				nbSubs++;
			}
			var downloaded = (episodes[n].downloaded == 1);
			var imgDownloaded;
			var texte3;
			if (downloaded) {imgDownloaded = "folder"; texte3 = "Marquer comme non-téléchargé"}
			else {imgDownloaded = "folder_add"; texte3 = "Marquer comme téléchargé";}
					
			output += '<div class="right">';
			output += '<img src="img/'+imgDownloaded+'.png" class="downloaded" title="'+texte3+'" />';
			if (quality > -1) output += ' <img src="img/dl_'+quality+'.png" class="subs" link="'+url+'" quality="'+quality+'" title="Qualité SRT VF : '+quality+'/4" />';
			output += '</div>';
				
			// Clear
			output += '<div class="clear"></div>';
				
			output += '</div>';
			nbrEpisodes++;
			posEpisode++;
		}
				
		// Episodes cachés pour la dernière série
		var remain = posEpisode-MAX_EPISODES-1;
		if (remain > 0) {
			var texte4;
			if (remain == 1) texte4 = "Montrer/cacher l'épisode suivant";
			else if (remain > 1) texte4 = "Montrer/cacher les "+(posEpisode-MAX_EPISODES-1)+" épisodes suivants";
			output += '<div class="linkHidden"><img src="img/downarrow.gif" class="showEpisodes" title="'+texte4+'" /> '+texte4+'</div>';
		}
					
		bgPage.displayBadge(nbrEpisodes);
		hide_contents();
		if (nbrEpisodes==0) output = "<div>Aucun épisodes à voir!</div>";
		$('#episodes').show().html(output);
	};
	
	/**
	 * Mettre à jour "Mon profil"
	 */
	var updateInfos = function(){
		$(".action").css('opacity', '0.5');
		$("#menu_infos").css('opacity', '1.0');
		var params = "&token="+localStorage.token;
		sendAjax("/members/infos/"+localStorage.login, params, 
			function(data) {
				localStorage.infos = JSON.stringify(data.root.member);
				displayInfos();
			},
			function() {
				displayInfos();
			}
		);
	};
	
	/**
	 * Afficher "Mon profil"
	 */
	var displayInfos = function() {
		if (bgPage.connected() == false) {
			displayConnection();
		}
		else {
			var member = JSON.parse(localStorage.infos);
			output = "<table><tr>";
			output += '<td><img src="'+member.avatar+'" width="50" /></td>';
			output += '<td>'+member.login+' (<a href="" id="logout">déconnexion</a>)<br />';
			output += member.stats.badges+" badges, "+member.stats.shows+" séries<br />";
			output += member.stats.seasons+" saisons, "+member.stats.episodes+" épisodes<br />";
			output += "Avancement : "+member.stats.progress+"<br />";
			output += '</td></tr></table>';
			hide_contents();
			$('#infos').show().html(output);
		}
	};
	
	var displayConnection = function(){
		output = "";
		output += '<table><tr>';
		output += '<td>Login:</td>';
		output += '<td><input type="text" name="login" id="login" /></td>';
		output += '</tr><tr>';
		output += '<td>Password:</td>';
		output += '<td><input type="password" name="password" id="password" /></td>';
		output += '</tr></table>';
		output += '<div class="valid">';
		output += '<button id="connect">Valider</button>';
		output += '</div>';
		hide_contents();
		$('#infos').show().html(output);
	}
	
	/**
	 * Cacher les contenus
	 */
	var hide_contents = function() {
		$('#planning').hide();
		$('#episodes').hide();
		$('#infos').hide();
	};

	/**
	 * Connexion
	 */
	$('#connect').livequery('click', function() { 
		$(this).attr('disabled', 'disabled');
		var login = $('#login').attr('value');
		var password = calcMD5($('#password').attr('value'));
		var params = "&login="+login+"&password="+password;
		sendAjax("/members/auth", params, 
			function (data) {
				if (data.root.member != undefined) {
					token = data.root.member.token;
					localStorage.login = login;
					localStorage.token = data.root.member.token;
					menu('show');
					updateEpisodes();
				}
				else {
					$('#password').attr('value', '');
					message('<img src="img/inaccurate.png" /> Login et/ou password incorrects!');
					$('#connect').removeAttr('disabled');
				}
			},
			function (){
				$('#password').attr('value', '');
				$('#connect').removeAttr('disabled');
			}
		);
		return false;
	});
	
	/**
	 * Déconnexion
	 */
	$('#logout').livequery('click', function() { 
		var params = "&token="+localStorage.token;
		sendAjax("/members/destroy", params, 
			function(){
				localStorage.token = "";
				menu('hide');
				bgPage.initBadge();
				displayConnection();
			},
			function (){}
		);
		return false;
	});
	
	/**
	 * Afficher ou cacher le menu
	 */
	var menu = function(status) {
		if (status == "show") {
			$('#menu_episodes').show();
			$('#menu_infos').show();
		}
		if (status == "hide") {
			$('#menu_episodes').hide();
			$('#menu_infos').hide();
		}
	};
	
	
	$('#logoLink').click(function(){openTab('http://betaseries.com', true); return false;});
	$('#versionLink').click(function(){openTab('https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true); return false;});
	$('#menu_planning').click(function(){updatePlanning(); return false;});
	$('#menu_episodes').click(function(){updateEpisodes(); return false;});
	$('#menu_infos').click(function(){updateInfos(); return false;});
	//$('#menu_options').click(function(){displayOptions(); return false;});
	
	/**
	 * Animations de chargement
	 */
	$("#loader").bind("ajaxSend", function(){
		$(this).show();
	}).bind("ajaxComplete", function(){
		$(this).hide();
	});
	
	/**
	 * Afficher le message de confirmation
	 */
	var message = function(content) {
		$('#message').html(content);
		setTimeout(function(){
			$('#message').html('');		
		}, 1000*5);	
	};
	
	/*
	 * INIT
	 */
	if (bgPage.connected()) {
		updateEpisodes();
	}
	else {
		displayConnection();
		menu('hide');
	}
	
});