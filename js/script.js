$(document).ready(function(){

	var bgPage = chrome.extension.getBackgroundPage();
	
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
		var ret = {};
		var n = 0;
		for(var i=0; i<arguments.length; i++){
			for(var p in arguments[i]){
				if(arguments[i].hasOwnProperty(p) && n<10){
					ret[n] = arguments[i][p];
					n++;
				}
			}
		}
		return ret;
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
	
	// Processus de connexion
	$('#connect').live('submit', function(){
		var login = $('#login').val();
		var password = calcMD5($('#password').val());
		var inputs = $(this).find('input').attr({disabled: 'disabled'});
		var params = "&login=" + login + "&password=" + password;
		ajax.post("/members/auth", params, function (data) {
			if (data.root.member != undefined) {
				message('');
				$('#connect').remove();
				token = data.root.member.token;
				DB.init();
				DB.set('member.login', login);
				DB.set('member.token', data.root.member.token);
				BS.membersEpisodes();
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
	DB.init();
	if(member.connected){
		var badgeType = DB.get('badge.type', 'membersEpisodes');
		//BS[badgeType];
		if (badgeType == 'membersEpisodes'){
			BS.membersEpisodes();
		}else if (badgeType == 'membersNotifications'){
			BS.membersNotifications();
		}
	
	}else{
		BS.connection();
	}
	
});
