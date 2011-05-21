$(document).ready(function(){

	var bgPage = chrome.extension.getBackgroundPage();
	var options = JSON.parse(localStorage.options);
	
	/**
	 * Internationalisation
	 */
	var __ = function(msgname){
		return chrome.i18n.getMessage(msgname);
	};
	
	/**
	 * Envoie des données en POST vers un des WS de BetaSeries
	 */
	var sendAjax = function(category, params, successCallback, errorCallback) {
		params = params || '';
		$.ajax({
			type: "POST",
			url: bgPage.url_api+category+".json",
			data: "key="+bgPage.key+params+"&token="+localStorage.token,
			dataType: "json",
			success: function(data){
				$('#status').attr('src', '../img/plot_green.gif');
				if (successCallback) successCallback(data);
			},
			error: function(){
				$('#status').attr('src', '../img/plot_red.gif');
				if (errorCallback) errorCallback();
			}
		});
	};
	
	/**
	 * Animations de chargement liés à une requête ajax
	 */
	$("#sync").bind("ajaxSend", function(){
		$(this).show();
		$('#status').attr('src', '../img/plot_orange.gif');
	}).bind("ajaxComplete", function(){
		$(this).hide();
	});
	
	var currentPage = "";
	
	var member = {
		connected: bgPage.connected()
	};
	
	var menu = {
		show: function(){$('.action').show();},
		hide: function(){$('.action').hide();},
		hideStatus: function(){$('#status').hide();},
		hideMenu: function(){$('#menu').hide();}
	};
	
	/**
	 * Concaténer plusieurs objets (notifications page)
	 */
	var concat = function(){
		ret = {};
		for(var i=0; i<arguments.length; i++){
			for(p in arguments[i]){
				if(arguments[i].hasOwnProperty(p)){
					ret[p] = arguments[i][p];
				}
			}
		}
		return ret;
	};
	
	/**
	 * Mettre à jour les données de [page]
	 */
	var load = function(page, force, noCache){
	
		// Récupération de la force :)
		if(!force) force = false;
		if(!noCache) noCache = false;
		
		// Liste des URLS de mises à jour
		pages = {
			'planning': {
				url: "/planning/member/"+localStorage.login,
				params: "&view=unseen",
				root: 'planning'
			},
			'episodes': {
				url: "/members/episodes/all",
				params: "",
				root: 'episodes'
			},
			'timeline': {
				url: "/timeline/friends",
				params: "&number=10",
				root: 'timeline'
			},
			'notifications': {
				url: "/members/notifications",
				params: "",
				root: 'notifications',
			},
			'infos': {
				url: "/members/infos/"+localStorage.login,
				params: "",
				root: 'member'
			},
			'connection': {
				noData: true
			}
		};
		
		// Mise à jour de la page actuelle
		currentPage = page;
		
		// Affichage des boutons .action du menu
		menu.show();
		
		// Ajout de la classe [page] à la section
		$('#page').removeClass().addClass(page);
		
		// Affichage du titre de la page
		$('#title').text(__(page));
		
		// Affichage des données de la page
		if (!noCache) view(page);
		
		// Cache des données [1h]
		update = false;
		timestamp = Math.floor(new Date().getTime() /1000);
		if(localStorage.timestamps){
			t = JSON.parse(localStorage.timestamps);
			tPage = (t[page]) ? t[page]: 0;
		}else{
			tPage = 0;
		}
		if(timestamp - tPage > 3600){
			update = true;
			if(!localStorage.timestamps) t = {};
			t[page] = timestamp;
			localStorage.timestamps = JSON.stringify(t);
		}
		
		// Vérifie si on peut mettre à jour les données de la page
		if ((update || force) && pages[page] && pages[page].url){
			sendAjax(pages[page].url, pages[page].params, function(data){
				r = pages[page].root;
				
				// Si notifications, ne pas juste remplacer
				tab = data.root[r];
				if(page=='notifications'){
					tab1 = data.root[r];
					tab2 = JSON.parse(localStorage.p_notifications);
					tab = concat(tab1, tab2);
				}
				
				localStorage['p_'+page] = JSON.stringify(tab);
				
				// Mise à jour des données si cache non récent
				view(page);
			});
		}else{
			// Vérifie l'état de connexion
			sendAjax("/members/is_active");
		}
	};
	
	/*
	 * Affiche les données de [page]
	 */
	var view = function(page){
		// Données de la page en cache
		if (localStorage['p_'+page] && localStorage['p_'+page]!='undefined'){
			data = JSON.parse(localStorage['p_'+page]);
		}else{
			data = false;
		}
		
		// 
		output = '';
		
		/*********************
		  PLANNING
		*********************/
		if(page=='planning' && data){
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
				output += '<img src="../img/plot_'+plot+'.gif" /> ';
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
		if(page=='episodes' && data){
			var show = "";
			var nbrEpisodes = 0;
			var posEpisode = 1;
			var MAX_EPISODES = options['nbr_episodes_per_serie'];
			for(var n in data){
				// Titre de la série
				if (data[n].show != show) {
					// Episodes cachés
					var remain = posEpisode-MAX_EPISODES-1;
					if (remain > 0) {
						var texte1;
						if (remain == 1) texte1 = "Montrer/cacher l'épisode suivant";
						else if (remain > 1) texte1 = "Montrer/cacher les "+(posEpisode-MAX_EPISODES-1)+" épisodes suivants";
						output += '<div class="linkHidden"><img src="../img/downarrow.gif" class="showEpisodes" title="'+texte1+'" /> '+texte1+'</div>';
					}
				
					if (nbrEpisodes>0) output += '</div>';
					output += '<div class="show" id="'+data[n].url+'">';
					output += '<div class="title">'+data[n].show;
					output += ' <img src="../img/archive.png" class="archive" title="'+__("archive")+'" /></div>';
					
					show = data[n].show;
					posEpisode = 1;
				}
						
				// Ajout d'une ligne épisode
				var season = data[n].season;
				var episode = data[n].episode;
					
				// Nouvel épisode
				var date = Math.floor(new Date().getTime() /1000);
				var jours = Math.floor(date/(24*3600));
				var date_0 = (24*3600)*jours-2*3600;
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
				output += '<img src="../img/plot_red.gif" class="watched" title="'+texte2+'" /> <span class="num">';
				output += '['+data[n].number+']';
				//output += '#'+data[n].global;
				output += '</span> '+title.substring(0, 20);
				if (title.length>20) output += "..";
				if (newShow) output += ' <span class="new">NEW!</span>';
				output += '</div>';
						
				// Actions
				var subs = data[n].subs;
				var nbSubs = 0; 
				var url = "";
				var quality = -1;
				for(var sub in subs){
					if ((options['dl_srt_language'] == "VF" || options['dl_srt_language'] == 'ALL') && subs[sub]['language'] == "VF" && subs[sub]['quality'] > quality) { 
						quality = subs[sub]['quality'];
						url = subs[sub]['url'];
						nbSubs++;
					}
					if ((options['dl_srt_language'] == "VO" || options['dl_srt_language'] == 'ALL') && subs[sub]['language'] == "VO" && subs[sub]['quality'] > quality) { 
						quality = subs[sub]['quality'];
						url = subs[sub]['url'];
						nbSubs++;
					}
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
					output += '<img src="../img/'+imgDownloaded+'.png" class="downloaded" title="'+texte3+'" />';
				if (nbSubs>0) output += ' <img src="../img/srt.png" class="subs" link="'+url+'" quality="'+quality+'" title="Qualité SRT VF : '+quality+'/3" />';
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
				output += '<div class="linkHidden"><img src="../img/downarrow.gif" class="showEpisodes" title="'+texte4+'" /> '+texte4+'</div>';
			}
						
			bgPage.updateBadgeEpisodes();
			if (nbrEpisodes==0) output = "<div>Aucun épisode à voir !</div>";
		}
		
		/*********************
		  TIMELINE
		*********************/
		if(page=='timeline' && data){
			for(var n in data){
				output += '<div class="event '+dateok('D', data[n].date).toLowerCase()+'">';
				output += '<div class="left"><span class="login">'+data[n].login+'</span> '+data[n].html+'</div>';
				output += '<div class="right"><span class="date">'+dateok('D d F', data[n].date)+'</span></div>';
				output += '<div class="clear"></div>';
				output += '</div>';
			}
		}
		
		/*********************
		  NOTIFICATIONS
		*********************/
		if(page=='notifications' && data){
			var nbrNotifications = 0;
			
			for(var n in data){
				output += '<div class="event '+dateok('D', data[n].date).toLowerCase()+'">';
				output += '<div class="left">'+data[n].html+'</div>';
				output += '<div class="right"><span class="date">'+dateok('D d F', data[n].date)+'</span></div>';
				output += '<div class="clear"></div>';
				output += '</div>';
				nbrNotifications++;	
			}
			
			bgPage.updateBadge();
			if (nbrNotifications==0) output = "<div>Aucune notification !</div>";
		}
		
		/*********************
		  INFOS
		*********************/
		if(page=='infos' && data){
			output += "<table><tr>";
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
			
			// Création du formulaire
			output += '<form id="connect">'
				+'<table><tr><td>Login :</td><td><input type="text" name="login" id="login" /></td></tr>'
				+'<tr><td>Password :</td><td><input type="password" name="password" id="password" /></td></tr>'
				+'</table>'
				+'<div class="valid"><input type="submit" value="Valider"></div>'
				+'</form>';
			
			// Processus de connexion
			$('#connect').live('submit', function(){
				var login = $('#login').val();
				var password = calcMD5($('#password').val());
				var inputs = $(this).find('input').attr({disabled: 'disabled'});
				var params = "&login=" + login + "&password=" + password;
				sendAjax("/members/auth", params, function (data) {
					if (data.root.member != undefined) {
						message('');
						$(this).remove();
						token = data.root.member.token;
						localStorage.login = login;
						localStorage.token = data.root.member.token;
						bgPage.initLocalStorage();
						load('episodes');
					}else{
						$('#password').attr('value', '');
						message('<img src="../img/inaccurate.png" /> Login et/ou password incorrects!');
						inputs.removeAttr('disabled');
					}
				}, function (){
					$('#password').attr('value', '');
					inputs.removeAttr('disabled');
				});
				return false;
			});
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
		var params = "&season="+season+"&episode="+episode;
		
		// On cache les div
		while(node.hasClass('episode')){
			node.slideToggle();
			node = node.prev();
		}
		
		// On lance la requête en fond
		sendAjax("/members/watched/"+show, params, 
			function () {load('episodes', true, true)},
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
			$(this).attr('src', '../img/plot_green.gif');
			var node = $(this).parent().parent().prev();
			while(node.hasClass('episode')){
				node.find('.watched').attr('src', '../img/plot_green.gif');
				node = node.prev();
			} 
		}, 
		mouseleave: function(){ 
			$(this).css('cursor','auto');
			$(this).attr('src', '../img/plot_red.gif');
			var node = $(this).parent().parent().prev();
			while(node.hasClass('episode')){
				node.find('.watched').attr('src', '../img/plot_red.gif');
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
		var params = "&season="+season+"&episode="+episode;
		
		// On rend tout de suite visible le changement
		if ($(this).attr('src') == '../img/folder.png') $(this).attr('src', '../img/folder_add.png');
		else $(this).attr('src', '../img/folder.png');
		
		sendAjax("/members/downloaded/"+show, params, 
			function () {load('episodes', true, true)},
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
			if ($(this).attr('src') == '../img/folder_add.png') $(this).attr('src', '../img/folder_add.png');
			if ($(this).attr('src') == '../img/folder.png') $(this).attr('src', '../img/folder_delete.png');
		}, 
		mouseleave: function(){ 
			$(this).css('cursor','auto');
			if ($(this).attr('src') == '../img/folder_add.png') $(this).attr('src', '../img/folder_add.png');
			if ($(this).attr('src') == '../img/folder_delete.png') $(this).attr('src', '../img/folder.png');
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
		mouseenter: function(){ 
			$(this).css('cursor','pointer');
			var quality = $(this).attr('quality');
			$(this).attr('src', '../img/dl_'+quality+'.png');
		},
		mouseleave: function(){ 
			$(this).attr('src', '../img/srt.png');
			$(this).css('cursor','auto');
		}
	});
	
	/**
	 * HOVER - Faire apparaître les actions liés à la série
	 */
	$('.title').live({
		mouseenter: function(){ 
			$(this).find('img').show();
		},
		mouseleave: function(){ 
			$(this).find('img').hide();
		}
	});
	
	/**
	 * HOVER - Archiver une série
	 * @see https://www.betaseries.com/bugs/api/23
	 */
	$('.archive').live('click', function(){
		show = $(this).parent().parent().attr('id');
		
		// On efface la série tout de suite
		$('#'+show).slideUp();
		
		sendAjax("/shows/archive/"+show, "", 
			function () {load('episodes', false, true/*, true, true*/)},
			function () {registerAction("/shows/archive/"+show, "")}
		);
		return false;
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
	
	// HEADER links
	$('#logoLink')
		.click(function(){openTab('http://betaseries.com', true); return false;})
		.attr('title', __("logo"));
	$('#versionLink')
		.click(function(){openTab('https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true); return false;})
		.attr('title', __("version"));
	
	// MENU actions
	$('#status')
		.click(function(){load(currentPage, true); return false;})
		.attr('title', __("refresh"));
	$('#options')
		.click(function(){openTab(chrome.extension.getURL("../html/options.html"), true); return false;})
		.attr('title', __("options"));
	$('#logout')
		.live('click', function() { 
			var params = "";
			sendAjax("/members/destroy", params, function(){
				localStorage.clear();
				bgPage.initBadge();
				load('connection');
			});
			return false;
		})
		.attr('title', __("logout"));
	$('#close')
		.click(function(){window.close(); return false;})
		.attr('title', __('close'));
		
	$('#planning')
		.live('click', function(){load('planning'); return false;})
		.attr('title', __("planning"));
	$('#episodes')
		.live('click', function(){load('episodes'); return false;})
		.attr('title', __("episodes"));
	$('#timeline')
		.live('click', function(){load('timeline'); return false;})
		.attr('title', __("timeline"));
	$('#notifications')
		.live('click', function(){load('notifications'); return false;})
		.attr('title', __("notifications"));
	$('#infos')
		.live('click', function(){load('infos'); return false;})
		.attr('title', __("infos"));
	
	/**
	 * Afficher le message de confirmation
	 */
	var message = function(content){
		$('#message').html(content);
	};
	
	/*
	 * INIT
	 */
	bgPage.initLocalStorage();
	if(member.connected){
		url = (localStorage.badgeType!='') ? localStorage.badgeType : 'menu';
		load(url);
	}else{
		load('connection');
	}
	
});
