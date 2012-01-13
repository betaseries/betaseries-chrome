/**
 * Menu
 *
 */
var menu = {
	show: function(){$('.action').show();},
	hide: function(){$('.action').hide();},
	hideStatus: function(){$('#status').hide();},
	hideMenu: function(){$('#menu').hide();}
};

/**
 * Classe BetaSeries
 * Gestion des pages 
 *
 * @author Menencia
 */
var BS = {

	/* Vue actuelle */
	currentPage: null,
	
	/* Vue chargée */
	loadedPage: null,
	
	/**
	 * Charger les infos d'une page
	 *
	 */
	load: function() {
		var args = Array.prototype.slice.call(arguments);
		this.loadedPage = BS[arguments[0]].apply(args.shift(), args);
		return this;
	},

	/**
	 * Mettre à jour les données de la page && afficher la page
	 *
	 */
	refresh: function() {
		o = this.loadedPage;
		
		// Vérification du cache de la page [3600s]
		var time = Math.floor(new Date().getTime() / 1000);
		var updatePage = DB.get('update.'+o.id, 0);
		var update = (time - updatePage > 3600 || (this.currentPage && this.currentPage.id == o.id));
		
		// Mise à jour du cache de la page
		if (update) {
			BS.update(function(){
				BS.display();
			});	
		} else {
			// Affichage de la page en cache
			BS.display();
			
			// Indique qu'on utilise les données de cache
			$('#status').attr('src', '../img/plot_orange.gif');
		}
	},
	
	/**
	 * Mettre à jour les données de la page
	 *
	 */
	update: function(callback) {
		o = this.loadedPage;
		
		var params = o.params || ''; 
		ajax.post(o.url, params, function (data) {
			var r = o.root;
			var tab = data.root[r];
			
			// Opérations supp. sur les données reçues
			if (o.postData) {
				tab = o.postData(tab);
			}
			
			// Mise à jour du cache de la page
			if (tab !== undefined) {
				var time = Math.floor(new Date().getTime() / 1000);
				DB.set('page.'+o.id, JSON.stringify(tab));
				DB.set('update.'+o.id, time);
			}
			
			// Callback
			if (callback) {
				callback();
			}
		}, function() {
			// Callback
			if (callback) {
				callback();
			}
		});
	},
	
	/**
	 * Afficher la page
	 *
	 */
	display: function() {
		o = this.loadedPage;
		this.currentPage = o;
		
		// Recherche d'un cache de page existant
		var cache = DB.get('page.'+o.id, null);
		if (cache) {
			data = JSON.parse(cache);
			$('#page').html(o.content(data));
		} else {
			$('#page').html(o.content());
		}
		
		// Titre et classe
		$('#title').text(__(o.name));
		$('#page').removeClass().addClass(o.name);
		
		// Réglage de la hauteur du popup
		if ($('#page').height() >= 200) {
			$('.viewport').css('height', 200);
			$('.viewport').css('overflow', 'hidden');
			$('.scrollbar').show();
			$('#scrollbar1').tinyscrollbar_update();
		} else {
			$('.viewport').css('height', $('#page').height()+10);
			//$('.scrollbar').hide();
			$('#scrollbar1').tinyscrollbar_update();
		}
	},
	
	/**
	 * Vider le cache de la page
	 *
	 */
	clean: function(id){
		DB.remove('page.'+id);
		DB.remove('update.'+id);
	},
	
	/**
	 * Vue d'une série
	 *
	 */
	showsDisplay: function(url){
		return {
			id: 'showsDisplay.'+url,
			name: 'showsDisplay',
			url: '/shows/display/'+url,
			root: 'show',
			content: function(data){
				output  = '<img src="'+data.banner+'" width="290" height="70" alt="banner" /><br />';
				output += data.title+'<br />';
				output += data.description+'<br />';
				output += data.status+'<br />';
				output += data.note.mean+'/5 ('+data.note.members+')<br />';
				if (data.is_in_account == 1) {
					output += '<a href="#'+data.url+'" id="showsRemove">'+__('show_remove')+'</a><br />';
				} else {
					output += '<a href="#'+data.url+'" id="showsAdd">'+__('show_add')+'</a><br />';
				}
				return output;
			}
		};
	},
	
	/**
	 *
	 * @bug : La valeur de downloaded est fausse
	 */
	showsEpisodes: function(url, season, episode){
		return {
			id: 'showsEpisodes.'+url+'.'+'season'+'.'+episode,
			name: 'showsEpisodes',
			url: '/shows/episodes/'+url,
			params: '&season='+season+'&episode='+episode,
			root: 'seasons',
			content: function(data){
				var episode = data['0']['episodes']['0'];
				
				var title = episode.title;
				if (DB.get('options.display_global') == 'true') title = '#'+episode.global+' '+title;
				if(episode.downloaded==1) {imgDownloaded = "folder"; texte3 = __('mark_as_not_dl');}
				else if(episode.downloaded==0) {imgDownloaded = "folder_off"; texte3 = __('mark_as_dl');}
				
				var output = '<div id="'+url+'" season="'+data['0']['number']+'" episode="'+episode.episode+'">';
				output += '<div style="float:left; width:176px; padding-right:5px;">';
				output += 	'<div class="showtitle">'+episode.show+'</div>';
				output += 	'<div><span class="num">['+episode.number+']</span> '+episode.title+'</div>';
				output += 	'<div><span class="date">'+Fx._date('D d F', episode.date)+'</span></div>';
				output += 	'<div style="height:10px;"></div>';
				output += 	'<div>'+episode.description+'</div>';
				output += '</div>';
				
				output += '<div style="float:left; width:100px; text-align:center;">';
				output += 	'<img src="'+episode.screen+'" width="100" style="border:1px solid #999999; padding:1px; margin-top:18px;" /><br />';
				output += 	__('avg_note')+'<br />'+episode.note.mean+' ('+episode.note.members+')<br />';
				output += 	'<img src="../img/'+imgDownloaded+'.png" class="downloaded" title="'+texte3+'" /> ';
				if (episode.comments)
					output += 	'<img src="../img/comment.png" class="commentList" title="'+__('nbr_comments', [episode.comments])+'" />';
				output += '</div>';
				output += '</div>';
				
				output += '<div style="clear:both;"></div>';
				output += '<div class="showtitle">'+__('subtitles')+'</div>';
				for (var n in episode.subs) {
					var sub = episode.subs[n];
					output += '['+sub.quality+'] '+sub.language+' <a href="" class="subs" title="'+sub.file+'" link="'+sub.url+'">'+Fx._subLast(sub.file, 20)+'</a> ('+sub.source+')<br />';
				}
				return output;
			}
		};
	},
	
	planningMember: function(login){
		if(!login) login = DB.get('member.login');
		return {
			id: 'planningMember.'+login,
			name: 'planningMember',
			url: '/planning/member/'+login,
			params: "&view=unseen",
			root: 'planning',
			content: function(data){	
				var output = '';
				var week = 100;
				var MAX_WEEKS = 2;
				var nbrEpisodes = 0;
				for (var e in data){
					var today = Math.floor(new Date().getTime() /1000);
					var todayWeek = parseFloat(Fx._date('W', today));
					var actualWeek = parseFloat(Fx._date('W', data[e].date));
					var diffWeek = actualWeek - todayWeek;
					var plot = (data[e].date < today) ? "red": "orange";
					if (actualWeek != week){
						week = actualWeek;
						var w, hidden = "";
						if (diffWeek < -1) w = __('weeks_ago', [Math.abs(diffWeek)]);
						else if (diffWeek == -1) w = __('last_week');
						else if (diffWeek == 0) w = __('this_week');
						else if (diffWeek == 1) w = __('next_week');
						else if (diffWeek > 1) w = __('next_weeks', [diffWeek]);
						if (diffWeek<-2 || diffWeek>2) hidden = ' style="display:none"';
						if (nbrEpisodes > 0) output += '</div>';
						output += '<div class="week"'+hidden+'>';
						output += '<div class="showtitle">'+w+'</div>';
					}
				
					output += '<div class="episode '+Fx._date('D', data[e].date).toLowerCase()+'">';
					
					output += '<div url="'+data[e].url+'" season="'+data[e].season+'" episode="'+data[e].episode+'" class="left">';
					output += '<img src="../img/plot_'+plot+'.gif" /> ';
					output += '<span class="show">'+data[e].show+'</span> ';
					output += '<span class="num">['+data[e].number+']</span>';
					output += '</div>';
					
					output += '<div class="right">';
					output += '<span class="date">'+Fx._date('D d F', data[e].date)+'</span>';
					output += '</div>';
					
					output += '</div>';
					
					nbrEpisodes++;
				}
				return output;
			}
		};
	},
	
	membersInfos: function(login){
		if(!login) login = DB.get('member.login');
		var myLogin = (login == DB.get('member.login'));
		return {
			id: 'membersInfos.'+login,
			name: 'membersInfos',
			url: '/members/infos/'+login,
			root: 'member',
			content: function(data){
				console.log(data);
				var output = '';
				output += '<div class="showtitle">'+data.login+'</div>';
				output += '<img src="'+data.avatar+'" width="50" style="position:absolute; right:0;" />';
				output += '<div class="episode lun"><img src="../img/infos.png" class="icon"> '+__('nbr_friends', [data.stats.friends])+' </div>';
				output += '<div class="episode lun"><img src="../img/medal.png" class="icon"> '+__('nbr_badges', [data.stats.badges])+' </div>';
				output += '<div class="episode lun"><img src="../img/episodes.png" class="icon"> '+__('nbr_shows', [data.stats.shows])+' </div>';
				output += '<div class="episode lun"><img src="../img/report.png" class="icon"> '+__('nbr_seasons', [data.stats.seasons])+' </div>';
				output += '<div class="episode lun"><img src="../img/script.png" class="icon"> '+__('nbr_episodes', [data.stats.episodes])+' </div>';
				output += '<div class="episode lun"><img src="../img/location.png" class="icon">'+data.stats.progress+' <small>('+__('progress')+')</small></div>';
				
				if (myLogin) {
					output += '<div style="height:11px;"></div>';
					output += '<div class="showtitle">'+__('archived_shows')+'</div>';
					for (var i in data.shows) {
						if (data.shows[i].archive === "1") {
							output += '<div class="episode" id="'+data.shows[i].url+'">';
							output += data.shows[i].title;
							output += ' <img src="../img/unarchive.png" class="unarchive" title="'+__("unarchive")+'" />';
							output += '</div>';
						}
					}
				}
				
				return output;
			}
		};
	},
	
	membersEpisodes: function(lang){
		if(!lang) lang = 'all';
		return {	
			id: 'membersEpisodes',
			name: 'membersEpisodes',
			url: '/members/episodes/'+lang,
			root: 'episodes',
			content: function(data){
				var output = "";
				var show = "";
				var nbrEpisodes = 0;
				var posEpisode = 1;
				var nbrEpisodesPerSerie = DB.get('options.nbr_episodes_per_serie');
				for(var n in data){
					// Titre de la série
					if (data[n].show != show) {
						// Episodes cachés
						var remain = posEpisode-nbrEpisodesPerSerie-1;
						if (remain > 0) {
							output += '<div class="toggleEpisodes">';
							output += '<span class="labelRemain">' + __('show_episodes') +'</span>';
							output += ' (<span class="remain">' + remain + '</span>)';
							output += ' <img src="../img/downarrow.gif" style="margin-bottom:-2px;" />';
							output += '</div>';
						}
					
						if (nbrEpisodes>0) output += '</div>';
						output += '<div class="show" id="'+data[n].url+'">';
						output += '<div class="showtitle"><a href="" onclick="BS.load(\'showsDisplay\', \''+data[n].url+'\').refresh(); return false;" class="showtitle">'+data[n].show+'</a>';
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
					if (posEpisode > nbrEpisodesPerSerie) {
						classes += ' hidden';
						hidden = ' style="display: none;"';
					}
					output += '<div class="episode'+classes+'"'+hidden+' season="'+season+'" episode="'+episode+'">';
						
					// Titre de l'épisode
					var texte2;
					var title = data[n].title;
					if (DB.get('options.display_global') == 'true') title = '#'+data[n].global+' '+title;
					if (posEpisode==1) texte2 = __('mark_as_seen');
					else if (posEpisode>1) texte2 = __('mark_as_seen_pl');
					output += '<div class="left">';
					output += '<img src="../img/plot_red.gif" class="watched" title="'+texte2+'" /> <span class="num">';
					output += '['+data[n].number+']</span> <span class="title">'+Fx._subFirst(title,22)+'</span>';
					if (newShow) output += ' <span class="new">'+__('new')+'</span>';
					output += '</div>';
							
					// Actions
					var subs = data[n].subs;
					var nbSubs = 0; 
					var url = "";
					var quality = -1;
					var lang = "";
					for(var sub in subs){
						var dlSrtLanguage = DB.get('options.dl_srt_language');
						if ((dlSrtLanguage == "VF" || dlSrtLanguage == 'ALL') && subs[sub]['language'] == "VF" && subs[sub]['quality'] > quality) { 
							quality = subs[sub]['quality'];
							url = subs[sub]['url'];
							lang = subs[sub]['language'];
							nbSubs++;
						}
						if ((dlSrtLanguage == "VO" || dlSrtLanguage == 'ALL') && subs[sub]['language'] == "VO" && subs[sub]['quality'] > quality) { 
							quality = subs[sub]['quality'];
							url = subs[sub]['url'];
							lang = subs[sub]['language'];
							nbSubs++;
						}
					}
					quality = Math.floor((quality+1)/2);
					if (data[n].downloaded != -1){
						var downloaded = (data[n].downloaded == 1);
						var imgDownloaded;
						var texte3;
						if (downloaded) {imgDownloaded = "folder"; texte3 = __('mark_as_not_dl');}
						else {imgDownloaded = "folder_off"; texte3 = __('mark_as_dl');}
					}
					output += '<div class="right">';
					var empty = '<img src="../img/empty.png" alt="hidden" /> ';
					if (data[n].comments > 0)
						output += '<img src="../img/comment.png" class="commentList" title="'+__('nbr_comments', [data[n].comments])+'" /> ';
					else 
						output += empty;
					if (data[n].downloaded != -1)
						output += '<img src="../img/'+imgDownloaded+'.png" class="downloaded" title="'+texte3+'" /> ';
					else 
						output += empty;
					if (nbSubs>0) 
						output += '<img src="../img/srt.png" class="subs" link="'+url+'" quality="'+quality+'" title="'+__('srt_quality', [lang, quality])+'" /> ';
					output += '</div>';
						
					// Clear
					output += '<div class="clear"></div>';
						
					output += '</div>';
					nbrEpisodes++;
					posEpisode++;
				}
						
				// Episodes cachés pour la dernière série
				var remain = posEpisode-nbrEpisodesPerSerie-1;
				if (remain > 0) {
					output += '<div class="toggleEpisodes">';
					output += '<span class="labelRemain">' + __('show_episodes') +'</span>';
					output += ' (<span class="remain">' + remain + '</span>)';
					output += ' <img src="../img/downarrow.gif" style="margin-bottom:-2px;" />';
					output += '</div>';
				}
							
				bgPage.badge.update();
				if (nbrEpisodes==0) output += __('no_episodes_to_see');
				
				return output;
			}
		};
	},
	
	membersNotifications: function(){
		return {
			id: 'membersNotifications',
			name: 'membersNotifications',
			url: '/members/notifications',
			root: 'notifications',
			postData: function(tab1){
				var res = tab1;
				try{
					var temp = DB.get('page.membersNotifications', null);
					var tab2 = (temp != null) ? JSON.parse(temp) : [];
					res = Fx._concat(tab1, tab2);
			    }catch(e){
			    	console.log(e);
			    }
				return res;
			},
			content: function(data){
				var output = '';
				var nbrNotifications = 0;
				
				var date = '';
				for(var n in data){
					var new_date = Fx._date('D d F', data[n].date);
					if (new_date!=date) {
						date = new_date;
						output += '<div class="showtitle">'+date+'</div>';
					}
					output += '<div class="event '+Fx._date('D', data[n].date).toLowerCase()+'">';
					output += data[n].html;
					output += '</div>';
					nbrNotifications++;	
				}
				
				bgPage.badge.update();
				if (nbrNotifications==0) output += __('no_notifications');
				return output;
			}
		};
	},
	
	commentsEpisode: function(url, season, episode){
		return {
			id: 'commentsEpisode.'+url+'.'+season+'.'+episode,
			name: 'commentsEpisode',
			url: '/comments/episode/'+url,
			params: '&season='+season+'&episode='+episode,
			root: 'comments',
			content: function(data){
				var output = '';
				var i = 1;
				var date = '';
				for(var n in data){
					var new_date = Fx._date('D d F', data[n].date);
					if (new_date!=date) {
						date = new_date;
						output += '<div class="showtitle">'+date+'</div>';
					}
					output += '<div class="event '+Fx._date('D', data[n].date).toLowerCase()+'">';
					output += '<b>'+Fx._date('H:i', data[n].date)+'</b> ';
					output += '<span class="login">'+data[n].login+'</span> ';
					output += '<small>#'+ i +'</small><br />';
					output += data[n].text;
					output += '</div>';
					i++;
				}
				if (i==1) {
					output += __('no_comments');
				}
				return output;
			}
		};
	},
	
	timelineFriends: function(){
		return {
			id: 'timelineFriends',
			name: 'timelineFriends',
			url: '/timeline/friends',
			params: '&number=10',
			root: 'timeline',
			content: function(data){
				var output = '';
				var date = '';
				for(var n in data){
					var new_date = Fx._date('D d F', data[n].date);
					if (new_date!=date) {
						date = new_date;
						output += '<div class="showtitle">'+date+'</div>';
					}
					output += '<div class="event '+Fx._date('D', data[n].date).toLowerCase()+'">';
					output += '<b>'+Fx._date('H:i', data[n].date)+'</b> ';
					output += '<span class="login">'+data[n].login+'</span> '+data[n].html;
					output += '</div>';
				}
				return output;
			}
		};
	},
	
	connection: function(){
		return {
			id: 'connection',
			name: 'connection',
			content: function(){
				menu.hide();
				output = '<form id="connect">'
					+'<table><tr><td>'+__('login')+'</td><td><input type="text" name="login" id="login" /></td></tr>'
					+'<tr><td>'+__('password')+'</td><td><input type="password" name="password" id="password" /></td></tr>'
					+'</table>'
					+'<div class="valid"><input type="submit" value="'+__('sign_in')+'"> ou '
					+'	<a href="#" onclick="BS.load(\'registration\').display(); return false;">'+__('sign_up')+'</a></div>'
					+'</form>';
				return output;
			}
		};
	},
	
	registration: function(){
		return {
			id: 'registration',
			name: 'registration',
			content: function(){
				menu.hide();
				output = '<form id="register">'
					+'<table><tr><td>'+__('login')+'</td><td><input type="text" name="login" id="login" /></td></tr>'
					+'<tr><td>'+__('password')+'</td><td><input type="password" name="password" id="password" /></td></tr>'
					+'<tr><td>'+__('repassword')+'</td><td><input type="password" name="repassword" id="repassword" /></td></tr>'
					+'<tr><td>'+__('email')+'</td><td><input type="text" name="mail" id="mail" /></td></tr>'
					+'</table>'
					+'<div class="valid"><input type="submit" value="'+__('sign_up')+'"> ou '
					+'	<a href="#" onclick="BS.load(\'connection\').display(); return false;">'+__('sign_in')+'</a></div>'
					+'</form>';
				return output;
			}
		};
	},
	
	searchForm: function(terms){
		return {
			id: 'searchForm',
			name: 'searchForm',
			content: function(){
				output = '<form id="search0">'
					+'<input type="text" name="terms" id="terms" /> '
					+'<input type="submit" value="chercher" />'
					+'</form>'
					+'<div id="shows-results"></div>'
					+'<div id="members-results"></div>';
				setTimeout(function(){$('#terms').focus()}, 100);
				return output;
			}
		};
	},  
	
	blog: function(){
		return {
			id: 'blog',
			name: 'blog',
			content: function(){
				var output = '';
				$.ajax({
					type: 'GET',
					url: 'https://www.betaseries.com/blog/feed/',
					dataType: 'xml',
					async: false,
					success: function(data){
						var items = $(data).find('item');
						for(var n=0; n<Math.min(5,items.length); n++){
							var item = $(items[n]);
							
							var titleOrig = item.find('title').text();
							var title = titleOrig.substring(0,40);
							if (titleOrig.length>40) title += '..';
							
							output += '<div class="showtitle">'+title;
							//output += ' <span class="date">'+Fx._date('D d F', data[n].date)+'</span>';
							output += '</div>';
							
							var desc = item.find('description').text();
							var linkOrig = item.find('link').text();
							var link = '<a href="#" onclick="Fx._openTab(\''+linkOrig+'\');">('+__('read_article')+')</a>';
							output += '<div>'+desc.replace(/<a(.*)a>/, link)+'</div>';
							
							output += '<div style="height:11px;"></div>';
						}
					}
				});
				return output;
			}
		};
	}

};
