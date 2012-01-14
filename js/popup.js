$(document).ready(function(){

	var bgPage = chrome.extension.getBackgroundPage();
	
	/**
	 * Marquer un ou des épisodes comme vu(s)
	 */
	$('.watched').live('click', function(){ 
		var node = $(this).parent().parent();
		var season = node.attr('season');
		var episode = node.attr('episode');
		var nodeShow = node.parent();
		var show = nodeShow.attr('id');
		var params = "&season="+season+"&episode="+episode;
		var enable_ratings = DB.get('options.enable_ratings');
		
		var cleanEpisode = function(){
			// Si il n'y a plus d'épisodes à voir dans la série, on la cache
			if ($(nodeShow).find('.episode').length == 0) {
				nodeShow.slideToggle();
			}
			
			// On fait apparaitre les suivants
			$('#'+show+' .episode:hidden:lt('+n+')').slideToggle();
			
			// Mise à jour du remain
			var remain = nodeShow.find('.remain');
			var newremain = parseInt(remain.text()) - n;
			remain.text(newremain);
			if (newremain<1) {
				remain.parent().hide();
			}
			
			setTimeout(function(){
				$('#scrollbar1').tinyscrollbar_update('relative');
			}, 1000);
		};
		
		// On cache les div
		var n = 0;
		var next = node.next();
		while(node.hasClass('episode')){
			// Notation d'un épisode
			if (enable_ratings == 'true') {
				var nodeRight = $(node).find('.right');
				var content = "";
				for (var i=1; i<=5; i++) {
					content += '<img src="../img/star_off.gif" width="10" id="star'+i+'" class="star" title="'+i+' /5" />';
				}
				content += '<img src="../img/archive.png" width="10" class="close_stars" />';
				nodeRight.html(content);
				// Star HOVER
				$('.star')
					.on({
						mouseenter: function(){ 
							$(this).css('cursor','pointer');
							var nodeStar = $(this);
							while (nodeStar.hasClass('star')) {
								nodeStar.attr('src', '../img/star.gif');
								nodeStar = nodeStar.prev();
							}
						}, 
						mouseleave: function(){ 
							$(this).css('cursor','auto');
							var nodeStar = $(this);
							while (nodeStar.hasClass('star')) {
								nodeStar.attr('src', '../img/star_off.gif');
								nodeStar = nodeStar.prev();
							}
						},
						click: function(){
							var nodeEpisode = $(this).parent().parent();
							if (nodeEpisode.hasClass('episode')) {
								nodeEpisode.slideToggle();
								nodeEpisode.removeClass('episode');
							
								var rate = $(this).attr('id').substring(4);
								params += "&note="+rate;
								// On marque comme vu EN notant
								ajax.post("/members/watched/"+show, params, 
									function () {BS.load('membersEpisodes').update(); bgPage.badge.update();},
									function () {registerAction("/members/watched/"+show, params)}
								);
	
								cleanEpisode();
							}
						}
					});
					
				// Close Stars HOVER
				$('.close_stars')
					.on({
						mouseenter: function(){ 
							$(this).css('cursor','pointer');
							$(this).attr('src', '../img/archive_on.png');
						}, 
						mouseleave: function(){ 
							$(this).css('cursor','auto');
							$(this).attr('src', '../img/archive.png');
						},
						click: function(){
							var nodeEpisode = $(this).parent().parent();
							if (nodeEpisode.hasClass('episode')) {
								nodeEpisode.slideToggle();
								nodeEpisode.removeClass('episode');
								
								// On marque comme vu SANS noter
								ajax.post("/members/watched/"+show, params, 
									function () {BS.load('membersEpisodes').update(); bgPage.badge.update();},
									function () {registerAction("/members/watched/"+show, params)}
								);
								
								cleanEpisode();
							}
						}
					});
			} else if (enable_ratings == 'false') {
				node.slideToggle();
				node.removeClass('episode');
			}
			node = node.prev();
			n++;
		}
		
		if (enable_ratings == 'false') {
			// On marque comme vu SANS noter
			ajax.post("/members/watched/"+show, params, 
				function () {BS.load('membersEpisodes').update(); bgPage.badge.update();},
				function () {registerAction("/members/watched/"+show, params)}
			);
			
			cleanEpisode();
		}
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
	 * Accéder à la liste des commentaires d'un épisode
	 */
	$('.commentList').live('click', function(){
		var view = BS.currentPage.name; 
		var node = $(this).parent().parent();
		var season = node.attr('season');
		var episode = node.attr('episode');
		if (view=='membersEpisodes') var show = node.parent().attr('id');
		else if (view=='showsEpisodes') var show = node.attr('id');
		
		BS.load('commentsEpisode', show, season, episode).refresh();
		
		return false;
	});
	
	/**
	 * HOVER - Accéder à la liste des commentaires d'un épisode
	 */
	$('.commentList').live({
		mouseenter: function(){$(this).css('cursor','pointer');}, 
		mouseleave: function(){$(this).css('cursor','auto');}
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
		} else if (view == 'planningMember') {
			var node = $(this).parent();
			var url = node.attr('url');
			var season = node.attr('season');
			var episode = node.attr('episode');
		}
		
		BS.load('showsEpisodes', url, season, episode).refresh();
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
		Fx._openTab($(this).attr('link'), false);
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
			function () {
				BS.load('membersEpisodes').update(); 
				BS.load('membersInfos').update(); 
				bgPage.badge.update();
			},
			function () {registerAction("/shows/archive/"+show, "")}
		);
		
		setTimeout(function(){
			$('#scrollbar1').tinyscrollbar_update('relative');
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
			$('#scrollbar1').tinyscrollbar_update('relative');
		}, 1000);
		return false;
	});
	
	/**
	 * Ajoute à mes séries
	 */
	$('#showsAdd').live('click', function(){
		show = $(this).attr('href').substring(1);
		
		// On ajoute la série tout de suite
		$('#showsAdd').html(__('show_added'));
		
		ajax.post("/shows/add/"+show, "", 
			function () {
				BS.load('membersEpisodes').update(); 
				BS.load('membersInfos').update();
				bgPage.badge.update();
			},
			function () {registerAction("/shows/add/"+show, "")}
		);
		
		return false;
	});
	
	/**
	 * Retirer de mes séries
	 */
	$('#showsRemove').live('click', function(){
		show = $(this).attr('href').substring(1);
		
		// On retire la série tout de suite
		$('#showsRemove').html(__('show_removed'));
		
		ajax.post("/shows/remove/"+show, "", 
			function () {
				BS.load('membersEpisodes').update(); 
				BS.load('membersInfos').update();
				bgPage.badge.update();
			},
			function () {registerAction("/shows/remove/"+show, "")}
		);
		
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
				message('<img src="../img/inaccurate.png" /> '+__('wrong_login_or_password'));
				inputs.removeAttr('disabled');
			}
		}, function (){
			$('#password').attr('value', '');
			inputs.removeAttr('disabled');
		});
		return false;
	});
	
	/**
	 * S'inscrire
	 */
	$('#register').live('submit', function(){
		var login = $('#login').val();
		var password = $('#password').val();
		var repassword = $('#repassword').val();
		var mail = $('#mail').val();
		var inputs = $(this).find('input').attr({disabled: 'disabled'});
		var params = "&login=" + login + "&password=" + password + "&mail=" + mail;
		var pass = true;
		if (password !== repassword) {
			pass = false;
			message('<img src="../img/inaccurate.png" /> '+ __("password_not_matching") );
		}
		if (login.length > 24) {
			pass = false;
			message('<img src="../img/inaccurate.png" /> '+ __("long_login") );
		}
		if (pass) {
			ajax.post("/members/signup", params, function (data) {
				if (data.root.errors.error) {
					var err = data.root.errors.error;
					console.log("error code : " + err.code);
					message('<img src="../img/inaccurate.png" /> ' + __('err' + err.code));
					$('#password').attr('value', '');
					$('#repassword').attr('value', '');
					inputs.removeAttr('disabled');
				} else {
					BS.load('connection').display();
					$('#login').val(login);
					$('#password').val(password);
					$('#connect').trigger('submit');
				}
			}, function (){
				$('#password').attr('value', '');
				$('#repassword').attr('value', '');
				inputs.removeAttr('disabled');
			});
		} else {
			$('#password').attr('value', '');
			$('#repassword').attr('value', '');
			inputs.removeAttr('disabled');
		}
		return false;
	});
	
	/**
	 * Faire une recherche
	 */
	$('#search0').live('submit', function(){
		var terms = $('#terms').val();
		//var inputs = $(this).find('input').attr({disabled: 'disabled'});
		
		var params = "&title=" + terms;
		ajax.post("/shows/search", params, function (data) {
			if (data.root.shows != undefined) {
				var content = '<div class="showtitle">'+__('shows')+'</div>';
				for (var n in data.root.shows) {
					var show = data.root.shows[n];
					content += '<div class="episode"><a href="#" onclick="BS.load(\'showsDisplay\', \''+show.url+'\').refresh(); return false;" title="'+show.title+'">'+Fx._subFirst(show.title,25)+'</a></div>';
				}
				$('#shows-results').html(content);
			}else{
				$('#shows-results').html('<div class="episode">'+__('no_shows_found')+'</div>');
			}
			$('.viewport').css('height', Math.min($('#page').height()+10, 200));
			$('#scrollbar1').tinyscrollbar_update('relative');
		}, function (){
			//inputs.removeAttr('disabled');
		});
		
		var params = "&login=" + terms;
		ajax.post("/members/search", params, function (data) {
			if (data.root.members != undefined) {
				var content = '<div class="showtitle">'+__('members')+'</div>';
				for (var n in data.root.members) {
					var member = data.root.members[n];
					content += '<div class="episode"><a href="#" onclick="BS.load(\'membersInfos\', \''+member.login+'\').refresh(); return false;">'+Fx._subFirst(member.login,25)+'</a></div>';
				}
				$('#members-results').html(content);
			}else{
				$('#members-results').html('<div class="episode">'+__('no_members_found')+'</div>');
			}
			$('.viewport').css('height', Math.min($('#page').height()+10, 200));
			$('#scrollbar1').tinyscrollbar_update('relative');
		}, function (){
			//inputs.removeAttr('disabled');
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
	 * Montrer ou cacher les épisodes en trop
	 */
	$('.toggleEpisodes').live('click', function() { 
		var hiddens = $(this).parent().find('div.episode.hidden');
		hiddens.slideToggle();
		
		var labelRemain = $(this).find('.labelRemain');
		if (labelRemain.text() == __('hide_episodes')) {
			labelRemain.text(__('show_episodes'));
			$(this).find('img').attr('src', '../img/downarrow.gif');
		} else {
			labelRemain.text(__('hide_episodes'));
			$(this).find('img').attr('src', '../img/uparrow.gif');
		}
		
		setTimeout(function(){
			$('#scrollbar1').tinyscrollbar_update('relative');
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
	
	$('#addfriend').live('click', function(){
		var login = $(this).attr('login');
		var params = {};
		ajax.post("/members/add/"+login, params, function (data) {
			$(this).attr('href', '#removefriend');
			$(this).attr('id', 'removefriend');
			$(this).text(__('remove_from_friends', [login]));
			$('#friendshipimg').attr('src', '../img/friend_remove.png');
		});
		return false;
	});
	
	$('#removefriend').live('click', function(){
		var login = $(this).attr('login');
		var params = {};
		ajax.post("/members/delete/"+login, params, function (data) {
			$(this).attr('href', '#addfriend');
			$(this).attr('id', 'addfriend');
			$(this).text(__('add_to_friends', [login]));
			$('#friendshipimg').attr('src', '../img/friend_add.png');
		});
		return false;
	});
	
	// HEADER links
	$('#logoLink')
		.click(function(){Fx._openTab('http://betaseries.com', true);})
		.attr('title', __("logo"));
	$('#versionLink')
		.click(function(){Fx._openTab('https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true);})
		.attr('title', __("version"));
	
	// MENU actions
	$('#status')
		.click(function(){BS.refresh(); return false;})
		.attr('title', __("refresh"));
	$('#options')
		.click(function(){Fx._openTab(chrome.extension.getURL("../html/options.html"), true);})
		.attr('title', __("options"));
	$('#logout')
		.live('click', function() { 
			ajax.post("/members/destroy", '', function(){
				DB.removeAll();
				bgPage.badge.init();
				BS.load('connection').refresh();
			}, function(){
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
	$('#blog')
		.live('click', function(){BS.load('blog').refresh(); return false;})
		.attr('title', __("blog"));
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
	$('#search')
		.live('click', function(){BS.load('searchForm').display(); return false;})
		.attr('title', __("searchForm"));
	
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
	$('#scrollbar1').tinyscrollbar();
	if (bgPage.connected()) {
		Fx._cleanCache();
		var badgeType = DB.get('badge.type', 'membersEpisodes');
		BS.load(badgeType).refresh();
	} else {
		BS.load('connection').display();
	}
	
});
