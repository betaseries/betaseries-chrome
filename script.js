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
			success: function(data){
				$('#status').attr('src', 'img/plot_green.gif');
				successCallback(data);
			},
			error: function(){
				$('#status').attr('src', 'img/plot_red.gif');
				if (errorCallback) errorCallback();
			}
		});
	};
	
	/**
	 * Animations de chargement
	 */
	$("#sync").bind("ajaxSend", function(){
		$(this).show();
		$('#status').attr('src', 'img/plot_orange.gif');
	}).bind("ajaxComplete", function(){
		$(this).hide();
	});
	
	var currentPage = "";
	
	var member = {
		connected: bgPage.connected()
	};
	
	// Liste des URLS de mises à jour
	var pages = {
		'menu': {
			title: 'Menu'
		},
		'planning': {
			url: "/planning/member/"+localStorage.login,
			params: "&token="+localStorage.token+"&view=unseen",
			root: 'planning',
			title: 'Planning'
		},
		'episodes': {
			url: "/members/episodes/all",
			params: "&token="+localStorage.token,
			root: 'episodes',
			title: 'Episodes non vus'
		},
		'infos': {
			url: "/members/infos/"+localStorage.login,
			params: "&token="+localStorage.token,
			root: 'member',
			title: 'Compte'
		}
	};
	
	/**
	 * Mettre à jour les données de la page
	 */
	var update = function(page){
		// Mise à jour de la page actuelle
		currentPage = page;
		
		// Affichage du menu
		menu.show();
	
		// Affichage des données de la page
		// seulement s'il y a des données en cache
		if (localStorage[page] && localStorage[page]!="undefined"){
			view(page);
		}
		
		// Mise à jour des données de la page
		sendAjax(pages[page].url, pages[page].params, 
			function(data) {
				r = pages[page].root;
				localStorage[page] = JSON.stringify(data.root[r]);
				
				// TODO - Mise à jour des données si cache non récent
				if (true) view(page);
			}
		);
	};
	
	var view = function(page){
		// Données de la page en cache
		if (localStorage[page]) data = JSON.parse(localStorage[page]);
		
		// Affichage du titre de la page
		if (pages && pages[page] && pages[page].title) $('#title').text(pages[page].title);
		else $('#title').text('');
		
		/*********************
		  MENU
		*********************/
		if(page=='menu'){
			menu.hideStatus();
			output = "";
			output += '<a href="#" id="planning">Planning</a><br />';
			output += '<a href="#" id="episodes">Episodes non vus</a><br />';
			output += '<a href="#" id="infos">Mon compte</a>';
		}
		
		/*********************
		  PLANNING
		*********************/
		if(page=='planning'){
			var output = "";
			var week = 100;
			var MAX_WEEKS = 2;
			var nbrEpisodes = 0;
			for (var e in data){
				var today = Math.floor(new Date().getTime() /1000);
				var todayWeek = parseFloat(dateok('W', today));
				var actualWeek = parseFloat(dateok('W', data[e].date));
				var diffWeek = actualWeek - todayWeek;
				var plot = (data[e].date < today) ? "red": "orange";
				if (actualWeek != week){
					week = actualWeek;
					var w, hidden = "";
					if (diffWeek < -1) w = 'Il y a '+diffWeek+' semaines';
					else if (diffWeek == -1) w = 'La semaine dernière';
					else if (diffWeek == 0) w = 'Cette semaine';
					else if (diffWeek == 1) w = 'La semaine prochaine';
					else if (diffWeek > 1) w = 'Dans '+diffWeek+' semaines';
					if (diffWeek<-2 || diffWeek>2) hidden = ' style="display:none"';
					if (nbrEpisodes > 0) output += '</div>';
					output += '<div class="week"'+hidden+'>';
					output += '<div class="title">'+w+'</div>';
				}
			
				output += '<div class="episode '+dateok('D', data[e].date).toLowerCase()+'">';
				
				output += '<div class="left">';
				output += '<img src="img/plot_'+plot+'.gif" /> ';
				output += data[e].show+' <span class="num">['+data[e].number+']</span>';
				output += '</div>';
				
				output += '<div class="right">';
				output += '<span class="date">'+dateok('D d F', data[e].date)+'</span>';
				output += '</div>';
				
				output += '</div>';
				
				nbrEpisodes++;
			}
		}
		
		/*********************
		  EPISODES
		*********************/
		if(page=='episodes'){
			var show = "";
			var output = "";
			var nbrEpisodes = 0;
			var posEpisode = 1;
			var MAX_EPISODES = localStorage.nbr_episodes_per_serie;
			for(var n in data){
				// Titre de la série
				if (data[n].show != show) {
					// Episodes cachés
					var remain = posEpisode-MAX_EPISODES-1;
					if (remain > 0) {
						var texte1;
						if (remain == 1) texte1 = "Montrer/cacher l'épisode suivant";
						else if (remain > 1) texte1 = "Montrer/cacher les "+(posEpisode-MAX_EPISODES-1)+" épisodes suivants";
						output += '<div class="linkHidden"><img src="img/downarrow.gif" class="showEpisodes" title="'+texte1+'" /> '+texte1+'</div>';
					}
				
					if (nbrEpisodes>0) output += '</div>';
					output += '<div class="show" id="'+data[n].url+'">';
					output += '<div class="title">'+data[n].show+'</div>';
					
					show = data[n].show;
					posEpisode = 1;
				}
						
				// Ajout d'une ligne épisode
				var season = data[n].season;
				var episode = data[n].episode;
					
				// Nouvel épisode
				var date = Math.floor(new Date().getTime() /1000);
				var jours = Math.floor(date/(24*3600));
				var date_0 = (24*3600)*jours-3600;
				var newShow = (data[n].date >= date_0);
				var classes = "";
				var hidden = "";
				if (newShow) classes = " new_show";
				if (posEpisode > MAX_EPISODES) {
					classes += ' hidden';
					hidden = ' style="display: none;"';
				}
				output += '<div class="episode'+classes+'"'+hidden+' season="'+season+'" episode="'+episode+'">';
					
				// Titre de l'épisode
				var texte2;
				var title = data[n].title;
				if (posEpisode==1) texte2 = "Marquer comme vu cet épisode!";
				else if (posEpisode>1) texte2 = "Marquer comme vu ces épisodes!";
				output += '<div class="left">';
				output += '<img src="img/plot_red.gif" class="watched" title="'+texte2+'" /> <span class="num">['+data[n].number+']</span> '+title.substring(0, 20);
				if (title.length>20) output += "..";
				if (newShow) output += ' <span class="new">NEW!</span>';
				output += '</div>';
						
				// Actions
				var subs = data[n].subs;
				var nbSubs = 0; 
				var url = "";
				var quality = -1;
				for (var sub in subs) {
					if ((localStorage.dl_srt_language == "VF" || localStorage.dl_srt_language == 'ALL') && subs[sub]['language'] == "VF" && subs[sub]['quality'] > quality) { 
						quality = subs[sub]['quality'];
						url = subs[sub]['url'];
					}
					if ((localStorage.dl_srt_language == "VO" || localStorage.dl_srt_language == 'ALL') && subs[sub]['language'] == "VO" && subs[sub]['quality'] > quality) { 
						quality = subs[sub]['quality'];
						url = subs[sub]['url'];
					}
					nbSubs++;
				}
				quality = Math.floor((quality+1)/2);
				if (data[n].downloaded != -1){
					var downloaded = (data[n].downloaded == 1);
					var imgDownloaded;
					var texte3;
					if (downloaded) {imgDownloaded = "folder"; texte3 = "Marquer comme non-téléchargé"}
					else {imgDownloaded = "folder_add"; texte3 = "Marquer comme téléchargé";}
				}
				output += '<div class="right">';
				if (data[n].downloaded != -1)
					output += '<img src="img/'+imgDownloaded+'.png" class="downloaded" title="'+texte3+'" />';
				if (quality > -1) output += ' <img src="img/srt.png" class="subs" link="'+url+'" quality="'+quality+'" title="Qualité SRT VF : '+quality+'/3" />';
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
						
			bgPage.updateBadge();
			if (nbrEpisodes==0) output = "<div>Aucun épisodes à voir!</div>";
		}
		
		/*********************
		  INFOS
		*********************/
		if(page=='infos'){
			output = "<table><tr>";
			output += '<td><img src="'+data.avatar+'" width="50" /></td>';
			output += '<td>'+data.login+'<br />';
			output += data.stats.badges+" badges, "+data.stats.shows+" séries<br />";
			output += data.stats.seasons+" saisons, "+data.stats.episodes+" épisodes<br />";
			output += "Avancement : "+data.stats.progress+"<br />";
			output += '</td></tr></table>';
		}
		
		/*********************
		  CONNECTION
		*********************/
		if(page=='connection'){
			menu.hide();
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
		}
		
		// Affichage des données de la page
		$('#page').html(output);
	};
	
	/**
	 * Marquer un ou des épisodes comme vu(s)
	 */
	$('.watched').live('click', function(){ 
		var node = $(this).parent().parent();
		var season = node.attr('season');
		var episode = node.attr('episode');
		var show = node.parent().attr('id');
		var params = "&token="+localStorage.token+"&season="+season+"&episode="+episode;
		
		// On cache les div
		while(node.hasClass('episode')){
			node.slideToggle();
			node = node.prev();
		}
		
		// On lance la requête en fond
		sendAjax("/members/watched/"+show, params, 
			function () {update('episodes')},
			function () {registerAction("/members/watched/"+show, params)}
		);
		return false;
	});
	
	/**
	 * HOVER - Marquer un ou des épisodes comme vu(s)
	 */
	$('.watched').live({
		mouseenter: function(){ 
			$(this).css('cursor','pointer');
			$(this).attr('src', 'img/plot_green.gif');
			var node = $(this).parent().parent().prev();
			while(node.hasClass('episode')){
				node.find('.watched').attr('src', 'img/plot_green.gif');
				node = node.prev();
			} 
		}, 
		mouseleave: function(){ 
			$(this).css('cursor','auto');
			$(this).attr('src', 'img/plot_red.gif');
			var node = $(this).parent().parent().prev();
			while(node.hasClass('episode')){
				node.find('.watched').attr('src', 'img/plot_red.gif');
				node = node.prev();
			}
		}
	});
	
	/**
	 * Marquer un épisode comme téléchargé ou pas
	 */
	$('.downloaded').live('click', function() { 
		var node = $(this).parent().parent();
		var season = node.attr('season');
		var episode = node.attr('episode');
		var show = node.parent().attr('id');
		var params = "&token="+localStorage.token+"&season="+season+"&episode="+episode;
		
		// On rend tout de suite visible le changement
		if ($(this).attr('src') == 'img/folder.png') $(this).attr('src', 'img/folder_add.png');
		else $(this).attr('src', 'img/folder.png');
		
		sendAjax("/members/downloaded/"+show, params, 
			function () {update('episodes')},
			function () {registerAction("/members/downloaded/"+show, params)}
		);
		return false;
	});
	
	/**
	 * HOVER - Marquer un épisode comme téléchargé ou pas
	 */
	$('.downloaded').live({
		mouseenter: function(){ 
			$(this).css('cursor','pointer');
			if ($(this).attr('src') == 'img/folder_add.png') $(this).attr('src', 'img/folder_add.png');
			if ($(this).attr('src') == 'img/folder.png') $(this).attr('src', 'img/folder_delete.png');
		}, 
		mouseleave: function(){ 
			$(this).css('cursor','auto');
			if ($(this).attr('src') == 'img/folder_add.png') $(this).attr('src', 'img/folder_add.png');
			if ($(this).attr('src') == 'img/folder_delete.png') $(this).attr('src', 'img/folder.png');
		}
	});
	
	/**
	 * Télécharger les sous-titres d'un épisode
	 */
	$('.subs').live('click', function(){
		openTab($(this).attr('link'), false);
		return false;
	});
	
	/**
	 * HOVER - Télécharger les sous-titres d'un épisode
	 */
	$('.subs').live({
		mouseover: function(){ 
			$(this).css('cursor','pointer');
			var quality = $(this).attr('quality');
			$(this).attr('src', 'img/dl_'+quality+'.png');
		},
		mouseout: function(){ 
			$(this).attr('src', 'img/srt.png');
			$(this).css('cursor','auto');
		}
	});
	
	/**
	 * Enregistrer une action offline
	 */
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
	$('.showEpisodes').live('click', function() { 
		var hiddens = $(this).parent().parent().find('div.hidden');
		hiddens.slideToggle();
		return false;
	});

	/**
	 * Connexion
	 */
	$('#connect').live('click', function() { 
		$(this).attr('disabled', 'disabled');
		var login = $('#login').attr('value');
		var password = calcMD5($('#password').attr('value'));
		var params = "&login="+login+"&password="+password;
		sendAjax("/members/auth", params, 
			function (data) {
				if (data.root.member) {
					token = data.root.member.token;
					localStorage.login = login;
					localStorage.token = data.root.member.token;
					bgPage.initLocalStorage();
					update('episodes');
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
	$('#logout').live('click', function() { 
		var params = "&token="+localStorage.token;
		sendAjax("/members/destroy", params, 
			function(){
				localStorage.clear();
				bgPage.initBadge();
				view('connection');
			},
			function (){}
		);
		return false;
	});
	
	var menu = {
		show: function(){$('.action').show();},
		hide: function(){$('.action').hide();},
		hideStatus: function(){$('#status').hide();}
	};
	
	$('#logoLink').click(function(){openTab('http://betaseries.com', true); return false;});
	$('#versionLink').click(function(){openTab('https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true); return false;});
	
	$('#status').click(function(){update(currentPage); return false;});
	$('#menu').click(function(){view('menu'); return false;});
	
	$('#planning').live('click', function(){update('planning'); return false;});
	$('#episodes').live('click', function(){update('episodes'); return false;});
	$('#infos').live('click', function(){update('infos'); return false;});
	
	/**
	 * Afficher le message de confirmation
	 */
	var message = function(content) {
		$('#message').html(content);
	};
	
	/*
	 * INIT
	 */
	if(member.connected){
		update('episodes');
	}else{
		view('connection');
	}
	
});
