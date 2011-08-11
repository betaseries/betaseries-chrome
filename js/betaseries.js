/**
 * Internationalisation
 */
var __ = function(msgname){
	return chrome.i18n.getMessage(msgname);
};

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

	/**/
	currentPage: null,

	/**
	 * Mettre à jour les données de la page
	 *
	 * array o
	 * string id			Identifiant de la page
	 * string name			Nom générique de la page
	 * string url			Url de correspondance avec l'API BetaSeries
	 * string params		Paramètres supplémentaires de l'url (optionnel)
	 * string root			Nom de la racine des données reçues
	 * function view		Fonction d'affichage des données reçues
	 */
	load: function(o){
		
		// Vérification du cache de la page [3600s]
		var time = Math.floor(new Date().getTime() / 1000);
		var updatePage = DB.get('update.'+o.id, 0);
		var update = (time - updatePage > 3600 || (this.currentPage && this.currentPage.id == o.id));
		
		// Enregistrement de la page actuelle
		this.currentPage = o;
		
		// Mise à jour du cache de la page
		if (update) {
			var params = o.params || ''; 
			ajax.post(o.url, params, function (data) {
				var r = o.root;
				var tab = data.root[r];
				
				// Opérations supp. sur les données reçues
				if (o.postData) o.postData(tab);
				
				// Mise à jour du cache de la page
				DB.set('page.'+o.id, JSON.stringify(tab));
				DB.set('update.'+o.id, time);
				
				// Affichage de le page
				BS.view(o);
			}, function(){
				// Affichage de la page
				if (DB.get('page.'+o.id, null) != null) {
					BS.view(o);
				} else {
					console.log('Pas de connexion.');
				}
				
				// Affichage de la page si pas de connexion
				BS.view(o);
			});
		} else {
			// Affichage de la page
			this.view(o);
			
			// Indique qu'on utilise les données de cache
			$('#status').attr('src', '../img/plot_orange.gif');
		}
	},
	
	/**
	 * Afficher la page
	 *
	 * array o
	 */
	view: function(o){
		// Recherche et affichage des données
		if(o.url){
			var data = JSON.parse(DB.get('page.'+o.id));
			if (data) {
				$('#page').html(o.content(data));
				
				// Titre et classe
				$('#title').text(__(o.name));
				$('#page').removeClass().addClass(o.name);				
			}
		}else{ 
			var content = o.content();
			$('#page').html(content);
			
			// Titre et classe
			$('#title').text(__(o.name));
			$('#page').removeClass().addClass(o.name);			
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
	
	refresh: function(){
		this.load(this.currentPage);
	},
	
	/**
	 *
	 *
	 */
	showsDisplay: function(url){
		this.load({
			id: 'showsDisplay.'+url,
			name: 'showsDisplay',
			url: '/display/show/'+url,
			root: 'show',
			content: function(){
				output = 'test';
				return output;
			}
		});
	},
	
	/**
	 *
	 * @bug : La valeur de downloaded est fausse
	 */
	showsEpisodes: function(url, season, episode, show){
		this.load({
			id: 'showsEpisodes.'+url+'.'+'season'+'.'+episode,
			name: 'showsEpisodes',
			url: '/shows/episodes/'+url,
			params: '&season='+season+'&episode='+episode,
			root: 'seasons',
			content: function(data){
				var episode = data['0']['episodes']['0'];
				
				var title = episode.title;
				if (DB.get('options.display_global') == 'true') title = '#'+episode.global+' '+title;
				if(episode.downloaded==1) {imgDownloaded = "folder"; texte3 = "Marquer comme non-téléchargé"}
				else if(episode.downloaded==0) {imgDownloaded = "folder_off"; texte3 = "Marquer comme téléchargé";}
				
				var output = '<div id="'+url+'" season="'+data['0']['number']+'" episode="'+episode.episode+'">';
				output += '<div style="float:left; width:176px; padding-right:5px;">';
				output += 	'<div class="showtitle">'+show+'</div>';
				output += 	'<div><span class="num">['+episode.number+']</span> '+episode.title+'</div>';
				output += 	'<div><span class="date">'+Fx._date('D d F', episode.date)+'</span></div>';
				output += 	'<div style="height:10px;"></div>';
				output += 	'<div>'+episode.description+'</div>';
				output += '</div>';
				
				output += '<div style="float:left; width:100px; text-align:center;">';
				output += 	'<img src="'+episode.screen+'" width="100" style="border:1px solid #999999; padding:1px; margin-top:18px;" /><br />';
				output += 	'Note moyenne<br />'+episode.note.mean+' ('+episode.note.members+')<br />';
				output += 	'<img src="../img/'+imgDownloaded+'.png" class="downloaded" title="'+texte3+'" />';
				output += '</div>';
				output += '</div>';
				return output;
			}
		});
	},
	
	planningMember: function(login){
		if(!login) login = DB.get('member.login');
		this.load({
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
						if (diffWeek < -1) w = 'Il y a '+Math.abs(diffWeek)+' semaines';
						else if (diffWeek == -1) w = 'La semaine dernière';
						else if (diffWeek == 0) w = 'Cette semaine';
						else if (diffWeek == 1) w = 'La semaine prochaine';
						else if (diffWeek > 1) w = 'Dans '+diffWeek+' semaines';
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
		});
	},
	
	membersInfos: function(login){
		if(!login) login = DB.get('member.login');
		this.load({
			id: 'membersInfos.'+login,
			name: 'membersInfos',
			url: '/members/infos/'+login,
			root: 'member',
			content: function(data){
				var output = '';
				output += "<table><tr>";
				output += '<td><img src="'+data.avatar+'" width="50" /></td>';
				output += '<td>'+data.login+'<br />';
				output += data.stats.badges+" badges, "+data.stats.shows+" séries<br />";
				output += data.stats.seasons+" saisons, "+data.stats.episodes+" épisodes<br />";
				output += "Avancement : "+data.stats.progress+"<br />";
				output += '</td></tr></table>';
				return output;
			}
		});
	},
	
	membersEpisodes: function(lang){
		if(!lang) lang = 'all';
		this.load({	
			id: 'membersEpisodes.'+lang,
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
							var texte1;
							if (remain == 1) texte1 = "Montrer/cacher l'épisode suivant";
							else if (remain > 1) texte1 = "Montrer/cacher les "+(posEpisode-nbrEpisodesPerSerie-1)+" épisodes suivants";
							output += '<div class="linkHidden"><img src="../img/downarrow.gif" class="showEpisodes" title="'+texte1+'" /> '+texte1+'</div>';
						}
					
						if (nbrEpisodes>0) output += '</div>';
						output += '<div class="show" id="'+data[n].url+'">';
						output += '<div class="showtitle">'+data[n].show;
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
					if (posEpisode==1) texte2 = "Marquer comme vu cet épisode!";
					else if (posEpisode>1) texte2 = "Marquer comme vu ces épisodes!";
					output += '<div class="left">';
					output += '<img src="../img/plot_red.gif" class="watched" title="'+texte2+'" /> <span class="num">';
					output += '['+data[n].number+']</span> <span class="title">'+title.substring(0,22)+'</span>';
					if (title.length>22) output += "..";
					if (newShow) output += ' <span class="new">NEW!</span>';
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
						if (downloaded) {imgDownloaded = "folder"; texte3 = "Marquer comme non-téléchargé"}
						else {imgDownloaded = "folder_off"; texte3 = "Marquer comme téléchargé";}
					}
					output += '<div class="right">';
					if (data[n].downloaded != -1)
						output += '<img src="../img/'+imgDownloaded+'.png" class="downloaded" title="'+texte3+'" />';
					if (nbSubs>0) output += ' <img src="../img/srt.png" class="subs" link="'+url+'" quality="'+quality+'" title="Qualité SRT '+lang+' : '+quality+'/3" />';
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
					var texte4;
					if (remain == 1) texte4 = "Montrer/cacher l'épisode suivant";
					else if (remain > 1) texte4 = "Montrer/cacher les "+(posEpisode-nbrEpisodesPerSerie-1)+" épisodes suivants";
					output += '<div class="linkHidden"><img src="../img/downarrow.gif" class="showEpisodes" title="'+texte4+'" /> '+texte4+'</div>';
				}
							
				bgPage.badge.update();
				if (nbrEpisodes==0) output = "<div>Aucun épisode à voir !</div>";
				
				return output;
			}
		});
	},
	
	membersNotifications: function(){
		this.load({
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
				
				for(var n in data){
					output += '<div class="event '+Fx._date('D', data[n].date).toLowerCase()+'">';
					output += '<div class="left">'+data[n].html+'</div>';
					output += '<div class="right"><span class="date">'+Fx._date('D d F', data[n].date)+'</span></div>';
					output += '<div class="clear"></div>';
					output += '</div>';
					nbrNotifications++;	
				}
				
				bgPage.badge.update();
				if (nbrNotifications==0) output = "<div>Aucune notification !</div>";
				return output;
			}
		});
	},
	
	timelineFriends: function(){
		this.load({
			id: 'timelineFriends',
			name: 'timelineFriends',
			url: '/timeline/friends',
			params: '&number=10',
			root: 'timeline',
			content: function(data){
				var output = '';
				for(var n in data){
					output += '<div class="event '+Fx._date('D', data[n].date).toLowerCase()+'">';
					output += '<div class="left"><span class="login">'+data[n].login+'</span> '+data[n].html+'</div>';
					output += '<div class="right"><span class="date">'+Fx._date('D d F', data[n].date)+'</span></div>';
					output += '<div class="clear"></div>';
					output += '</div>';
				}
				return output;
			}
		});
	},
	
	connection: function(){
		this.view({
			id: 'connection',
			name: 'connection',
			content: function(){
				menu.hide();
				output = '<form id="connect">'
					+'<table><tr><td>Login :</td><td><input type="text" name="login" id="login" /></td></tr>'
					+'<tr><td>Password :</td><td><input type="password" name="password" id="password" /></td></tr>'
					+'</table>'
					+'<div class="valid"><input type="submit" value="Valider"></div>'
					+'</form>';
				return output;
			}
		});
	}, 
	
	blog: function(){
		this.view({
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
						for(var n=0; n<items.length; n++){
							var item = $(items[n]);
							output += '<div class="event">';
							output += '<div class="left">'+item.find('title').text()+'</div>';
							//output += '<div class="right"><span class="date">'+Fx._date('D d F', data[n].date)+'</span></div>';
							output += '<div class="clear"></div>';
							output += '</div>';
						}
					}
				});
				return output;
			}
		});
	}

};
