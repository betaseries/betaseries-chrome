$(document).ready(function(){

	var bgPage = chrome.extension.getBackgroundPage();
	
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
		loading_start();
		bgPage.send("/members/watched/"+show, params, function (data) {
			loading_end();
			update('episodes');
		});
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
		
		loading_start();
		bgPage.send("/members/downloaded/"+show, params, function (data) {
			loading_end();
			update('episodes');
		});
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
	
	/**
	 * HOVER - Télécharger les sous-titres d'un épisodes
	 */
	$('.subs').livequery(function(){ 
		$(this).hover(function() { 
				$(this).css('cursor','pointer');
				var quality = $(this).attr('quality');
				$(this).attr('src', 'img/dlsrt_'+quality+'.png');
			}, function() { 
				$(this).attr('src', 'img/srt.png');
				$(this).css('cursor','auto');
			}
		); 
	}, function() { 
		$(this).unbind('mouseover').unbind('mouseout'); 
	});
	
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
	 * Mettre à jour et afficher le contenu de la popup
	 */
	var update = function(category) {
		loading_start();
		if (category == 'episodes') {
			var params = "&token="+localStorage.token;
			bgPage.send("/members/episodes/all", params, function (data) {
				var episodes = data.root.episodes;
				var show = "";
				var output = "";
				//var output = $('#'+category).html('');
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
							//divTitle.append(' <img src="img/downarrow.gif" class="showEpisodes" title="'+texte1+'" />');
						}
					
						/*var divSerie = $('<div class="show" id="'+episodes[n].url+'"></div>');
						var divTitle = $('<div class="title">'+episodes[n].show+'</div>');
						divSerie.append(divTitle);
						output.append(divSerie);*/
						if (nbrEpisodes>0) output += '</div>';
						output += '<div class="show" id="'+episodes[n].url+'">';
						output += '<div class="title">'+episodes[n].show+'</div>';
						
						show = episodes[n].show;
						posEpisode = 1;
					}
					
					// Ajout d'une ligne épisode
					var episode = episodes[n].episode;
					var season = parseInt(""+episode[1]+episode[2]);
					var number = parseInt(""+episode[4]+episode[5]);
					//var divEpisode = $('<div class="episode" season="'+season+'" number="'+number+'"></div>');
					//divSerie.append(divEpisode);
					
					
					// Nouvel épisode
					var date = Math.floor(new Date().getTime() /1000);
					var jours = Math.floor(date/(24*3600));
					var date_0 = (24*3600)*jours-3600;
					var newShow = (episodes[n].date >= date_0);
					/*if (newShow) divEpisode.addClass('new_show');
					if (posEpisode > MAX_EPISODES) {
						divEpisode.addClass('hidden');
						divEpisode.hide();
					}*/
					var classes = "";
					var hidden = "";
					if (newShow) classes = " new_show";
					if (posEpisode > MAX_EPISODES) {
						classes += ' hidden';
						hidden = ' style="display: none;"';
					}
					output += '<div class="episode'+classes+'"'+hidden+' season="'+season+'" number="'+number+'">';
					// Titre de l'épisode
					//var leftPart = $('<div class="left"></div>');
					var texte2;
					if (posEpisode==1) texte2 = "Marquer comme vu cet épisode!";
					else if (posEpisode>1) texte2 = "Marquer comme vu ces épisodes!";
					output += '<div class="left">';
					output += '<img src="img/plot_red.gif" class="watched" title="'+texte2+'" /> <span class="num">['+episodes[n].episode+']</span> '+episodes[n].title+' ';
					if (newShow) output += '<span class="new">NEW!</span>';
					output += '</div>';
					//leftPart.append('<img src="img/plot_red.gif" class="watched" title="'+texte2+'" /> <span class="num">['+episodes[n].episode+']</span> '+episodes[n].title+' ');
					//if (newShow) leftPart.append('<span class="new">NEW</span>');
					//divEpisode.append(leftPart);
					
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
					/*var rightPart = $('<div class="right"></div>');
					
					rightPart.append('<img src="img/'+imgDownloaded+'.png" class="downloaded" title="'+texte3+'" />');
					if (quality > -1) {rightPart.append(' <img src="img/srt.png" class="subs" link="'+url+'" quality="'+quality+'" title="Qualité SRT VF : '+quality+'/5" />');}
					divEpisode.append(rightPart);*/
					
					output += '<div class="right">';
					output += '<img src="img/'+imgDownloaded+'.png" class="downloaded" title="'+texte3+'" />';
					if (quality > -1) output += ' <img src="img/srt.png" class="subs" link="'+url+'" quality="'+quality+'" title="Qualité SRT VF : '+quality+'/5" />';
					output += '</div>';
					
					// Clear
					//divEpisode.append('<div class="clear"></div>');
					output += '<div class="clear"></div>';
					
					output += '</div>';
					nbrEpisodes++;
					posEpisode++;
					//alert(nbrEpisodes);
					
				}
				
				// Episodes cachés pour la dernière série
				var remain = posEpisode-MAX_EPISODES-1;
                if (remain > 0) {
                    var texte4;
                    if (remain == 1) texte4 = "Montrer/cacher l'épisode suivant";
                    else if (remain > 1) texte4 = "Montrer/cacher les "+(posEpisode-MAX_EPISODES-1)+" épisodes suivants";
                    output += '<div class="linkHidden"><img src="img/downarrow.gif" class="showEpisodes" title="'+texte4+'" /> '+texte4+'</div>';
                    //divTitle.append(' <img src="img/downarrow.gif" class="showEpisodes" title="'+texte1+'" />');
                }
						
				chrome.browserAction.setBadgeText({text: ""+nbrEpisodes});
				chrome.browserAction.setBadgeBackgroundColor({color: [150, 0, 0, 255]});
				hide_contents();
				$('#'+category).show().html(output);
				loading_end();
			});
		}
		if (category == 'infos') {
			if (bgPage.connected() == false) {
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
				$('#'+category).show().html(output);
				loading_end();
			}
			else {
				var params = "&token="+localStorage.token;
				bgPage.send("/members/infos/"+localStorage.login, params, function (data) {
					var member = data.root.member;
					output = "<table><tr>";
					output += '<td><img src="'+member.avatar+'" width="50" /></td>';
					output += '<td>'+member.login+' (<a href="" id="logout">déconnexion</a>)<br />';
					output += member.stats.badges+" badges, "+member.stats.shows+" séries<br />";
					output += member.stats.seasons+" saisons, "+member.stats.episodes+" épisodes<br />";
					output += "Avancement : "+member.stats.progress+"<br />";
					output += '</td></tr></table>';
					hide_contents();
					$('#'+category).show().html(output);
					loading_end();
				});
			}
		}
	};
	
	/**
	 * Cacher les contenus
	 */
	var hide_contents = function() {
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
		loading_start();
		bgPage.send("/members/auth", params, function (data) {
			if (data.root.member != undefined) {
				token = data.root.member.token;
				localStorage.login = login;
				localStorage.token = data.root.member.token;
				menu('show');
				loading_end();
				update('episodes');
			}
			else {
				$('#password').attr('value', '');
				message('Login et/ou password incorrects!');
				$('#connect').removeAttr('disabled');
				loading_end();	
			}
		});
		return false;
	});
	
	/**
	 * Déconnexion
	 */
	$('#logout').livequery('click', function() { 
		var params = "&token="+localStorage.token;
		loading_start();
		bgPage.send("/members/destroy", params, function (data) {
			localStorage.token = "";
			menu('hide');
			bgPage.init_badge();
			loading_end();
			update('infos');
		});
		return false;
	});
	
	/**
	 * Afficher ou cacher le menu
	 */
	var menu = function(status) {
		if (status == "show") {
			$('#menuEpisodes').show();
			$('#menuInfos').show();
		}
		if (status == "hide") {
			$('#menuEpisodes').hide();
			$('#menuInfos').hide();
		}
	};
	
	
	$('#logoLink').click(function(){openTab('http://betaseries.com', true); return false;});
	$('#versionLink').click(function(){openTab('https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true); return false;});
	$('#menuEpisodes').click(function(){update('episodes'); return false;});
	$('#menuInfos').click(function(){update('infos'); return false;});
	
	/**
	 * Afficher le message de confirmation
	 */
	var message = function(content) {
		$('#message').html(content);
		setTimeout(function(){
			$('#message').html('');		
		}, 1000*5);	
	};
	
	/**
	 * Animations de chargement
	 */
	function loading_start() {$('#loader').show()}
	function loading_end() {$('#loader').hide()}
	
	
	/*
	 * INIT
	 */
	if (bgPage.connected()) {
		//hide_contents();
		update('episodes');
	}
	else {
		update('infos');
		menu('hide');
		//logout();
	}
	
});