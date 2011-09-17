$(document).ready(function(){

	var bgPage = chrome.extension.getBackgroundPage();
	
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
		var n = 0;
		while(node.hasClass('episode')){
			node.slideToggle();
			node.removeClass('episode');
			node = node.prev();
			n++;
		}
		// On supprime ces div cachés
		//$('.toDelete').remove();
		// On fait apparaitre les suivants
		$('#'+show+' .episode:hidden:lt('+n+')').slideToggle();
		
		// Mise à jour du remain
		var remain = node.parent().find('.remain');
		var newremain = parseInt(remain.text()) - n;
		remain.text(newremain);
		if (newremain<1) {
			remain.parent().hide();
		}
		
		// On lance la requête en fond
		ajax.post("/members/watched/"+show, params, 
			function () {BS.load('membersEpisodes').update(); bgPage.badge.update();},
			function () {registerAction("/members/watched/"+show, params)}
		);
		
		setTimeout(function(){
			$('#scrollbar').tinyscrollbar_update('relative');
		}, 1000);
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
	$('.downloaded').live('click', function(){
		var view = BS.currentPage.name; 
		var node = $(this).parent().parent();
		var season = node.attr('season');
		var episode = node.attr('episode');
		if (view=='membersEpisodes') var show = node.parent().attr('id');
		else if (view=='showsEpisodes') var show = node.attr('id');
		var params = "&season="+season+"&episode="+episode;
		
		// On rend tout de suite visible le changement
		if ($(this).attr('src') == '../img/folder_delete.png') $(this).attr('src', '../img/folder_add.png');
		else if ($(this).attr('src') == '../img/folder_add.png') $(this).attr('src', '../img/folder_delete.png');
		
		ajax.post("/members/downloaded/"+show, params, 
			function () {BS.load('membersEpisodes').update();},
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
			if ($(this).attr('src') == '../img/folder_off.png') $(this).attr('src', '../img/folder_add.png');
			if ($(this).attr('src') == '../img/folder.png') $(this).attr('src', '../img/folder_delete.png');
		}, 
		mouseleave: function(){ 
			$(this).css('cursor','auto');
			if ($(this).attr('src') == '../img/folder_add.png') $(this).attr('src', '../img/folder_off.png');
			if ($(this).attr('src') == '../img/folder_delete.png') $(this).attr('src', '../img/folder.png');
		}
	});
	
	/**
	 * Accéder à la fiche d'un épisode
	 */
	 $('.num').live('click', function(){
		var view = BS.currentPage.name;
		
		if (view == 'membersEpisodes') {
			var node = $(this).parent().parent();
			var url = node.parent().attr('id');
			var season = node.attr('season');
			var episode = node.attr('episode');
			var show = $('#'+url+' .showtitle').text();
		} else if (view == 'planningMember') {
			var node = $(this).parent();
			var url = node.attr('url');
			var season = node.attr('season');
			var episode = node.attr('episode');
			var show = $(this).prev().text();
		}
		
		BS.load('showsEpisodes', url, season, episode, show).refresh();
		return false;
	});
	
	/**
	 * HOVER - Accéder à la fiche d'un épisode
	 */
	$('.num').live({
		mouseenter: function(){ 
			$(this).css('cursor','pointer');
			$(this).css('color','#900');
		}, 
		mouseleave: function(){ 
			$(this).css('cursor','auto');
			$(this).css('color','#1a4377');
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
	 * Archiver une série
	 */
	$('.archive').live('click', function(){
		show = $(this).parent().parent().attr('id');
		
		// On efface la série tout de suite
		$('#'+show).slideUp();
		
		ajax.post("/shows/archive/"+show, "", 
			function () {BS.load('membersEpisodes').update();},
			function () {registerAction("/shows/archive/"+show, "")}
		);
		
		setTimeout(function(){
			$('#scrollbar').tinyscrollbar_update('relative');
		}, 1000);
		return false;
	});
	
	/**
	 * Sortir une série des archives
	 */
	$('.unarchive').live('click', function(){
		show = $(this).parent().attr('id');
		
		// On ajoute la série tout de suite
		$('#'+show).hide();
		
		ajax.post("/shows/unarchive/"+show, "", 
			function () {
				BS.load('membersEpisodes').update(); 
				BS.load('membersInfos').update();
				bgPage.badge.update();
			},
			function () {registerAction("/shows/unarchive/"+show, "")}
		);
		
		setTimeout(function(){
			$('#scrollbar').tinyscrollbar_update('relative');
		}, 1000);
		return false;
	});
	
	/**
	 * Se connecter
	 */
	$('#connect').live('submit', function(){
		var login = $('#login').val();
		var password = hex_md5($('#password').val());
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
				menu.show();
				BS.load('membersEpisodes').refresh();
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
	$('.toggleEpisodes').live('click', function() { 
		var hiddens = $(this).parent().find('div.episode.hidden');
		hiddens.slideToggle();
		
		var labelRemain = $(this).find('.labelRemain');
		console.log(labelRemain);
		if (labelRemain.text() == __('hide_episodes')) {
			labelRemain.text(__('show_episodes'));
			$(this).find('img').attr('src', '../img/downarrow.gif');
		} else {
			labelRemain.text(__('hide_episodes'));
			$(this).find('img').attr('src', '../img/uparrow.gif');
		}
		
		setTimeout(function(){
			$('#scrollbar').tinyscrollbar_update('relative');
		}, 1000);
		return false;
	});
	
	/**
	 * HOVER - Montrer ou cacher les épisodes en trop
	 */
	$('.toggleEpisodes').live({
		mouseenter: function() { 
			$(this).css('cursor','pointer');
			$(this).css('color','#900');
		},
		mouseleave: function() { 
			$(this).css('cursor','auto');
			$(this).css('color','#000');
		}
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
		.click(function(){BS.refresh(); return false;})
		.attr('title', __("refresh"));
	$('#options')
		.click(function(){openTab(chrome.extension.getURL("../html/options.html"), true); return false;})
		.attr('title', __("options"));
	$('#logout')
		.live('click', function() { 
			ajax.post("/members/destroy", '', function(){
				DB.removeAll();
				bgPage.badge.init();
				BS.load('connection').refresh();
			});
			return false;
		})
		.attr('title', __("logout"));
	$('#close')
		.click(function(){window.close(); return false;})
		.attr('title', __('close'));
	
	// MENU sections
	$('#planning')
		.live('click', function(){BS.load('planningMember').refresh(); return false;})
		.attr('title', __("planningMember"));
	$('#episodes')
		.live('click', function(){BS.load('membersEpisodes').refresh(); return false;})
		.attr('title', __("membersEpisodes"));
	$('#timeline')
		.live('click', function(){BS.load('timelineFriends').refresh(); return false;})
		.attr('title', __("timelineFriends"));
	$('#notifications')
		.live('click', function(){BS.load('membersNotifications').refresh(); return false;})
		.attr('title', __("membersNotifications"));
	$('#infos')
		.live('click', function(){BS.load('membersInfos').refresh(); return false;})
		.attr('title', __("membersInfos"));
	
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
	if (bgPage.connected()) {
		Fx._cleanCache();
		var badgeType = DB.get('badge.type', 'membersEpisodes');
		BS.load(badgeType).refresh();
	} else {
		BS.load('connection').display();
	}
	
});
